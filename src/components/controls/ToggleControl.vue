<template>
  <div class="ctrl">
    <div class="row">
      <input
        :id="id"
        class="checkbox"
        type="checkbox"
        :checked="isOn"
        :disabled="disabled"
        :aria-checked="isOn.toString()"
        :aria-label="control.label"
        @change="onChange"
      />
      <label class="label" :for="id">{{ control.label }}</label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { midiStore } from '../../store/midi.store';
import type { ToggleControl as ToggleCtrl } from '../../types/controls';

const props = defineProps<{
  control: ToggleCtrl;
  modelValue?: number;
  disabled?: boolean;
}>();

const emit = defineEmits<{ (e: 'update:value', value: number): void }>();

const id = computed(() => `ctrl-${props.control.id}`);
const isOn = computed<boolean>(() => props.modelValue === props.control.on);

function onChange(e: Event) {
  const t = e.target as HTMLInputElement;
  const val = t.checked ? props.control.on : props.control.off;
  emit('update:value', val);
  midiStore.sendControlChange(props.control.cc, val);
}
</script>

<style scoped>
.ctrl { display: flex; flex-direction: column; gap: .5rem; }
.row { display: flex; align-items: center; gap: .5rem; }
.label { font-weight: 500; }
</style>
