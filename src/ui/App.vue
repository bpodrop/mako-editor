<template>
  <div class="container">
    <header class="header">
      <h1>MIDI Controller (PWA)</h1>
      <p class="subtitle">PC & CC via Web MIDI - Walrus Audio Mako</p>
    </header>

    <section class="card">
      <div class="form-row">
        <DeviceSelect />
      </div>
      <div class="form-row">
        <ChannelPicker />
      </div>
      <div class="form-row">
        <div>
          <label class="label" for="pedal-config">Configuration</label>
          <select id="pedal-config" v-model="selectedDevice">
            <option v-for="p in pedalOptions" :key="p.value" :value="p.value">{{ p.label }}</option>
          </select>
        </div>
      </div>
    </section>

    <section class="card grid">
      <PcSender />
      <!-- <CcSender /> -->
    </section>

    <section class="card">
      <h2>Controls</h2>
      <p v-if="!selectedConfig">Sélectionnez une configuration pour afficher les contrôles.</p>
      <template v-else>
        <p v-if="!isOutputReady" aria-live="polite">Aucune sortie MIDI disponible — les contrôles sont désactivés.</p>
        <div class="controls-grid">
          <ControlRenderer
            v-for="c in visibleControls"
            :key="c.id"
            :control="c as any"
            :value="values[c.id]"
            :disabled="!isOutputReady"
            @update:value="(v: number) => onValue(c as AnyControl, v)"
          />
        </div>
      </template>
    </section>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

    <footer class="footer">
      <small>
        Web MIDI requires a secure context (HTTPS or localhost).<br />
        This app is installable (PWA) - add it to your home screen.
      </small>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, ref, watch } from 'vue';
import { useMidi } from '../store/useMidi';
import { useMidiControls } from '../application/use-midi-controls';
import DeviceSelect from './components/DeviceSelect.vue';
import ChannelPicker from './components/ChannelPicker.vue';
import PcSender from './components/PcSender.vue';
import CcSender from './components/CcSender.vue';
import { listPedals, getPedalByDevice } from '../config/pedalConfig';
import type { PedalConfig } from '../config/types';
import { ControlRenderer } from '../components/controls';
import { getVisibleControls } from '../config/visibility';
import { useControlValues } from '../composables/useControlValues';
import type { AnyControl } from '../types/controls';

const { init, errorMessage, isOutputReady, setChannel } = useMidi();
const { sendControlChange } = useMidiControls();

onMounted(async () => { void init(); });

// Config selection from pedalConfig.ts
const pedalOptions = listPedals();
const savedDevice = typeof localStorage !== 'undefined' ? localStorage.getItem('pedal-selected') ?? '' : '';
const selectedDevice = ref<string>(
  pedalOptions.find(p => p.value === savedDevice)?.value ?? pedalOptions[0]?.value ?? ''
);
const selectedConfig = computed<PedalConfig | undefined>(() =>
  selectedDevice.value ? getPedalByDevice(selectedDevice.value) : undefined
);

const visibleControls = computed(() => getVisibleControls(selectedConfig.value));

// Appliquer le canal par défaut de la config au store
watch(selectedConfig, (cfg) => {
  if (cfg?.midi?.channel) setChannel(cfg.midi.channel);
}, { immediate: true });

// Control values (persisted per device)
const { values, setValue } = useControlValues(selectedDevice);
function onValue(ctrl: AnyControl, v: number) {
  setValue(ctrl.id, v);
  sendControlChange(ctrl.cc, v);
}
</script>

<style scoped>
.container {
  max-width: 880px;
  margin: 0 auto;
  padding: 1rem;
}
.header {
  margin-bottom: 1rem;
}
.subtitle {
  color: #666;
  margin: 0.25rem 0 0;
}
.card {
  background: #fff;
  border: 1px solid #e6e6e6;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}
.form-row {
  margin-bottom: 0.75rem;
}
.label {
  display: block;
  margin-bottom: 0.25rem;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}
.controls-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 0.75rem;
}
.error {
  color: #b00020;
}
.footer {
  margin-top: 2rem;
  color: #666;
}
</style>
