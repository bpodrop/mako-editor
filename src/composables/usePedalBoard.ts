import { ref, type Ref } from 'vue';
import { getPedalByDevice, listPedals } from '../config/pedalConfig';
import { BOARD_STORAGE_KEY, isLegacySnapshotsKey, isLegacyValuesKey, legacyChannelKey, legacyDeviceFromSnapshotsKey, legacyDeviceFromValuesKey, snapshotsStorageKey, valuesStorageKey } from './storageKeys';
import { asMidiChannel, isMidiChannel, type MidiChannel } from '../core/entities/midi';
import type { StoredControlValues } from './useControlValues';
import type { StoredSnapshotsPayload } from './useSnapshots';

export interface PedalInstance {
  id: string;
  device: string | null;
  channel: MidiChannel;
  createdAt: string;
}

interface StoredBoard {
  instances: PedalInstance[];
}

const LEGACY_SELECTED_KEY = 'pedal-selected';

function hasStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `pedal-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function sanitizeChannel(value?: number | null): MidiChannel {
  if (typeof value === 'number' && isMidiChannel(value)) {
    return value;
  }
  return 1;
}

function snapshotLegacyDeviceKeys(): string[] {
  if (!hasStorage()) return [];
  const storage = window.localStorage;
  const devices = new Set<string>();
  const saved = storage.getItem(LEGACY_SELECTED_KEY);
  if (saved) devices.add(saved);
  for (let i = 0; i < storage.length; i += 1) {
    const key = storage.key(i);
    if (!key) continue;
    if (isLegacyValuesKey(key)) {
      devices.add(legacyDeviceFromValuesKey(key));
    } else if (isLegacySnapshotsKey(key)) {
      devices.add(legacyDeviceFromSnapshotsKey(key));
    } else if (key.startsWith('pedal-channel:')) {
      devices.add(key.slice('pedal-channel:'.length));
    }
  }
  return Array.from(devices);
}

function migrateLegacyBoard(): PedalInstance[] | null {
  if (!hasStorage()) return null;
  const storage = window.localStorage;
  const candidates = snapshotLegacyDeviceKeys();
  if (!candidates.length) return null;
  const knownDevices = new Set(listPedals().map((p) => p.value));
  const board: PedalInstance[] = [];
  for (const device of candidates) {
    if (!knownDevices.has(device)) continue;
    const id = generateId();
    const channelKey = legacyChannelKey(device);
    const rawChannel = Number(storage.getItem(channelKey));
    const fallbackChannel = getPedalByDevice(device)?.midi?.channel;
    const channel = sanitizeChannel(isMidiChannel(rawChannel) ? rawChannel : fallbackChannel ?? null);
    copyLegacyValues(storage, device, id);
    copyLegacySnapshots(storage, device, id);
    board.push({
      id,
      device,
      channel,
      createdAt: new Date().toISOString(),
    });
  }
  return board.length ? board : null;
}

function copyLegacyValues(storage: Storage, device: string, instanceId: string) {
  const raw = storage.getItem(`pedal-values:${device}`);
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw) as Record<string, number>;
    const payload: StoredControlValues = {
      device,
      values: parsed,
    };
    storage.setItem(valuesStorageKey(instanceId), JSON.stringify(payload));
  } catch {
    // ignore invalid legacy payloads
  }
}

function copyLegacySnapshots(storage: Storage, device: string, instanceId: string) {
  const raw = storage.getItem(`pedal-snapshots:${device}`);
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw) as StoredSnapshotsPayload | unknown;
    const payload: StoredSnapshotsPayload = Array.isArray(parsed)
      ? { device, snapshots: parsed }
      : { device, snapshots: (parsed as StoredSnapshotsPayload)?.snapshots ?? [] };
    storage.setItem(snapshotsStorageKey(instanceId), JSON.stringify(payload));
  } catch {
    // ignore invalid legacy payloads
  }
}

function cleanupInstanceStorage(id: string) {
  if (!hasStorage()) return;
  try {
    window.localStorage.removeItem(valuesStorageKey(id));
    window.localStorage.removeItem(snapshotsStorageKey(id));
  } catch {
    // ignore cleanup failures
  }
}

export function usePedalBoard() {
  const instances = ref<PedalInstance[]>([]);
  const ready = ref(false);

  function persist(next: PedalInstance[] = instances.value) {
    if (!hasStorage()) return;
    const payload: StoredBoard = { instances: next };
    try {
      window.localStorage.setItem(BOARD_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // ignore persistence failures
    }
  }

  function load(): PedalInstance[] | null {
    if (!hasStorage()) return null;
    const raw = window.localStorage.getItem(BOARD_STORAGE_KEY);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as StoredBoard;
      const parsedInstances = parsed?.instances;
      if (!Array.isArray(parsedInstances)) return null;
      return parsedInstances
        .map((item) => ({
          id: typeof item.id === 'string' ? item.id : generateId(),
          device: typeof item.device === 'string' ? item.device : null,
          channel: sanitizeChannel(item.channel),
          createdAt: typeof item.createdAt === 'string' ? item.createdAt : new Date().toISOString(),
        }));
    } catch {
      return null;
    }
  }

  function setInstances(next: PedalInstance[]) {
    instances.value = next;
    persist(next);
  }

  function nextChannel(excludeId?: string): MidiChannel {
    const used = new Set(instances.value.filter((inst) => inst.id !== excludeId).map((inst) => inst.channel));
    for (let c = 1; c <= 16; c += 1) {
      if (!used.has(c as MidiChannel)) {
        return sanitizeChannel(c);
      }
    }
    const current = excludeId ? instances.value.find((inst) => inst.id === excludeId)?.channel : null;
    return current ?? 1;
  }

  function createInstance(device?: string | null, channelOverride?: number | null): PedalInstance {
    const id = generateId();
    const fallbackDevice = device ?? listPedals()[0]?.value ?? null;
    const fallbackChannel = channelOverride ?? getPedalByDevice(fallbackDevice ?? '')?.midi?.channel ?? null;
    return {
      id,
      device: fallbackDevice,
      channel: sanitizeChannel(fallbackChannel),
      createdAt: new Date().toISOString(),
    };
  }

  function ensureDefault() {
    if (instances.value.length) return;
    const migrated = migrateLegacyBoard();
    if (migrated?.length) {
      setInstances(migrated);
      ready.value = true;
      return;
    }
    const inst = createInstance();
    setInstances([inst]);
    ready.value = true;
  }

  function init() {
    const restored = load();
    if (restored && restored.length) {
      setInstances(restored);
      ready.value = true;
      return;
    }
    ensureDefault();
  }

  function updateInstance(id: string, patch: Partial<Pick<PedalInstance, 'device' | 'channel'>>) {
    setInstances(
      instances.value.map((inst) =>
        (inst.id === id
          ? {
            ...inst,
            device: typeof patch.device === 'undefined' ? inst.device : patch.device,
            channel: typeof patch.channel === 'undefined' ? inst.channel : sanitizeChannel(patch.channel),
          }
          : inst)),
    );
  }

  function addInstance(device?: string | null, channelOverride?: number | null) {
    const override = typeof channelOverride === 'number' ? channelOverride : undefined;
    const instance = createInstance(device ?? null, override ?? nextChannel());
    setInstances([...instances.value, instance]);
    return instance;
  }

  function removeInstance(id: string) {
    if (instances.value.length <= 1) {
      const [current] = instances.value;
      if (current && current.id === id) {
        cleanupInstanceStorage(current.id);
        const replacement = createInstance();
        setInstances([replacement]);
        return;
      }
    }
    cleanupInstanceStorage(id);
    setInstances(instances.value.filter((inst) => inst.id !== id));
  }

  function duplicateInstance(id: string): PedalInstance | null {
    const source = instances.value.find((inst) => inst.id === id);
    if (!source) return null;
    let next = source.channel + 1;
    if (!isMidiChannel(next)) next = 1;
    if (instances.value.some((inst) => inst.channel === next)) {
      next = nextChannel();
    }
    const instance = createInstance(source.device, next);
    setInstances([...instances.value, instance]);
    const storage = hasStorage() ? window.localStorage : null;
    if (storage) {
      const srcValues = storage.getItem(valuesStorageKey(id));
      if (srcValues) {
        storage.setItem(valuesStorageKey(instance.id), srcValues);
      }
      const srcSnapshots = storage.getItem(snapshotsStorageKey(id));
      if (srcSnapshots) {
        storage.setItem(snapshotsStorageKey(instance.id), srcSnapshots);
      }
    }
    return instance;
  }

  function moveInstance(id: string, direction: 'up' | 'down') {
    const idx = instances.value.findIndex((inst) => inst.id === id);
    if (idx < 0) return;
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === instances.value.length - 1) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    const next = [...instances.value];
    const [removed] = next.splice(idx, 1);
    next.splice(targetIdx, 0, removed);
    setInstances(next);
  }

  init();

  return {
    instances: instances as Ref<PedalInstance[]>,
    ready,
    addInstance,
    removeInstance,
    duplicateInstance,
    moveInstance,
    updateInstance,
  } as const;
}
