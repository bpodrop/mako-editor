export type ControlType = 'range' | 'enum' | 'zoneEnum' | 'toggle' | 'momentary';

export interface BaseControl {
  id: string;
  label: string;
  cc: number;
  type: ControlType;
}

export interface RangeControl extends BaseControl {
  type: 'range';
  min: number; max: number;
}

export interface EnumControl extends BaseControl {
  type: 'enum';
  map: Record<string, number>;
}

export interface ZoneDef { name: string; min: number; max: number; }
export interface ZoneEnumControl extends BaseControl {
  type: 'zoneEnum';
  zones: ZoneDef[];
}

export interface ToggleControl extends BaseControl {
  type: 'toggle';
  on: number; off: number;
  // certains JSON peuvent avoir des clés custom p.ex. slow/fast
  [k: string]: unknown;
}

export interface MomentaryControl extends BaseControl {
  type: 'momentary';
  value: number; // valeur impulsion
}

export type AnyControl =
  | RangeControl
  | EnumControl
  | ZoneEnumControl
  | ToggleControl
  | MomentaryControl;

export interface DeviceConfig {
  device: string;
  schemaVersion: number;
  midi: { channel: number; pc: { range: [number,number] } };
  controls: AnyControl[];
}

