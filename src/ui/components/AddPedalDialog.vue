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
          <h2 :id="titleId">{{ t('board.addPedalTitle') }}</h2>
          <p :id="descriptionId" class="dialog-description">{{ t('board.addPedalDescription') }}</p>
        </header>

        <form class="dialog-body" @submit.prevent="handleConfirm">
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

          <div class="dialog-actions">
            <button type="button" class="btn ghost" @click="handleCancel">
              {{ t('board.addPedalCancel') }}
            </button>
            <button type="submit" class="btn" :disabled="!selectedDevice">
              {{ t('board.addPedalConfirm') }}
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

const props = defineProps<{
  open: boolean;
  options: Option[];
  initialDevice?: string | null;
  initialChannel?: number | null;
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
  background: rgba(0, 0, 0, 0.45);
}
.dialog-panel {
  position: relative;
  margin: 5vh auto;
  max-width: 460px;
  background: var(--surface);
  border-radius: var(--radius);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-2);
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  outline: none;
}
.dialog-header h2 {
  margin: 0 0 0.35rem;
}
.dialog-description {
  margin: 0;
  color: var(--muted);
}
.dialog-body {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.label {
  display: block;
  font-weight: 500;
}
.select {
  width: 100%;
}
.dialog-actions {
  margin-top: 0.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}
@media (max-width: 480px) {
  .dialog-panel {
    margin: 0;
    min-height: 100%;
    border-radius: 0;
    justify-content: center;
  }
}
</style>
