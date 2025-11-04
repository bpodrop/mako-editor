// src/config/pedalConfig.ts
import type { PedalConfig } from './types';

const modules = import.meta.glob('./*.json', { eager: true });

type Loaded = { file: string; config: PedalConfig };

function isPedalConfig(x: any): x is PedalConfig {
  return x && typeof x.device === 'string' && Array.isArray(x.controls);
}

function safeDevice(x?: string) {
  return typeof x === 'string' ? x : '';
}

export function getAllPedalConfigs(): Loaded[] {
  const items: Loaded[] = [];
  for (const [file, mod] of Object.entries(modules)) {
    const data = (mod as any)?.default ?? mod;
    if (isPedalConfig(data)) {
      items.push({ file, config: data });
    }
  }
  items.sort((a, b) => safeDevice(a.config.device).localeCompare(safeDevice(b.config.device), 'fr', { sensitivity: 'base' }));
  return items;
}

export function listPedals(): { value: string; label: string }[] {
  return getAllPedalConfigs().map(x => ({
    value: x.config.device,
    label: x.config.device,
  }));
}

export function getPedalByDevice(device: string): PedalConfig | undefined {
  return getAllPedalConfigs().find(x => x.config.device === device)?.config;
}
