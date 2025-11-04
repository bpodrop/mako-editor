import { ControlChange, MidiChannel, ProgramChange } from '../domain/midi';
import { buildControlChangeBytes, buildProgramChangeBytes } from '../domain/commands';

export interface MidiGateway {
  ensureAccess(): Promise<MIDIAccess>;
  getOutputs(): Promise<MIDIOutput[]>;
  onStateChange(cb: () => void): void;
  sendRaw(output: MIDIOutput, bytes: Uint8Array, timestampMs?: number): void;
  sendProgramChange(output: MIDIOutput, pc: ProgramChange): void;
  sendControlChange(output: MIDIOutput, cc: ControlChange): void;
}

class WebMidiGatewayImpl implements MidiGateway {
  private access: MIDIAccess | null = null;
  private listeners: Array<() => void> = [];

  async ensureAccess(): Promise<MIDIAccess> {
    if (this.access) return this.access;
    if (!('requestMIDIAccess' in navigator)) {
      throw new Error('Web MIDI not supported by this browser. Use HTTPS/localhost.');
    }
    this.access = await navigator.requestMIDIAccess({ sysex: false });
    this.access.onstatechange = () => {
      this.listeners.forEach((l) => l());
    };
    return this.access;
  }

  async getOutputs(): Promise<MIDIOutput[]> {
    const access = await this.ensureAccess();
    const out: MIDIOutput[] = [];
    access.outputs.forEach((o) => out.push(o));
    // Keep consistent order by name/id
    out.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    return out;
  }

  onStateChange(cb: () => void): void {
    this.listeners.push(cb);
  }

  sendRaw(output: MIDIOutput, bytes: Uint8Array, timestampMs?: number): void {
    output.send(bytes, timestampMs);
  }

  sendProgramChange(output: MIDIOutput, pc: ProgramChange): void {
    const bytes = buildProgramChangeBytes(pc);
    this.sendRaw(output, bytes);
  }

  sendControlChange(output: MIDIOutput, cc: ControlChange): void {
    const bytes = buildControlChangeBytes(cc);
    this.sendRaw(output, bytes);
  }
}

export const WebMidiGateway: MidiGateway = new WebMidiGatewayImpl();

