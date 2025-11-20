<template>
  <Teleport to="body">
    <div v-if="open" class="add-pedal-dialog">
      <div class="dialog-overlay" @click="handleCancel" />
      <div
        class="dialog-panel"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        :aria-describedby="descriptionId"
        ref="panelRef"
        tabindex="-1"
        @keydown.esc.prevent.stop="handleCancel"
      >
        <header class="dialog-header">
          <div class="dialog-header-bar">
            <span class="dialog-mode-tag" :data-mode="dialogMode">{{ dialogModeLabel }}</span>
          </div>
          <div class="dialog-header-copy">
            <h2 :id="titleId">{{ dialogTitle }}</h2>
            <p :id="descriptionId" class="dialog-description">{{ dialogDescription }}</p>
          </div>
        </header>

        <form class="dialog-body" @submit.prevent="handleConfirm">
          <div class="dialog-fields">
            <label class="label" :for="deviceId">{{ t('board.pedalSelect') }}</label>
            <select
              :id="deviceId"
              v-model="selectedDevice"
              class="select"
              required
            >
              <option disabled value="">{{ t('board.selectPedalPlaceholder') }}</option>
              <option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>

            <label class="label" :for="channelId">{{ t('board.channelSelect') }}</label>
            <select
              :id="channelId"
              v-model.number="selectedChannel"
              class="select"
            >
              <option v-for="channel in midiChannels" :key="channel" :value="channel">
                {{ t('board.channelLabel', { channel }) }}
              </option>
            </select>
          </div>

          <div class="dialog-footer">
            <button type="button" class="btn ghost" @click="handleCancel">
              {{ t('board.addPedalCancel') }}
            </button>
            <button type="submit" class="btn" :disabled="!selectedDevice">
              {{ confirmLabel }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

interface Option {
  value: string;
  label: string;
}

type DialogMode = 'add' | 'edit';

const props = defineProps<{
  open: boolean;
  options: Option[];
  initialDevice?: string | null;
  initialChannel?: number | null;
  mode?: DialogMode;
}>();

const emit = defineEmits<{
  (e: 'confirm', payload: { device: string; channel: number }): void;
  (e: 'cancel'): void;
}>();

const { t } = useI18n();
const panelRef = ref<HTMLDivElement | null>(null);
const selectedDevice = ref('');
const selectedChannel = ref(1);
const baseId = Math.random().toString(36).slice(2, 8);
const titleId = `add-pedal-title-${baseId}`;
const descriptionId = `add-pedal-description-${baseId}`;
const deviceId = `add-pedal-device-${baseId}`;
const channelId = `add-pedal-channel-${baseId}`;

const midiChannels = computed(() => Array.from({ length: 16 }, (_, index) => index + 1));
const dialogMode = computed<DialogMode>(() => props.mode ?? 'add');
const dialogTitle = computed(() =>
  dialogMode.value === 'edit' ? t('board.editPedalTitle') : t('board.addPedalTitle')
);
const dialogDescription = computed(() =>
  dialogMode.value === 'edit' ? t('board.editPedalDescription') : t('board.addPedalDescription')
);
const confirmLabel = computed(() =>
  dialogMode.value === 'edit' ? t('board.editPedalConfirm') : t('board.addPedalConfirm')
);
const dialogModeLabel = computed(() =>
  dialogMode.value === 'edit' ? t('board.editPedal') : t('board.addPedal')
);

function sanitizeChannel(value?: number | null) {
  if (typeof value === 'number' && value >= 1 && value <= 16) return value;
  return 1;
}

function resetSelections() {
  const fallbackDevice = props.initialDevice && props.options.some((opt) => opt.value === props.initialDevice)
    ? props.initialDevice
    : props.options[0]?.value ?? '';
  selectedDevice.value = fallbackDevice;
  selectedChannel.value = sanitizeChannel(props.initialChannel);
}

watch(() => props.open, (isOpen) => {
  if (isOpen) {
    resetSelections();
    nextTick(() => panelRef.value?.focus());
  }
});

watch(() => props.initialDevice, (device) => {
  if (!props.open) return;
  if (device && props.options.some((opt) => opt.value === device)) {
    selectedDevice.value = device;
  }
});

watch(() => props.initialChannel, (channel) => {
  if (!props.open) return;
  selectedChannel.value = sanitizeChannel(channel);
});

function handleCancel() {
  emit('cancel');
}

function handleConfirm() {
  if (!selectedDevice.value) return;
  emit('confirm', {
    device: selectedDevice.value,
    channel: selectedChannel.value,
  });
}
</script>

<style scoped>
.add-pedal-dialog {
  position: fixed;
  inset: 0;
  z-index: 1500;
}
.dialog-overlay {
  position: absolute;
  inset: 0;
  background: rgba(6, 11, 25, 0.65);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}
.dialog-panel {
  position: relative;
  margin: 5vh auto;
  max-width: 460px;
  background: color-mix(in srgb, var(--surface) 90%, transparent);
  border-radius: calc(var(--radius) * 1.5);
  border: 1px solid color-mix(in srgb, var(--primary) 25%, var(--border));
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.25);
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  outline: none;
  max-height: 90vh;
  overflow: hidden;
}
.dialog-header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.dialog-header-bar {
  display: flex;
  justify-content: flex-end;
}
.dialog-mode-tag {
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 0.2rem 0.75rem;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--primary) 50%, transparent);
  color: var(--primary);
  background: color-mix(in srgb, var(--primary) 12%, transparent);
}
.dialog-mode-tag[data-mode='edit'] {
  color: var(--warning, #a15c25);
  border-color: color-mix(in srgb, var(--warning, #a15c25) 60%, transparent);
  background: color-mix(in srgb, var(--warning, #a15c25) 18%, transparent);
}
.dialog-header h2 {
  margin: 0 0 0.35rem;
  font-size: 1.25rem;
}
.dialog-description {
  margin: 0;
  color: var(--muted);
}
.dialog-body {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-bottom: 0.5rem;
}
.dialog-fields {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}
.dialog-footer {
  margin: 0 calc(-1.75rem) -1.75rem;
  padding: 1rem 1.75rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  position: sticky;
  bottom: -1.75rem;
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--surface) 70%, transparent) 0%,
    color-mix(in srgb, var(--surface) 96%, transparent) 70%
  );
  border-top: 1px solid color-mix(in srgb, var(--primary) 15%, var(--border));
}
.dialog-footer .btn.ghost {
  color: inherit;
}
.label {
  display: block;
  font-weight: 500;
}
.select {
  width: 100%;
}
@media (max-width: 480px) {
  .dialog-panel {
    margin: 0;
    min-height: 100%;
    border-radius: 0;
    padding: 1.5rem 1.5rem 0;
  }
  .dialog-footer {
    margin: 0 -1.5rem -1.5rem;
    padding: 0.85rem 1.5rem max(env(safe-area-inset-bottom), 1rem);
  }
}
</style>
