<template>
  <div class="mode-toggle">
    <label class="label" for="interaction-mode">{{ t('modes.label') }}</label>
    <select id="interaction-mode" class="select" :value="modelValue" @change="onChange">
      <option value="live">{{ t('modes.live') }}</option>
      <option value="preset">{{ t('modes.preset') }}</option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

type InteractionMode = 'live' | 'preset';

defineProps<{
  modelValue: InteractionMode;
}>();

const emit = defineEmits<{ (e: 'update:modelValue', value: InteractionMode): void }>();
const { t } = useI18n();

function onChange(e: Event) {
  const value = (e.target as HTMLSelectElement).value as InteractionMode;
  emit('update:modelValue', value);
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
.select {
  min-width: 140px;
}
</style>
