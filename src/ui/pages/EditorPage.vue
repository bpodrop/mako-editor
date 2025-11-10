<template>
  <div class="container">
    <header class="header" role="banner">
      <div>
        <h1>Mako MIDI Editor</h1>
        <p class="subtitle">simple MIDI editor for Walrus Audio Mako series</p>
      </div>
      <BurgerMenu
        :pedal-options="pedalOptions"
        v-model:selectedDevice="selectedDevice"
        @export-config="exportConfig"
        @import-file="onImportFile"
        @open-legal="navigateLegal"
      />
    </header>

    <main id="main" role="main" aria-describedby="status">
      

      <section class="card" :style="controlsCardStyle" aria-labelledby="controls-heading">
        <div class="controls-header">
          <h2 id="controls-heading">Controls</h2>
          <button class="btn" type="button" :disabled="!isOutputReady" @click="sendAll">Envoyer tout</button>
        </div>
        <p id="status" v-if="!selectedConfig">Sélectionnez une configuration pour afficher les contrôles.</p>
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

      <p v-if="errorMessage" class="error" role="alert" aria-live="assertive">{{ errorMessage }}</p>
    </main>

    <footer class="footer">
      <small class="copyright">
        © {{ currentYear }} - {{ appVersion }} - <a href="https://fr.audiofanzine.com/membres/207406/" target="_blank" rel="noopener noreferrer">benbao</a>
      </small>
      <button class="link-btn legal-link" type="button" @click="navigateLegal">
        Mentions légales
      </button>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useMidi } from '../composables/useMidiStore';
import { useMidiControls } from '../../application/use-midi-controls';
import BurgerMenu from '../components/BurgerMenu.vue';
import { listPedals, getPedalByDevice } from '../../config/pedalConfig';
import type { PedalConfig } from '../../config/types';
import { ControlRenderer } from '../../features/pedal-controls';
import { getVisibleControls } from '../../config/visibility';
import { useControlValues } from '../../composables/useControlValues';
import type { AnyControl } from '../../core/entities/controls';
import pkg from '../../../package.json';

const router = useRouter();
const { init, errorMessage, isOutputReady, setChannel, channel } = useMidi();
const { sendControlChange } = useMidiControls();

// Footer info
const currentYear = new Date().getFullYear();
const appVersion = `V${pkg?.version ?? '0.0.0'}`;

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

function parseHexColor(hex: string): { r: number; g: number; b: number } | undefined {
  const m = hex.trim().match(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
  if (!m) return undefined;
  let h = m[1];
  if (h.length === 3) {
    h = h.split('').map(ch => ch + ch).join('');
  }
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return { r, g, b };
}

function contrastTextFor(bg: string): string {
  const rgb = parseHexColor(bg);
  if (!rgb) return '#000';
  const yiq = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  return yiq >= 128 ? '#000' : '#fff';
}

const controlsCardStyle = computed(() => {
  const cfg = selectedConfig.value;
  const bg = cfg?.backgroundColor ?? cfg?.color;
  const fg = cfg?.textColor ?? (bg ? contrastTextFor(bg) : undefined);
  const secondary = cfg?.secondaryBgColor;
  const style: Record<string, string> = {};
  if (bg) style.backgroundColor = bg;
  if (fg) style.color = fg;
  if (secondary) style['--secondary-surface'] = secondary;
  return style;
});

// Apply the config default channel to the store
watch(selectedConfig, (cfg) => {
  if (cfg?.midi?.channel) setChannel(cfg.midi.channel);
}, { immediate: true });

// Persist the selected pedal
watch(selectedDevice, (dev) => {
  try { localStorage.setItem('pedal-selected', dev ?? ''); } catch {}
});

// Control values (persisted per device)
const { values, setValue } = useControlValues(selectedDevice);
function onValue(ctrl: AnyControl, v: number) {
  setValue(ctrl.id, v);
  sendControlChange(ctrl.cc, v);
}

// Send all visible controls with their current values
async function sendAll() {
  if (!isOutputReady.value) {
    window.alert('Aucune sortie MIDI sélectionnée.');
    return;
  }
  const controls = visibleControls.value ?? [];
  for (const c of controls) {
    const raw = (values as any)[c.id];
    const v = typeof raw === 'number' ? raw : Number(raw);
    if (!Number.isNaN(v)) {
      sendControlChange(c.cc, v);
      await new Promise((r) => setTimeout(r, 5));
    }
  }
}

// --- Export / Import configuration (JSON file) ---
function snapshotValues(): Record<string, number> {
  const snap: Record<string, number> = {};
  for (const [k, val] of Object.entries(values)) snap[k] = val as number;
  return snap;
}

function exportConfig(): void {
  const device = selectedDevice.value;
  if (!device) {
    window.alert('Aucune pédale sélectionnée.');
    return;
  }
  const payload = {
    $schema: 'mako-editor:preset',
    version: 1,
    device,
    channel: channel.value,
    values: snapshotValues(),
    exportedAt: new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  const date = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  a.download = `${device || 'preset'}-mako-config-${date}.json`;
  a.href = URL.createObjectURL(blob);
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 0);
}

function isRecord(v: unknown): v is Record<string, unknown> { return !!v && typeof v === 'object' && !Array.isArray(v); }

async function onImportFile(ev: Event) {
  const input = ev.target as HTMLInputElement;
  const file = input.files?.[0];
  try {
    if (!file) return;
    const text = await file.text();
    const data = JSON.parse(text) as unknown;
    if (!isRecord(data)) throw new Error('Fichier JSON invalide.');
    const device = typeof data.device === 'string' ? data.device : '';
    const vals = (isRecord(data.values) ? data.values : null) as Record<string, unknown> | null;
    const importedChannel = typeof (data as any).channel === 'number' ? (data as any).channel : undefined;
    if (!device || !vals) throw new Error('Format de configuration non reconnu.');

    // If the pedal exists in the list, select it
    const exists = pedalOptions.some(p => p.value === device);
    if (exists) selectedDevice.value = device;
    else {
      // Allow the import anyway but warn
      console.warn('Pédale inconnue dans les options:', device);
    }

    if (importedChannel != null) setChannel(importedChannel);

    // Apply the imported values (do not send CC here)
    const allowedIds = new Set((selectedConfig.value?.controls ?? []).map(c => c.id));
    for (const [k, v] of Object.entries(vals)) {
      if (!allowedIds.size || allowedIds.has(k)) {
        const num = typeof v === 'number' ? v : Number(v);
        if (!Number.isNaN(num)) setValue(k, num);
      }
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    window.alert(`Échec du chargement: ${msg}`);
  } finally {
    // Reset input to allow re-selecting the same file
    if (input) input.value = '';
  }
}

function navigateLegal() {
  void router.push({ name: 'legal' });
}

onMounted(async () => { void init(); });
</script>

<style scoped>
.header {
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.subtitle {
  margin: 0.25rem 0 0;
}
.controls-header { display: flex; align-items: center; justify-content: space-between; gap: .5rem; }
.form-row {
  margin-bottom: 0.75rem;
}
.footer {
  margin-top: 2rem;
  text-align: center;
}
.footer small { display: block; }
.footer .disclaimer { color: var(--muted); margin-top: .25rem; }
.legal-link { margin-top: 0.5rem; }
</style>
