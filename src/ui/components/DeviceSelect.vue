<template>
  <div>
    <label class="label" for="midi-output">MIDI Output</label>
    <div class="row">
      <select
        id="midi-output"
        class="select"
        :value="selectedId"
        @change="onChange($event as Event)"
      >
        <option v-if="outputs.length === 0" disabled value="">No output available</option>
        <option v-for="o in outputs" :key="o.id" :value="o.id">
          {{ o.name || 'Unnamed output' }}
          <span v-if="o.manufacturer"> — {{ o.manufacturer }}</span>
        </option>
      </select>
      <button class="btn" type="button" @click="refresh">Refresh</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useMidi } from '../../store/useMidi';

const midi = useMidi();
const outputs = computed(() => midi.outputs.value);
const selectedId = computed(() => midi.selectedOutputId.value ?? '');

function onChange(e: Event) {
  const target = e.target as HTMLSelectElement;
  const id = target.value || null;
  midi.setSelectedOutput(id);
}

function refresh() {
  void midi.refreshOutputs();
}
</script>

<style scoped>
.row {
  display: flex;
  gap: 0.5rem;
}
.label {
  display: block;
  margin-bottom: 0.25rem;
}
.select {
  flex: 1;
}
.btn {
  white-space: nowrap;
}
</style>
