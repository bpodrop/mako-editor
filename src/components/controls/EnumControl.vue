<template>
  <div class="ctrl">
    <label class="label" :for="id">{{ control.label }}</label>
    <select
      :id="id"
      class="select"
      :disabled="disabled"
      :aria-label="control.label"
      v-model="selectedKey"
      @change="onChange"
    >
      <option v-for="k in keys" :key="k" :value="k">{{ k }}</option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useMidi } from '../../store/useMidi';
import type { EnumControl as EnumCtrl } from '../../types/controls';

const props = defineProps<{
  control: EnumCtrl;
  modelValue?: number;
  disabled?: boolean;
}>();

const emit = defineEmits<{ (e: 'update:value', value: number): void }>();

const midi = useMidi();

const id = computed(() => `ctrl-${props.control.id}`);
const collator = new Intl.Collator('fr', { sensitivity: 'base' });
const keys = computed(() => Object.keys(props.control.map).sort(collator.compare));

function keyFromValue(val?: number): string | '' {
  if (typeof val !== 'number') return '';
  const found = Object.entries(props.control.map).find(([, v]) => v === val)?.[0];
  return found ?? '';
}

const selectedKey = ref<string>(keyFromValue(props.modelValue));

watch(() => props.modelValue, (v) => {
  const k = keyFromValue(v);
  if (k !== selectedKey.value) selectedKey.value = k;
});

function onChange() {
  const k = selectedKey.value;
  if (!k) return;
  const value = props.control.map[k];
  if (typeof value !== 'number') return;
  emit('update:value', value);
  midi.sendControlChange(props.control.cc, value);
}
</script>

<style scoped>
.ctrl { display: flex; flex-direction: column; gap: .5rem; }
.label { font-weight: 500; }
.select { max-width: 100%; }
</style>
