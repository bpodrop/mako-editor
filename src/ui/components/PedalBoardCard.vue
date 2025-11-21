<template>
  <section
    class="pedal-card"
    :style="controlsCardStyle"
    :id="`pedal-card-${props.instance.id}`"
    tabindex="-1"
  >
    <header class="card-header">
      <div>
        <h3 class="card-title">
          {{ selectedConfig?.device ?? t('board.cardTitle') }}
          <span v-if="selectedConfig?.color" class="color-dot" :style="{ backgroundColor: selectedConfig.color }"></span>
        </h3>
        <p class="card-subtitle">
          {{ t('board.channelLabel', { channel: channel }) }}
        </p>
      </div>
      <div class="card-actions">
        <button
          type="button"
          class="icon-btn"
          :title="t('board.editPedal')"
          :aria-label="t('board.editPedal')"
          @click="emit('edit', props.instance.id)"
        >
          ✎
        </button>
        <button
          type="button"
          class="icon-btn"
          :title="t('board.import')"
          :aria-label="t('board.import')"
          @click="() => fileInput?.click()"
        >
          ⇩
        </button>
        <button
          type="button"
          class="icon-btn"
          :title="t('board.export')"
          :aria-label="t('board.export')"
          @click="exportConfig"
        >
          ⇧
        </button>
      </div>
    </header>

    <div class="card-body">
      <input
        ref="fileInputEl"
        type="file"
        accept="application/json,.json"
        style="display:none"
        @change="onImportFile"
      />

      <PcSender
        :pedal-name="selectedConfig?.device"
        :pc-config="selectedConfig?.midi?.pc"
        :config="selectedConfig"
        :channel="channel"
      />

      <div class="controls-header">
        <div>
          <p v-if="props.interactionMode === 'preset' && dirtyCount > 0" class="dirty-indicator">
            {{ t('controls.dirtyHint', { count: dirtyCount }) }}
          </p>
        </div>
        <div class="controls-actions">
          <template v-if="props.interactionMode === 'preset'">
            <button class="btn" type="button" :disabled="!canApply" @click="applyPresetChanges">
              {{ t('controls.applyPreset') }}
            </button>
            <button class="btn btn--ghost" type="button" :disabled="!canCancel" @click="cancelPresetChanges">
              {{ t('controls.cancelPreset') }}
            </button>
          </template>
        </div>
      </div>

      <p v-if="!selectedConfig" class="empty">{{ t('controls.selectConfig') }}</p>
      <template v-else>
        <p v-if="!props.isOutputReady" aria-live="polite">{{ t('controls.noOutput') }}</p>
        <div class="controls-grid">
          <ControlRenderer
            v-for="c in visibleControls"
            :key="c.id"
            :control="c as any"
            :value="draftValues[c.id]"
            :dirty="isControlDirty(c.id)"
            :disabled="!props.isOutputReady"
            @update:value="(v: number) => onValue(c as AnyControl, v)"
          />
        </div>
      </template>

      <p v-if="statusMessage" class="status" role="status" aria-live="polite">{{ statusMessage }}</p>

    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import type { PedalInstance } from '../../composables/usePedalBoard';
import { ControlRenderer } from '../../features/pedal-controls';
import { getVisibleControls } from '../../config/visibility';
import { useControlValues } from '../../composables/useControlValues';
import { getPedalByDevice } from '../../config/pedalConfig';
import { useMidiControls } from '../../application/use-midi-controls';
import type { PedalConfig } from '../../config/types';
import type { AnyControl } from '../../core/entities/controls';
import PcSender from './PcSender.vue';

const props = defineProps<{
  instance: PedalInstance;
  interactionMode: 'live' | 'preset';
  isOutputReady: boolean;
}>();

const emit = defineEmits<{
  (e: 'update-device', payload: { id: string; device: string | null }): void;
  (e: 'update-channel', payload: { id: string; channel: number }): void;
  (e: 'dirty-state', payload: { id: string; dirty: boolean }): void;
  (e: 'edit', id: string): void;
}>();

const { t } = useI18n();
const { sendControlChange } = useMidiControls();
const channel = computed(() => props.instance.channel);

