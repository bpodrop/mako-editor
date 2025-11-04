/// <reference types="vite/client" />

// Minimal Web MIDI API types to satisfy TypeScript under strict mode.
// Browsers that support Web MIDI expose these in runtime, but TypeScript may lack DOM typings.

interface MIDIOptions {
  sysex?: boolean;
}

interface MIDIConnectionEvent extends Event {
  port: MIDIPort;
}

interface MIDIMessageEvent extends Event {
  data: Uint8Array;
  receivedTime: number;
}

type MIDIPortType = 'input' | 'output';
type MIDIPortDeviceState = 'connected' | 'disconnected';
type MIDIPortConnectionState = 'open' | 'closed' | 'pending';

interface MIDIPort extends EventTarget {
  id: string;
  manufacturer?: string;
  name?: string;
  type: MIDIPortType;
  version?: string;
  state: MIDIPortDeviceState;
  connection: MIDIPortConnectionState;
  onstatechange: ((this: MIDIPort, ev: MIDIConnectionEvent) => any) | null;
  open(): Promise<MIDIPort>;
  close(): Promise<MIDIPort>;
}

interface MIDIOutput extends MIDIPort {
  type: 'output';
  send(data: number[] | Uint8Array, timestamp?: number): void;
  clear(): void;
}

interface MIDIInput extends MIDIPort {
  type: 'input';
  onmidimessage: ((this: MIDIInput, ev: MIDIMessageEvent) => any) | null;
}

interface MIDIOutputMap extends Map<string, MIDIOutput> {}
interface MIDIInputMap extends Map<string, MIDIInput> {}

interface MIDIAccess extends EventTarget {
  inputs: MIDIInputMap;
  outputs: MIDIOutputMap;
  sysexEnabled: boolean;
  onstatechange: ((this: MIDIAccess, ev: MIDIConnectionEvent) => any) | null;
}

interface Navigator {
  requestMIDIAccess(options?: MIDIOptions): Promise<MIDIAccess>;
}

