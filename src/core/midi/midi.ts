class MidiService {
  private output: MIDIOutput | null = null;

  async init(): Promise<void> {
    const access = await navigator.requestMIDIAccess();
    const first = access.outputs.values().next().value as MIDIOutput | undefined;
    this.output = first ?? null;
  }

  isReady(): boolean { return !!this.output; }

  sendCC(channel: number, cc: number, value: number) {
    if (!this.output) return;
    const ch = Math.max(1, Math.min(16, Math.floor(channel)));
    const status = 0xB0 | ((ch - 1) & 0x0F);
    this.output.send([status, cc & 0x7F, value & 0x7F]);
  }
}

export const midi = new MidiService();

