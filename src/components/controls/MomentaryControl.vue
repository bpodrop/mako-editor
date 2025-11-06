<template>
  <div class="ctrl">
    <button
      class="btn"
      type="button"
      :id="id"
      :disabled="disabled"
      :aria-label="control.label"
      @click="fire"
      @keydown.space.prevent="fire"
      @keydown.enter.prevent="fire"
      @mousedown.prevent="fire"
    >
      {{ control.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { MomentaryControl as MomentaryCtrl } from '../../types/controls';

const props = defineProps<{
  control: MomentaryCtrl;
  disabled?: boolean;
}>();

const emit = defineEmits<{ (e: 'update:value', value: number): void }>();

const id = computed(() => `ctrl-${props.control.id}`);

function fire() {
  const value = props.control.value ?? 127;
  emit('update:value', value);
}
</script>

<style scoped>
.ctrl { display: flex; flex-direction: column; gap: .5rem; }
.btn { padding: .4rem .75rem; border: 1px solid #ddd; border-radius: 6px; background: #f7f7f7; cursor: pointer; }
.btn:disabled { cursor: not-allowed; opacity: .6; }
.btn:focus { outline: 2px solid #2684ff; outline-offset: 2px; }
</style>
