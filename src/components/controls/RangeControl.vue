<template>
  <div class="ctrl">
    <label class="label" :for="id">{{ control.label }}</label>
    <div class="row">
      <input
        :id="id"
        class="range"
        type="range"
        :min="control.min"
        :max="control.max"
        :step="1"
        :value="current"
        :disabled="disabled"
        :aria-label="control.label"
        role="slider"
        :aria-valuemin="control.min"
        :aria-valuemax="control.max"
        :aria-valuenow="current"
        @input="onInput"
      />
      <output :for="id" class="val" aria-live="polite">{{ current }}</output>
    </div>
  </div>
  
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useMidi } from '../../store/useMidi';
import type { RangeControl as RangeCtrl } from '../../types/controls';

const props = defineProps<{
  control: RangeCtrl;
  modelValue?: number;
  disabled?: boolean;
}>();

const emit = defineEmits<{ (e: 'update:value', value: number): void }>();

const midi = useMidi();

const id = computed(() => `ctrl-${props.control.id}`);
const current = ref<number>(
  typeof props.modelValue === 'number' ? props.modelValue : props.control.min
);

watch(() => props.modelValue, (v) => {
  if (typeof v === 'number' && v !== current.value) current.value = v;
});

function clamp(n: number, a: number, b: number) { return Math.max(a, Math.min(b, n)); }

function onInput(e: Event) {
  const t = e.target as HTMLInputElement;
  const raw = Number(t.value);
  const next = clamp(Math.round(raw), props.control.min, props.control.max);
  current.value = next;
  emit('update:value', next);
  midi.sendControlChange(props.control.cc, next);
}
</script>

<style scoped>
.ctrl { display: flex; flex-direction: column; gap: .5rem; }
.row { display: flex; align-items: center; gap: .5rem; }
.label { font-weight: 500; }
.range { flex: 1; }
.val { min-width: 2ch; text-align: right; }
</style>
