// src/config/visibility.ts
import type { PedalConfig } from './types';

export function getVisibleControls(cfg?: PedalConfig) {
  if (!cfg) return [];
  return (cfg.controls ?? []).filter(c => !c.hidden);
}
