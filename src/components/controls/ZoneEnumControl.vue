<template>
  <div class="ctrl">
    <label class="label" :for="id">{{ control.label }}</label>
    <select
      :id="id"
      class="select"
      :disabled="disabled"
      :aria-label="control.label"
      v-model="selectedName"
      @change="onChange"
    >
      <option v-for="z in zones" :key="z.name" :value="z.name">{{ z.name }}</option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { ZoneEnumControl as ZoneEnumCtrl, ZoneDef } from '../../types/controls';

const props = defineProps<{
  control: ZoneEnumCtrl;
  modelValue?: number;
  disabled?: boolean;
}>();

const emit = defineEmits<{ (e: 'update:value', value: number): void }>();

const id = computed(() => `ctrl-${props.control.id}`);
const collator = new Intl.Collator('fr', { sensitivity: 'base' });
const zones = computed<ZoneDef[]>(() => [...props.control.zones].sort((a, b) => collator.compare(a.name, b.name)));

function nameFromValue(val?: number): string | '' {
  if (typeof val !== 'number') return '';
  const found = zones.value.find(z => val >= z.min && val <= z.max)?.name;
  return found ?? '';
}

const selectedName = ref<string>(nameFromValue(props.modelValue));

watch(() => props.modelValue, (v) => {
  const n = nameFromValue(v);
  if (n !== selectedName.value) selectedName.value = n;
});

function onChange() {
  const z = zones.value.find(x => x.name === selectedName.value);
  if (!z) return;
  const mid = Math.round((z.min + z.max) / 2);
  emit('update:value', mid);
}
</script>

<style scoped>
.ctrl { display: flex; flex-direction: column; gap: .5rem; }
.label { font-weight: 500; }
.select { max-width: 100%; }
</style>
