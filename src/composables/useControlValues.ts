import { reactive, watch, type Ref } from 'vue';

export function useControlValues(selectedDevice: Ref<string>) {
  const values = reactive<Record<string, number>>({});

  function reset() {
    for (const k of Object.keys(values)) delete (values as any)[k];
  }

  function load(device: string) {
    reset();
    if (!device) return;
    try {
      const raw = localStorage.getItem(`pedal-values:${device}`);
      if (!raw) return;
      const obj = JSON.parse(raw) as Record<string, number>;
      for (const [k, v] of Object.entries(obj)) values[k] = v;
    } catch {
      // ignore storage errors
    }
  }

  function persist() {
    const device = selectedDevice.value;
    if (!device) return;
    try {
      const snapshot: Record<string, number> = {};
      for (const [k, val] of Object.entries(values)) snapshot[k] = val as number;
      localStorage.setItem(`pedal-values:${device}`, JSON.stringify(snapshot));
    } catch {
      // ignore storage errors
    }
  }

  function setValue(id: string, value: number) {
    values[id] = value;
    persist();
  }

  watch(selectedDevice, (d) => {
    try { localStorage.setItem('pedal-selected', d); } catch {}
    load(d);
  }, { immediate: true });

  return {
    values,
    setValue,
  } as const;
}

