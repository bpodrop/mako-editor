import type { ControlChange, ProgramChange } from '../entities/midi';

export interface MidiGateway {
  ensureAccess(): Promise<MIDIAccess>;
  getOutputs(): Promise<MIDIOutput[]>;
  onStateChange(cb: () => void): void;
  sendRaw(output: MIDIOutput, bytes: Uint8Array, timestampMs?: number): void;
  sendProgramChange(output: MIDIOutput, pc: ProgramChange): void;
  sendControlChange(output: MIDIOutput, cc: ControlChange): void;
}

