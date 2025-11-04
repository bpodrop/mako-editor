<template>
  <div class="panel">
    <h2>Control Change</h2>
    <div class="grid">
      <div>
        <label class="label" for="cc-controller">Controller (0-127)</label>
        <input
          id="cc-controller"
          class="input"
          type="number"
          min="0"
          max="127"
          step="1"
          v-model.number="controller"
        />
      </div>
      <div>
        <label class="label" for="cc-value">Value (0-127)</label>
        <div class="row">
          <input
            id="cc-value"
            class="input"
            type="number"
            min="0"
            max="127"
            step="1"
            v-model.number="value"
          />
          <input
            type="range"
            min="0"
            max="127"
            step="1"
            v-model.number="value"
          />
        </div>
      </div>
    </div>
    <div class="actions">
      <button class="btn" type="button" :disabled="disabled" @click="send">Send CC</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { midiStore } from '../../store/midi.store';

const controller = ref<number>(0);
const value = ref<number>(0);
const disabled = computed(() => !midiStore.selectedOutput.value);

function send() {
  midiStore.sendControlChange(controller.value, value.value);
}
</script>

<style scoped>
.panel {
  display: flex;
  flex-direction: column;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.75rem;
}
.row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}
.label {
  display: block;
  margin-bottom: 0.25rem;
}
.actions {
  margin-top: 0.75rem;
}
.input {
  width: 100px;
}
</style>
