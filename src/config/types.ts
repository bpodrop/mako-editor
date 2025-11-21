// src/config/types.ts
import type { AnyControl } from '../core/entities/controls';

export interface PcBank {
  bank: string;
  presets: Record<string, number | [number, number]>;
}

export interface PcConfig {
  range: [number, number];
  banks?: PcBank[];
}

export interface MidiConfig {
  channel?: number;
  pc?: PcConfig;
}

export type PedalConfig = {
  device: string;
  color?: string;
  backgroundColor?: string;
  secondaryBgColor?: string;
  textColor?: string;
  secondaryTextColor?: string;
  schemaVersion: number;
  midi: MidiConfig;
  controls: AnyControl[];
  notes?: string[];
};
