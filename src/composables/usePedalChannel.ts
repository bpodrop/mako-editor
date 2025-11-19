import { watch, type Ref } from 'vue';
import type { PedalConfig } from '../config/types';
import { isMidiChannel, type MidiChannel } from '../core/entities/midi';

const keyFor = (device: string) => `pedal-channel:${device}`;

export function usePedalChannelSync(
  selectedDevice: Ref<string>,
  selectedConfig: Ref<PedalConfig | undefined>,
  setChannel: (value: number) => void,
  channel: Ref<MidiChannel>
) {
  watch([selectedDevice, selectedConfig], ([device, cfg]) => {
    if (!device) return;
    const raw = Number(localStorage.getItem(keyFor(device)));
    if (isMidiChannel(raw)) {
      setChannel(raw);
      return;
    }
    const defaultChannel = typeof cfg?.midi?.channel === 'number' ? cfg.midi.channel : undefined;
    if (typeof defaultChannel === 'number' && isMidiChannel(defaultChannel)) {
      setChannel(defaultChannel);
    }
  }, { immediate: true });

  watch(channel, (value) => {
    const device = selectedDevice.value;
    if (!device) return;
    try {
      localStorage.setItem(keyFor(device), String(value));
    } catch {
      // ignore storage errors
    }
  });
}
