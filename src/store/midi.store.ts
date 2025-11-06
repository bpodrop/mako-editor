import { computed, ref } from 'vue';
import { WebMidiGateway } from '../infrastructure/webmidi.gateway';
import { asMidiChannel, ControlChange, MidiChannel, ProgramChange } from '../domain/midi';

const outputs = ref<MIDIOutput[]>([]);
const selectedOutputId = ref<string | null>(null);
const channel = ref<MidiChannel>(1);
const errorMessage = ref<string | null>(null);

const selectedOutput = computed<MIDIOutput | null>(() => {
  return outputs.value.find((o) => o.id === selectedOutputId.value) ?? null;
});

async function init(): Promise<void> {
  try {
    await WebMidiGateway.ensureAccess();
    WebMidiGateway.onStateChange(async () => {
      await refreshOutputs();
    });
    await refreshOutputs();
  } catch (e) {
    errorMessage.value = e instanceof Error ? e.message : String(e);
  }
}

async function refreshOutputs(): Promise<void> {
  const list = await WebMidiGateway.getOutputs();
  outputs.value = list;
  if (!selectedOutputId.value || !outputs.value.some((o) => o.id === selectedOutputId.value)) {
    selectedOutputId.value = outputs.value[0]?.id ?? null;
  }
}

function setSelectedOutput(id: string | null): void {
  selectedOutputId.value = id;
}

function setChannel(value: number): void {
  try {
    channel.value = asMidiChannel(value);
  } catch (e) {
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
    WebMidiGateway.sendProgramChange(selectedOutput.value, pc);
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
    WebMidiGateway.sendControlChange(selectedOutput.value, cc);
    return null;
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    errorMessage.value = err.message;
    return err;
  }
}

export const midiStore = {
  // state
  outputs,
  selectedOutput,
  selectedOutputId,
  channel,
  errorMessage,
  // actions
  init,
  refreshOutputs,
  setSelectedOutput,
  setChannel,
  sendProgramChange,
  sendControlChange,
};

export type MidiStore = typeof midiStore;
