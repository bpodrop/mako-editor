import { computed, ref, type InjectionKey } from 'vue';
import type { MidiGateway } from '../application/ports/midi-gateway';
import { asMidiChannel, ControlChange, MidiChannel, ProgramChange } from '../domain/midi';
export function createMidiStore(gateway: MidiGateway) {
  const outputs = ref<MIDIOutput[]>([]);
  const selectedOutputId = ref<string | null>(null);
  const channel = ref<MidiChannel>(1);
  const errorMessage = ref<string | null>(null);

  const selectedOutput = computed<MIDIOutput | null>(() => {
    return outputs.value.find((o) => o.id === selectedOutputId.value) ?? null;
  });
  const isOutputReady = computed<boolean>(() => selectedOutput.value !== null);

  async function refreshOutputs(): Promise<void> {
    const list = await gateway.getOutputs();
    outputs.value = list;
    if (!selectedOutputId.value || !outputs.value.some((o) => o.id === selectedOutputId.value)) {
      selectedOutputId.value = outputs.value[0]?.id ?? null;
    }
  }

  async function init(): Promise<void> {
    try {
      await gateway.ensureAccess();
      gateway.onStateChange(async () => {
        await refreshOutputs();
      });
      await refreshOutputs();
    } catch (e) {
      errorMessage.value = e instanceof Error ? e.message : String(e);
    }
  }

  function setSelectedOutput(id: string | null): void {
    selectedOutputId.value = id;
  }

  function setChannel(value: number): void {
    try {
      channel.value = asMidiChannel(value);
    } catch {
      // ignore invalid input; UI will constrain
    }
  }

  function sendProgramChange(program: number): Error | null {
    if (!selectedOutput.value) {
      const err = new Error('No MIDI output selected.');
      errorMessage.value = err.message;
      return err;
    }
    const pc: ProgramChange = { channel: channel.value, program };
    try {
      gateway.sendProgramChange(selectedOutput.value, pc);
      return null;
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      errorMessage.value = err.message;
      return err;
    }
  }

  function sendControlChange(controller: number, value: number): Error | null {
    if (!selectedOutput.value) {
      const err = new Error('No MIDI output selected.');
      errorMessage.value = err.message;
      return err;
    }
    const cc: ControlChange = { channel: channel.value, controller, value };
    try {
      gateway.sendControlChange(selectedOutput.value, cc);
      return null;
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      errorMessage.value = err.message;
      return err;
    }
  }

  return {
    // state
    outputs,
    selectedOutput,
    selectedOutputId,
    channel,
    errorMessage,
    isOutputReady,
    // actions
    init,
    refreshOutputs,
    setSelectedOutput,
    setChannel,
    sendProgramChange,
    sendControlChange,
  } as const;
}

export type MidiStore = ReturnType<typeof createMidiStore>;
export const MidiStoreSymbol: InjectionKey<MidiStore> = Symbol('MidiStore');
