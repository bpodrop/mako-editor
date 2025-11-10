export type ControlType = 'range' | 'enum' | 'zoneEnum' | 'toggle' | 'momentary';

export interface BaseControl {
  id: string;
  label: string;
  cc: number;
  type: ControlType;
  hidden?: boolean;
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
  // some JSON may have custom keys e.g. slow/fast
  [k: string]: unknown;
}

export interface MomentaryControl extends BaseControl {
  type: 'momentary';
  value: number; // pulse value
}

export type AnyControl =
  | RangeControl
  | EnumControl
  | ZoneEnumControl
  | ToggleControl
  | MomentaryControl;

