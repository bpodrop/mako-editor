<template>
  <div class="control-wrapper" :class="{ dirty }">
    <RangeControl
      v-if="control.type === 'range'"
      :control="control"
      :modelValue="value"
      :disabled="disabled"
      @update:value="forward"
    />
    <EnumControl
      v-else-if="control.type === 'enum'"
      :control="control"
      :modelValue="value"
      :disabled="disabled"
      @update:value="forward"
    />
    <ZoneEnumControl
      v-else-if="control.type === 'zoneEnum'"
      :control="control"
      :modelValue="value"
      :disabled="disabled"
      @update:value="forward"
    />
    <ToggleControl
      v-else-if="control.type === 'toggle'"
      :control="control"
      :modelValue="value"
      :disabled="disabled"
      @update:value="forward"
    />
    <MomentaryControl
      v-else-if="control.type === 'momentary'"
      :control="control"
      :disabled="disabled"
      @update:value="forward"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { AnyControl } from '../../../core/entities/controls';
import RangeControl from './RangeControl.vue';
import EnumControl from './EnumControl.vue';
import ZoneEnumControl from './ZoneEnumControl.vue';
import ToggleControl from './ToggleControl.vue';
import MomentaryControl from './MomentaryControl.vue';

const props = defineProps<{
  control: AnyControl;
  value?: number;
  disabled?: boolean;
  dirty?: boolean;
}>();

const emit = defineEmits<{ (e: 'update:value', value: number): void }>();

const dirty = computed(() => props.dirty ?? false);

function forward(v: number) { emit('update:value', v); }
</script>

<style scoped>
.control-wrapper {
  display: flex;
  flex-direction: column;
  gap: .5rem;
  border-left: 3px solid transparent;
  padding-left: .5rem;
}
.control-wrapper.dirty {
  border-left-color: var(--primary);
}
</style>
