import { ref, watch, type Ref } from 'vue';
import { snapshotsStorageKey } from './storageKeys';

export interface PedalSnapshot {
  id: string;
  name: string;
  values: Record<string, number>;
  createdAt: string;
}

export interface SnapshotsInstanceRef {
  id: string;
  device?: string | null;
}

export interface StoredSnapshotsPayload {
  device?: string | null;
  snapshots: PedalSnapshot[];
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `snap-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useSnapshots(instanceRef: Ref<SnapshotsInstanceRef | null>) {
  const snapshots = ref<PedalSnapshot[]>([]);

  function load(ctx: SnapshotsInstanceRef | null) {
    if (!ctx?.id) {
      snapshots.value = [];
      return;
    }
    try {
      const raw = localStorage.getItem(snapshotsStorageKey(ctx.id));
      if (!raw) {
        snapshots.value = [];
        return;
      }
      const parsed = JSON.parse(raw) as StoredSnapshotsPayload | PedalSnapshot[];
      if (Array.isArray(parsed)) {
        snapshots.value = parsed;
        return;
      }
      if (parsed && Array.isArray(parsed.snapshots)) {
        if (ctx.device && parsed.device && parsed.device !== ctx.device) {
          snapshots.value = [];
          return;
        }
        snapshots.value = parsed.snapshots;
        return;
      }
      snapshots.value = [];
    } catch {
      snapshots.value = [];
    }
  }

  function persist() {
    const ctx = instanceRef.value;
    if (!ctx?.id) return;
    const payload: StoredSnapshotsPayload = {
      device: ctx.device ?? null,
      snapshots: snapshots.value,
    };
    try {
      localStorage.setItem(snapshotsStorageKey(ctx.id), JSON.stringify(payload));
    } catch {
      // ignore storage errors
    }
  }

  function createSnapshot(name: string, values: Record<string, number>) {
    const ctx = instanceRef.value;
    if (!ctx?.id || !ctx.device) return;
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

  watch(() => [instanceRef.value?.id ?? null, instanceRef.value?.device ?? null] as const,
    ([id, device]) => {
      if (id) load({ id, device });
      else load(null);
    },
    { immediate: true }
  );

  return {
    snapshots,
    createSnapshot,
    removeSnapshot,
  } as const;
}
