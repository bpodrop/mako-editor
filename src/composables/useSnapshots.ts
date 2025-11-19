import { ref, watch, type Ref } from 'vue';

export interface PedalSnapshot {
  id: string;
  name: string;
  values: Record<string, number>;
  createdAt: string;
}

function keyFor(device: string) {
  return `pedal-snapshots:${device}`;
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `snap-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useSnapshots(selectedDevice: Ref<string>) {
  const snapshots = ref<PedalSnapshot[]>([]);

  function load(device: string) {
    if (!device) {
      snapshots.value = [];
      return;
    }
    try {
      const raw = localStorage.getItem(keyFor(device));
      if (!raw) {
        snapshots.value = [];
        return;
      }
      const parsed = JSON.parse(raw) as PedalSnapshot[];
      snapshots.value = Array.isArray(parsed) ? parsed : [];
    } catch {
      snapshots.value = [];
    }
  }

  function persist() {
    const device = selectedDevice.value;
    if (!device) return;
    try {
      localStorage.setItem(keyFor(device), JSON.stringify(snapshots.value));
    } catch {
      // ignore storage errors
    }
  }

  function createSnapshot(name: string, values: Record<string, number>) {
    const device = selectedDevice.value;
    if (!device) return;
    const snapshot: PedalSnapshot = {
      id: generateId(),
      name: name || new Date().toLocaleString(),
      values: { ...values },
      createdAt: new Date().toISOString(),
    };
    snapshots.value = [...snapshots.value, snapshot];
    persist();
  }

  function removeSnapshot(id: string) {
    snapshots.value = snapshots.value.filter((snap) => snap.id !== id);
    persist();
  }

  watch(selectedDevice, load, { immediate: true });

  return {
    snapshots,
    createSnapshot,
    removeSnapshot,
  } as const;
}
