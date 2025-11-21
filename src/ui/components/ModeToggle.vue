<template>
  <div class="mode-toggle">
    <div class="label-row">
      <span :id="labelId" class="label">{{ t('modes.label') }}</span>
      <div
        v-if="hasTooltipContent"
        class="tooltip-wrapper"
        @mouseenter="showTooltip"
        @mouseleave="hideTooltip"
      >
        <button
          type="button"
          class="info-btn"
          aria-haspopup="true"
          :aria-label="t('modes.infoLabel')"
          :aria-describedby="tooltipId"
          :aria-expanded="isTooltipVisible ? 'true' : 'false'"
          @focus="showTooltip"
          @blur="hideTooltip"
          @keydown.escape.prevent.stop="hideTooltip"
        >
          i
        </button>
        <div
          :id="tooltipId"
          class="tooltip"
          role="tooltip"
          :data-visible="isTooltipVisible ? 'true' : 'false'"
          :aria-hidden="isTooltipVisible ? 'false' : 'true'"
        >
          <p v-for="entry in tooltipEntries" :key="entry.mode" class="tooltip-entry">
            <span class="tooltip-mode">{{ entry.label }}</span>
            <span class="tooltip-text">{{ entry.description }}</span>
          </p>
        </div>
      </div>
    </div>
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
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

type InteractionMode = 'live' | 'preset';

const props = defineProps<{
  modelValue: InteractionMode;
  descriptions?: Partial<Record<InteractionMode, string>>;
}>();

const emit = defineEmits<{ (e: 'update:modelValue', value: InteractionMode): void }>();
const { t } = useI18n();

const labelId = `mode-toggle-label-${Math.random().toString(36).slice(2, 8)}`;
const tooltipId = `mode-tooltip-${Math.random().toString(36).slice(2, 8)}`;
const isTooltipVisible = ref(false);
const tooltipEntries = computed(() => {
  const entries: Array<{ mode: InteractionMode; label: string; description: string }> = [];
  const modes: InteractionMode[] = ['live', 'preset'];
  for (const mode of modes) {
    const override = sanitize(props.descriptions?.[mode]);
    const fallback = sanitize(mode === 'live' ? t('modes.descriptionLive') : t('modes.descriptionPreset'));
    const description = override || fallback;
    if (!description) continue;
    const label = mode === 'live' ? t('modes.live') : t('modes.preset');
    entries.push({ mode, label, description });
  }
  return entries;
});
const hasTooltipContent = computed(() => tooltipEntries.value.length > 0);

function toggleMode() {
  const next = props.modelValue === 'live' ? 'preset' : 'live';
  emit('update:modelValue', next);
}

function showTooltip() {
  if (!hasTooltipContent.value) return;
  isTooltipVisible.value = true;
}

function hideTooltip() {
  isTooltipVisible.value = false;
}

function sanitize(value?: string | null) {
  return (value ?? '').trim();
}
</script>

<style scoped>
.mode-toggle {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.label-row {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}
.label {
  font-size: 0.875rem;
  color: var(--muted);
}
.tooltip-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
}
.info-btn {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--muted);
  font-size: 0.75rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}
.info-btn:hover {
  color: var(--primary);
  border-color: var(--primary);
}
.info-btn:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
.tooltip {
  position: absolute;
  top: 50%;
  left: calc(100% + 0.5rem);
  transform: translateY(-50%);
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid var(--border);
  background: var(--surface);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  font-size: 0.8rem;
  color: var(--text, inherit);
  width: min(260px, 80vw);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s ease;
  z-index: 5;
}
.tooltip[data-visible='true'] {
  opacity: 1;
}
.tooltip-entry {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}
.tooltip-entry + .tooltip-entry {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--border);
}
.tooltip-mode {
  font-weight: 600;
  font-size: 0.8rem;
  color: var(--muted);
}
.tooltip-text {
  font-size: 0.8rem;
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
