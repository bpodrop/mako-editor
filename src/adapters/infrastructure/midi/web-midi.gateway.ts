import type { MidiGateway } from '../../../core/ports/midi-gateway';
import type { ControlChange, ProgramChange } from '../../../core/entities/midi';
import { buildControlChangeBytes, buildProgramChangeBytes } from '../../../core/entities/commands';

export class WebMidiGateway implements MidiGateway {
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

