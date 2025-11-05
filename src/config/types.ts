// src/config/types.ts

type Hidden = { hidden?: boolean };

export type Control =
  | ({ id: string; label: string; cc: number; type: 'range'; min: number; max: number } & Hidden)
  | ({ id: string; label: string; cc: number; type: 'toggle'; on: number; off: number } & Hidden)
  | ({ id: string; label: string; cc: number; type: 'enum'; map: Record<string, number> } & Hidden)
  | ({ id: string; label: string; cc: number; type: 'zoneEnum'; zones: { name: string; min: number; max: number }[] }& Hidden);

export type PedalConfig = {
  device: string;
  schemaVersion: number;
  midi: unknown;
  controls: Control[];
  notes?: string[];
};
