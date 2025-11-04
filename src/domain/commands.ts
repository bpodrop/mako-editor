import { ControlChange, ProgramChange, assertSevenBit } from './midi';

// Build raw MIDI messages

export function buildProgramChangeBytes(pc: ProgramChange): Uint8Array {
  const status = 0xC0 + ((pc.channel as number) - 1);
  const program = assertSevenBit(pc.program, 'Program');
  return new Uint8Array([status, program]);
}

export function buildControlChangeBytes(cc: ControlChange): Uint8Array {
  const status = 0xB0 + ((cc.channel as number) - 1);
  const controller = assertSevenBit(cc.controller, 'Controller');
  const value = assertSevenBit(cc.value, 'Value');
  return new Uint8Array([status, controller, value]);
}
