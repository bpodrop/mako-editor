import { reactive, watch, type Ref } from 'vue';
import { valuesStorageKey } from './storageKeys';

type ValueMap = Record<string, number>;

export interface ValuesInstanceRef {
  id: string;
  device?: string | null;
}

export interface StoredControlValues {
  device?: string | null;
  values: ValueMap;
}

function assign(target: ValueMap, source: ValueMap) {
  for (const key of Object.keys(target)) delete target[key];
  for (const [key, value] of Object.entries(source)) {
    target[key] = value as number;
  }
}

export function useControlValues(instanceRef: Ref<ValuesInstanceRef | null>) {
  const committedValues = reactive<ValueMap>({});
  const draftValues = reactive<ValueMap>({});

  function persist() {
    const ctx = instanceRef.value;
    if (!ctx?.id) return;
    const payload: StoredControlValues = {
      device: ctx.device ?? null,
      values: snapshotCommitted(),
    };
    try {
      localStorage.setItem(valuesStorageKey(ctx.id), JSON.stringify(payload));
    } catch {
      // ignore storage errors
    }
  }

  function load(ctx: ValuesInstanceRef | null) {
    assign(committedValues, {});
    assign(draftValues, {});
    const id = ctx?.id;
    if (!id) return;
    try {
      const raw = localStorage.getItem(valuesStorageKey(id));
      if (!raw) return;
      const parsed = JSON.parse(raw) as StoredControlValues | ValueMap;
      if (parsed && 'values' in parsed) {
        if (ctx?.device && parsed.device && parsed.device !== ctx.device) {
          return;
        }
        const values = parsed.values ?? {};
        assign(committedValues, values);
        assign(draftValues, values);
      } else if (parsed && typeof parsed === 'object') {
        assign(committedValues, parsed as ValueMap);
        assign(draftValues, parsed as ValueMap);
      }
    } catch {
      // ignore storage errors
    }
  }

  function setDraftValue(id: string, value: number) {
    draftValues[id] = value;
  }

  function commitValue(id: string, value: number) {
    committedValues[id] = value;
    draftValues[id] = value;
    persist();
  }

  function commitMany(values: ValueMap) {
    assign(committedValues, values);
    assign(draftValues, values);
    persist();
  }

  function resetDraft() {
    assign(draftValues, committedValues);
  }

  function applyDraft(values: ValueMap) {
    resetDraft();
    for (const [key, value] of Object.entries(values)) {
      draftValues[key] = value as number;
    }
  }

  function snapshotCommitted(): ValueMap {
    const out: ValueMap = {};
    for (const [key, value] of Object.entries(committedValues)) {
      out[key] = value as number;
    }
    return out;
  }

  function getDirtyIds(): string[] {
    const keys = new Set([...Object.keys(committedValues), ...Object.keys(draftValues)]);
    return Array.from(keys).filter((key) => committedValues[key] !== draftValues[key]);
  }

  watch(() => [instanceRef.value?.id ?? null, instanceRef.value?.device ?? null] as const,
    ([id, device]) => {
      if (id) load({ id, device });
      else load(null);
    },
    { immediate: true }
  );

  return {
    draftValues,
    committedValues,
    setDraftValue,
    commitValue,
    commitMany,
    resetDraft,
    applyDraft,
    snapshotCommitted,
    getDirtyIds,
  } as const;
}

