<template>
  <div class="panel">
    <h2>Program Change</h2>
    <label class="label" for="pc-program">Program (0-127)</label>
    <div class="row">
      <input
        id="pc-program"
        class="input"
        type="number"
        min="0"
        max="127"
        step="1"
        v-model.number="program"
      />
      <button class="btn" type="button" :disabled="disabled" @click="send">Send PC</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { midiStore } from '../../store/midi.store';

const program = ref<number>(0);
const disabled = computed(() => !midiStore.selectedOutput.value);

function send() {
  midiStore.sendProgramChange(program.value);
}
</script>

<style scoped>
.panel {
  display: flex;
  flex-direction: column;
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
.input {
  flex: 1;
}
</style>
