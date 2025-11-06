import { inject } from 'vue';
import { MidiStoreSymbol, type MidiStore } from './midi.store';

export function useMidi(): MidiStore {
  const store = inject(MidiStoreSymbol);
  if (!store) throw new Error('MidiStore is not provided');
  return store;
}
