// Domain layer: MIDI primitives and validation

export type MidiChannel =
  | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16;

export interface ProgramChange {
  channel: MidiChannel;
  program: number; // 0..127
}

export interface ControlChange {
  channel: MidiChannel;
  controller: number; // 0..127
  value: number; // 0..127
}

export function isMidiChannel(n: number): n is MidiChannel {
  return Number.isInteger(n) && n >= 1 && n <= 16;
}

export function asMidiChannel(n: number): MidiChannel {
  if (!isMidiChannel(n)) {
    throw new Error(`Invalid MIDI channel: ${n}. Expected 1-16.`);
  }
  return n as MidiChannel;
}

export function assertSevenBit(value: number, label: string): number {
  if (!Number.isInteger(value) || value < 0 || value > 127) {
    throw new Error(`${label} out of range (0-127): ${value}`);
  }
  return value;
}
