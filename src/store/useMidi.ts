import { computed } from 'vue';
import { midiStore } from './midi.store';

export function useMidi() {
  const isOutputReady = computed(() => midiStore.isOutputReady.value);

  return {
    ...midiStore,
    isOutputReady,
  } as const;
}

