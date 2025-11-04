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
import { midiStore } from '../../store/midi.store';

const outputs = computed(() => midiStore.outputs.value);
const selectedId = computed(() => midiStore.selectedOutputId.value ?? '');

function onChange(e: Event) {
  const target = e.target as HTMLSelectElement;
  const id = target.value || null;
  midiStore.setSelectedOutput(id);
}

function refresh() {
  void midiStore.refreshOutputs();
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