const selectedConfig = computed<PedalConfig | undefined>(() =>
  props.instance.device ? getPedalByDevice(props.instance.device) : undefined
);
const visibleControls = computed(() => getVisibleControls(selectedConfig.value));
const controlMap = computed(() => {
  const map = new Map<string, AnyControl>();
  for (const ctrl of selectedConfig.value?.controls ?? []) {
    map.set(ctrl.id, ctrl as AnyControl);
  }
  return map;
});

const instanceRef = computed(() => ({
  id: props.instance.id,
  device: props.instance.device,
}));

const {
  draftValues,
  setDraftValue,
  commitValue,
  commitMany,
  resetDraft,
  snapshotCommitted,
  getDirtyIds,
} = useControlValues(instanceRef);

const statusMessage = ref('');
const pendingImport = ref<{ device: string; values: Record<string, unknown> } | null>(null);
const dirtyIdList = computed(() => getDirtyIds());
const dirtySet = computed(() => new Set(dirtyIdList.value));
const dirtyCount = computed(() => dirtyIdList.value.length);
const canApply = computed(() => props.interactionMode === 'preset' && dirtyCount.value > 0 && props.isOutputReady);
const canCancel = computed(() => props.interactionMode === 'preset' && dirtyCount.value > 0);

const fileInputEl = ref<HTMLInputElement | null>(null);
const fileInput = computed(() => fileInputEl.value);

watch(() => props.interactionMode, (mode, previous) => {
  if (mode === 'live' && previous === 'preset') {
    resetDraft();
  }
});

watch(dirtyIdList, () => {
  statusMessage.value = '';
});

watch(dirtyCount, (count) => {
  emit('dirty-state', { id: props.instance.id, dirty: count > 0 });
}, { immediate: true });

watch(() => props.instance.device, applyPendingImport);
watch(selectedConfig, applyPendingImport);

function isControlDirty(id: string) {
  return dirtySet.value.has(id);
}

function onValue(ctrl: AnyControl, v: number) {
  setDraftValue(ctrl.id, v);
  if (props.interactionMode === 'live') {
    const err = sendControlChange(ctrl.cc, v, { channel: channel.value });
    if (!err) {
      commitValue(ctrl.id, v);
      statusMessage.value = t('controls.liveSent', { control: ctrl.label });
    }
  }
}

