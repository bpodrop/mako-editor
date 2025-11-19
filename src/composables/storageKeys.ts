export const BOARD_STORAGE_KEY = 'pedal-board:v2';

const VALUES_PREFIX = 'pedal-values:v2:';
const SNAPSHOTS_PREFIX = 'pedal-snapshots:v2:';
const LEGACY_VALUES_PREFIX = 'pedal-values:';
const LEGACY_SNAPSHOTS_PREFIX = 'pedal-snapshots:';
const LEGACY_CHANNEL_PREFIX = 'pedal-channel:';

export function valuesStorageKey(instanceId: string): string {
  return `${VALUES_PREFIX}${instanceId}`;
}

export function snapshotsStorageKey(instanceId: string): string {
  return `${SNAPSHOTS_PREFIX}${instanceId}`;
}

export function isLegacyValuesKey(key: string): boolean {
  return key.startsWith(LEGACY_VALUES_PREFIX) && !key.startsWith(VALUES_PREFIX);
}

export function isLegacySnapshotsKey(key: string): boolean {
  return key.startsWith(LEGACY_SNAPSHOTS_PREFIX) && !key.startsWith(SNAPSHOTS_PREFIX);
}

export function legacyDeviceFromValuesKey(key: string): string {
  return key.slice(LEGACY_VALUES_PREFIX.length);
}

export function legacyDeviceFromSnapshotsKey(key: string): string {
  return key.slice(LEGACY_SNAPSHOTS_PREFIX.length);
}

export function legacyChannelKey(device: string): string {
  return `${LEGACY_CHANNEL_PREFIX}${device}`;
}
