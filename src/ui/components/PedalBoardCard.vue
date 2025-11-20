<template>
  <section
    class="pedal-card"
    :class="{ collapsed }"
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
          :title="collapsed ? t('board.expand') : t('board.collapse')"
          :aria-expanded="collapsed ? 'false' : 'true'"
          :aria-controls="bodyId"
          @click="emit('toggle-collapse', props.instance.id)"
        >
          <span aria-hidden="true">{{ collapsed ? '+' : '−' }}</span>
        </button>
        <button type="button" class="icon-btn" :title="t('board.moveUp')" @click="emit('move-up', props.instance.id)">
          ↑
        </button>
        <button type="button" class="icon-btn" :title="t('board.moveDown')" @click="emit('move-down', props.instance.id)">
          ↓
        </button>
        <button type="button" class="icon-btn" :title="t('board.duplicate')" @click="emit('duplicate', props.instance.id)">
          ⧉
        </button>
        <button type="button" class="icon-btn danger" :title="t('board.remove')" @click="emit('remove', props.instance.id)">
          ✕
        </button>
      </div>
    </header>

    <div class="card-body" :id="bodyId" :aria-hidden="collapsed ? 'true' : 'false'" v-show="!collapsed">
      <div class="card-tools">
        <button class="btn ghost" type="button" @click="() => fileInput?.click()">
          {{ t('board.import') }}
        </button>
        <button class="btn" type="button" @click="exportConfig">
          {{ t('board.export') }}
        </button>
        <input
          ref="fileInputEl"
          type="file"
          accept="application/json,.json"
          style="display:none"
          @change="onImportFile"
        />
      </div>

      <div class="controls-header">
        <div>
          <p class="mode-info">{{ modeDescription }}</p>
          <p v-if="props.interactionMode === 'preset' && dirtyCount > 0" class="dirty-indicator">
            {{ t('controls.dirtyHint', { count: dirtyCount }) }}
          </p>
        </div>
        <div class="controls-actions">
          <button class="btn" type="button" :disabled="!props.isOutputReady" @click="sendAll">
            {{ t('controls.sendAll') }}
          </button>
        <template v-if="props.interactionMode === 'preset'">
          <button class="btn" type="button" :disabled="!canApply" @click="applyPresetChanges">
            {{ t('controls.applyPreset') }}
          </button>
          <button class="btn ghost" type="button" :disabled="!canCancel" @click="cancelPresetChanges">
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

      <div class="card-footer">
        <PcSender
          :pedal-name="selectedConfig?.device"
          :pc-config="selectedConfig?.midi?.pc"
          :config="selectedConfig"
          :channel="channel"
        />
        <SnapshotManager
          :snapshots="snapshots"
          @save="handleSaveSnapshot"
          @apply="handleApplySnapshot"
          @delete="handleDeleteSnapshot"
        />
      </div>
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
import { useSnapshots } from '../../composables/useSnapshots';
import { getPedalByDevice } from '../../config/pedalConfig';
import { useMidiControls } from '../../application/use-midi-controls';
import type { PedalConfig } from '../../config/types';
import type { AnyControl } from '../../core/entities/controls';
import SnapshotManager from './SnapshotManager.vue';
import PcSender from './PcSender.vue';

const props = defineProps<{
  instance: PedalInstance;
  interactionMode: 'live' | 'preset';
  modeDescription: string;
  isOutputReady: boolean;
  collapsed?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update-device', payload: { id: string; device: string | null }): void;
  (e: 'update-channel', payload: { id: string; channel: number }): void;
  (e: 'duplicate', id: string): void;
  (e: 'remove', id: string): void;
  (e: 'move-up', id: string): void;
  (e: 'move-down', id: string): void;
  (e: 'dirty-state', payload: { id: string; dirty: boolean }): void;
  (e: 'toggle-collapse', id: string): void;
  (e: 'edit', id: string): void;
}>();

const { t } = useI18n();
const { sendControlChange } = useMidiControls();
const channel = computed(() => props.instance.channel);
const collapsed = computed(() => Boolean(props.collapsed));
const bodyId = computed(() => `pedal-body-${props.instance.id}`);

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
const modeDescription = computed(() => props.modeDescription);

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
  applyDraft,
  snapshotCommitted,
  getDirtyIds,
} = useControlValues(instanceRef);
const { snapshots, createSnapshot, removeSnapshot } = useSnapshots(instanceRef);

const statusMessage = ref('');
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

async function sendAll() {
  if (!props.isOutputReady) {
    window.alert(t('controls.noOutputAlert'));
    return;
  }
  const controls = visibleControls.value ?? [];
  for (const c of controls) {
    const raw = (draftValues as any)[c.id];
    const v = typeof raw === 'number' ? raw : Number(raw);
    if (!Number.isNaN(v)) {
      const err = sendControlChange(c.cc, v, { channel: channel.value });
      if (!err) commitValue(c.id, v);
      await new Promise((r) => setTimeout(r, 5));
    }
  }
  statusMessage.value = t('controls.sendAllDone', { count: controls.length });
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

function snapshotValues(): Record<string, number> {
  return snapshotCommitted();
}

function handleSaveSnapshot(name: string) {
  createSnapshot(name, snapshotCommitted());
  statusMessage.value = t('snapshots.saved', { name });
}

function handleApplySnapshot(id: string) {
  const snap = snapshots.value.find(s => s.id === id);
  if (!snap) return;
  applyDraft(snap.values);
  statusMessage.value = t('snapshots.applied', { name: snap.name });
}

function handleDeleteSnapshot(id: string) {
  const snap = snapshots.value.find(s => s.id === id);
  removeSnapshot(id);
  statusMessage.value = t('snapshots.deleted', { name: snap?.name ?? '' });
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

function resetFileInput() {
  const el = fileInput.value;
  if (el) el.value = '';
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === 'object' && !Array.isArray(v);
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
    const allowedIds = new Set((targetConfig?.controls ?? []).map(c => c.id));
    for (const [k, v] of Object.entries(vals)) {
      if (!allowedIds.size || allowedIds.has(k)) {
        const num = typeof v === 'number' ? v : Number(v);
        if (!Number.isNaN(num)) commitValue(k, num);
      }
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
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background: var(--surface);
}
.pedal-card.collapsed {
  gap: 0.25rem;
}
.card-header {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  align-items: flex-start;
}
.card-body {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.card-title {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}
.card-subtitle {
  margin: 0;
  color: var(--muted);
  font-size: 0.9rem;
}
.color-dot {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  border: 1px solid rgba(0,0,0,0.15);
}
.card-actions {
  display: flex;
  gap: 0.35rem;
}
.icon-btn {
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  background: transparent;
  padding: 0.15rem 0.5rem;
  cursor: pointer;
}
.icon-btn.danger {
  color: var(--danger, #c00);
  border-color: currentColor;
}
.card-tools {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}
.controls-header {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.controls-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}
.mode-info {
  margin: 0;
  color: var(--muted);
}
.dirty-indicator {
  margin: 0;
  font-weight: 600;
  color: var(--warning, #8a6d3b);
}
.empty {
  margin: 0;
  color: var(--muted);
}
.controls-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1rem;
}
.status {
  margin: 0;
  color: var(--muted);
}
.card-footer {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
  align-items: flex-start;
}
.btn.ghost {
  background: transparent;
  border: 1px dashed var(--border);
}
</style>
