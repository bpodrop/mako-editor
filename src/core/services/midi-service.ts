import type { MidiGateway } from '../ports/midi-gateway';
import type { MidiChannel } from '../entities/midi';

export class MidiService {
  constructor(private readonly gateway: MidiGateway) {}

  async init(onStateChange: () => void): Promise<void> {
    await this.gateway.ensureAccess();
    this.gateway.onStateChange(onStateChange);
  }

  async listOutputs(): Promise<MIDIOutput[]> {
    const list = await this.gateway.getOutputs();
    return list;
  }

  sendProgramChange(output: MIDIOutput, channel: MidiChannel, program: number): void {
    this.gateway.sendProgramChange(output, { channel, program });
  }

  sendControlChange(output: MIDIOutput, channel: MidiChannel, controller: number, value: number): void {
    this.gateway.sendControlChange(output, { channel, controller, value });
  }
}

