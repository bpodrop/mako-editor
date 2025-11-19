import { reactive, watch, type Ref } from 'vue';

type ValueMap = Record<string, number>;

function assign(target: ValueMap, source: ValueMap) {
  for (const key of Object.keys(target)) delete target[key];
  for (const [key, value] of Object.entries(source)) {
    target[key] = value as number;
  }
}

export function useControlValues(selectedDevice: Ref<string>) {
  const committedValues = reactive<ValueMap>({});
  const draftValues = reactive<ValueMap>({});

  function persist() {
    const device = selectedDevice.value;
    if (!device) return;
    try {
      localStorage.setItem(`pedal-values:${device}`, JSON.stringify(committedValues));
    } catch {
      // ignore storage errors
    }
  }

  function load(device: string) {
    assign(committedValues, {});
    assign(draftValues, {});
    if (!device) return;
    try {
      const raw = localStorage.getItem(`pedal-values:${device}`);
      if (!raw) return;
      const parsed = JSON.parse(raw) as ValueMap;
      assign(committedValues, parsed);
      assign(draftValues, parsed);
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

  watch(selectedDevice, (device) => {
    load(device);
  }, { immediate: true });

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

