<template>
  <div class="mode-toggle">
    <span :id="labelId" class="label">{{ t('modes.label') }}</span>
    <button
      type="button"
      class="toggle-btn"
      role="switch"
      :aria-labelledby="labelId"
      :aria-checked="props.modelValue === 'preset' ? 'true' : 'false'"
      @click="toggleMode"
    >
      <span class="toggle-thumb" :class="{ preset: props.modelValue === 'preset' }"></span>
      <span class="option" :class="{ active: props.modelValue === 'live' }">{{ t('modes.live') }}</span>
      <span class="option" :class="{ active: props.modelValue === 'preset' }">{{ t('modes.preset') }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

type InteractionMode = 'live' | 'preset';

const props = defineProps<{
  modelValue: InteractionMode;
}>();

const emit = defineEmits<{ (e: 'update:modelValue', value: InteractionMode): void }>();
const { t } = useI18n();

const labelId = `mode-toggle-label-${Math.random().toString(36).slice(2, 8)}`;

function toggleMode() {
  const next = props.modelValue === 'live' ? 'preset' : 'live';
  emit('update:modelValue', next);
}
</script>

<style scoped>
.mode-toggle {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.label {
  font-size: 0.875rem;
  color: var(--muted);
}
.toggle-btn {
  position: relative;
  display: inline-grid;
  grid-template-columns: repeat(2, minmax(70px, 1fr));
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--surface);
  cursor: pointer;
  font-weight: 600;
  overflow: hidden;
  transition: border-color 0.15s ease, background-color 0.15s ease;
}
.toggle-btn:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
.toggle-thumb {
  position: absolute;
  top: 4px;
  bottom: 4px;
  left: 4px;
  width: calc(50% - 4px);
  border-radius: 999px;
  background: var(--primary);
  transition: transform 0.2s ease;
}
.toggle-thumb.preset {
  transform: translateX(100%);
}
.option {
  position: relative;
  z-index: 1;
  text-align: center;
  font-size: 0.9rem;
  color: var(--muted);
  transition: color 0.2s ease;
}
.option.active {
  color: var(--primary-contrast);
}
</style>
