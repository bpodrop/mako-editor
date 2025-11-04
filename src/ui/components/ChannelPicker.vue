<template>
  <div>
    <label class="label" for="midi-channel">MIDI Channel</label>
    <select
      id="midi-channel"
      class="select"
      :value="channel"
      @change="onChange($event as Event)"
    >
      <option v-for="c in channels" :key="c" :value="c">{{ c }}</option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { midiStore } from '../../store/midi.store';

const channels = Array.from({ length: 16 }, (_, i) => i + 1);
const channel = computed(() => midiStore.channel.value);

function onChange(e: Event) {
  const value = Number((e.target as HTMLSelectElement).value);
  midiStore.setChannel(value);
}
</script>

<style scoped>
.label {
  display: block;
  margin-bottom: 0.25rem;
}
.select {
  width: 100%;
}
</style>
