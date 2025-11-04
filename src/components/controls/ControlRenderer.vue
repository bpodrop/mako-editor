<template>
  <div>
    <RangeControl
      v-if="control.type === 'range'"
      :control="control"
      :channel="channel"
      :modelValue="value"
      :disabled="disabled"
      @update:value="forward"
    />
    <EnumControl
      v-else-if="control.type === 'enum'"
      :control="control"
      :channel="channel"
      :modelValue="value"
      :disabled="disabled"
      @update:value="forward"
    />
    <ZoneEnumControl
      v-else-if="control.type === 'zoneEnum'"
      :control="control"
      :channel="channel"
      :modelValue="value"
      :disabled="disabled"
      @update:value="forward"
    />
    <ToggleControl
      v-else-if="control.type === 'toggle'"
      :control="control"
      :channel="channel"
      :modelValue="value"
      :disabled="disabled"
      @update:value="forward"
    />
    <MomentaryControl
      v-else-if="control.type === 'momentary'"
      :control="control"
      :channel="channel"
      :disabled="disabled"
      @update:value="forward"
    />
  </div>
</template>

<script setup lang="ts">
import type { AnyControl } from '../../types/controls';
import RangeControl from './RangeControl.vue';
import EnumControl from './EnumControl.vue';
import ZoneEnumControl from './ZoneEnumControl.vue';
import ToggleControl from './ToggleControl.vue';
import MomentaryControl from './MomentaryControl.vue';

const props = defineProps<{
  control: AnyControl;
  channel: number;
  value?: number;
  disabled?: boolean;
}>();

const emit = defineEmits<{ (e: 'update:value', value: number): void }>();

function forward(v: number) { emit('update:value', v); }
</script>

<style scoped>
div { display: flex; flex-direction: column; gap: .5rem; }
</style>

