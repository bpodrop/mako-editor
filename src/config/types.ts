// src/config/types.ts
export type Control =
  | { id: string; label: string; cc: number; type: 'range'; min: number; max: number }
  | { id: string; label: string; cc: number; type: 'toggle'; on: number; off: number }
  | { id: string; label: string; cc: number; type: 'enum'; map: Record<string, number> }
  | { id: string; label: string; cc: number; type: 'zoneEnum'; zones: { name: string; min: number; max: number }[] };

export type PedalConfig = {
  device: string;
  schemaVersion: number;
  midi: unknown;
  controls: Control[];
  notes?: string[];
};
