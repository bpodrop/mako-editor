// src/config/types.ts
import type { AnyControl } from '../core/entities/controls';

export type PedalConfig = {
  device: string;
  color?: string;
  backgroundColor?: string;
  secondaryBgColor?: string;
  textColor?: string;
  schemaVersion: number;
  midi: unknown;
  controls: AnyControl[];
  notes?: string[];
};
