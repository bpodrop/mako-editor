<template>
  <div class="container">
    <header class="header">
      <h1>MIDI Controller (PWA)</h1>
      <p class="subtitle">PC & CC via Web MIDI — Walrus Audio Mako</p>
    </header>

    <section class="card">
      <DeviceSelect />
      <ChannelPicker />
    </section>

    <section class="card grid">
      <PcSender />
      <CcSender />
    </section>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

    <footer class="footer">
      <small>
        Web MIDI requires a secure context (HTTPS or localhost).<br />
        This app is installable (PWA) — add it to your home screen.
      </small>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { midiStore } from '../store/midi.store';
import DeviceSelect from './components/DeviceSelect.vue';
import ChannelPicker from './components/ChannelPicker.vue';
import PcSender from './components/PcSender.vue';
import CcSender from './components/CcSender.vue';

onMounted(() => {
  void midiStore.init();
});

const errorMessage = computed(() => midiStore.errorMessage.value);
</script>

<style scoped>
.container {
  max-width: 880px;
  margin: 0 auto;
  padding: 1rem;
}
.header {
  margin-bottom: 1rem;
}
.subtitle {
  color: #666;
  margin: 0.25rem 0 0;
}
.card {
  background: #fff;
  border: 1px solid #e6e6e6;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}
.error {
  color: #b00020;
}
.footer {
  margin-top: 2rem;
  color: #666;
}
</style>