async function applyPresetChanges() {
  if (!canApply.value) return;
  const ids = dirtyIdList.value;
  for (const id of ids) {
    const ctrl = controlMap.value.get(id);
    if (!ctrl) continue;
    const raw = (draftValues as any)[id];
    const value = typeof raw === 'number' ? raw : Number(raw);
    if (Number.isNaN(value)) continue;
    const err = sendControlChange(ctrl.cc, value, { channel: channel.value });
    if (!err) commitValue(id, value);
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
  statusMessage.value = t('controls.applySuccess', { count: ids.length });
}

function cancelPresetChanges() {
  if (!canCancel.value) return;
  resetDraft();
  statusMessage.value = t('controls.cancelled');
}

function exportConfig(): void {
  const device = props.instance.device;
  if (!device) {
    window.alert(t('controls.noPedal'));
    return;
  }
  const payload = {
    $schema: 'mako-editor:preset',
    version: 1,
    device,
    channel: channel.value,
    values: snapshotCommitted(),
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

function resetFileInput() {
  const el = fileInput.value;
  if (el) el.value = '';
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === 'object' && !Array.isArray(v);
}

function normalizeImportedValues(values: Record<string, unknown>, config?: PedalConfig | undefined) {
  const allowedIds = new Set((config?.controls ?? []).map(c => c.id));
  const normalized: Record<string, number> = {};
  for (const [k, v] of Object.entries(values)) {
    if (!allowedIds.size || allowedIds.has(k)) {
      const num = typeof v === 'number' ? v : Number(v);
      if (!Number.isNaN(num)) normalized[k] = num;
    }
  }
  return normalized;
}

function applyPendingImport() {
  const pending = pendingImport.value;
  if (!pending) return;
  if (props.instance.device && props.instance.device === pending.device) {
    const normalized = normalizeImportedValues(pending.values, selectedConfig.value);
    if (Object.keys(normalized).length > 0) commitMany(normalized);
    pendingImport.value = null;
  }
}

async function onImportFile(ev: Event) {
  const input = ev.target as HTMLInputElement;
  const file = input.files?.[0];
  try {
    if (!file) return;
    const text = await file.text();
    const data = JSON.parse(text) as unknown;
    if (!isRecord(data)) throw new Error(t('controls.invalidConfig'));
    const device = typeof data.device === 'string' ? data.device : '';
    const vals = (isRecord(data.values) ? data.values : null) as Record<string, unknown> | null;
    const importedChannel = typeof (data as any).channel === 'number' ? (data as any).channel : undefined;
    if (!device || !vals) throw new Error(t('controls.invalidConfig'));

    const config = getPedalByDevice(device);
    if (config) emit('update-device', { id: props.instance.id, device });
    else {
      console.warn(t('controls.unknownPedal', { device }));
    }

    if (importedChannel != null) emit('update-channel', { id: props.instance.id, channel: importedChannel });

    const targetConfig = config ?? selectedConfig.value;
    const normalized = normalizeImportedValues(vals, targetConfig);
    if (props.instance.device && props.instance.device === device) {
      if (Object.keys(normalized).length > 0) {
        commitMany(normalized);
      }
    } else {
      pendingImport.value = { device, values: vals };
      applyPendingImport();
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    window.alert(t('controls.loadFailed', { message: msg }));
  } finally {
    if (input) input.value = '';
    resetFileInput();
  }
}

const controlsCardStyle = computed(() => {
  const cfg = selectedConfig.value;
  const style: Record<string, string> = {};
  const bg = cfg?.backgroundColor ?? cfg?.color;
  if (bg) style.backgroundColor = bg;
  const textColor = cfg?.textColor;
  if (textColor) style.color = textColor;
  const secondary = cfg?.secondaryBgColor;
  if (secondary) style['--secondary-surface'] = secondary;
  return style;
});
</script>

<style scoped>
.pedal-card {
  border: 1px solid var(--border);
  border-radius: 1.25rem;
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  background: var(--surface);
  box-shadow: var(--shadow-1);
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
  will-change: transform, box-shadow;
}
.pedal-card:hover,
.pedal-card:focus-within {
  transform: translateY(-4px);
  border-color: color-mix(in srgb, var(--primary) 45%, var(--border));
  box-shadow:
    0 18px 40px color-mix(in srgb, var(--primary) 24%, transparent),
    var(--shadow-1);
}
.card-header {
  display: flex;
  justify-content: space-between;
  gap: var(--space-3);
  align-items: flex-start;
}
.card-body {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
.card-title {
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--space-1);
}
.card-subtitle {
  margin: 0;
  color: var(--muted);
  font-size: var(--font-sm);
}
.color-dot {
  width: var(--space-3);
  height: var(--space-3);
  border-radius: 50%;
  border: 1px solid rgba(0,0,0,0.15);
}
.card-actions {
  display: flex;
  gap: var(--space-1);
}
.icon-btn {
  border: 1px solid var(--pedal-accent, var(--border));
  border-radius: 0.5rem;
  background: transparent;
  padding: 0.15rem 0.5rem;
  cursor: pointer;
  color: var(--pedal-accent, inherit);
  transition: transform 0.18s ease, box-shadow 0.18s ease, background-color 0.15s ease, color 0.15s ease;
  will-change: transform;
}
.icon-btn:hover:not(:disabled),
.icon-btn:focus-visible {
  background: color-mix(in srgb, var(--pedal-accent, var(--primary)) 12%, transparent);
  transform: translateY(-1px);
  box-shadow: var(--focus-ring);
}
.controls-header {
  display: flex;
  justify-content: space-between;
  gap: var(--space-3);
  flex-wrap: wrap;
}
.controls-actions {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
  justify-content: flex-end;
}
.mode-info {
  margin: 0;
  color: var(--muted);
}
.dirty-indicator {
  margin: 0;
  font-weight: var(--weight-semibold);
  color: var(--warning);
}
.empty {
  margin: 0;
  color: var(--muted);
}
.controls-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: var(--space-5);
}
.status {
  margin: 0;
  color: var(--muted);
}
</style>
