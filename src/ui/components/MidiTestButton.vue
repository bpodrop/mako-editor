<template>
  <div class="midi-test">
    <button class="btn" type="button" :disabled="disabled" @click="testConnection">
      {{ t('midi.testButton') }}
    </button>
    <p v-if="message" class="test-message" role="status" aria-live="polite">
      {{ message }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMidi } from '../composables/useMidiStore';
import { useMidiControls } from '../../application/use-midi-controls';

const { isOutputReady, channel } = useMidi();
const { sendProgramChange } = useMidiControls();
const message = ref('');
const disabled = computed(() => !isOutputReady.value);
const { t } = useI18n();

function testConnection() {
  const err = sendProgramChange(0);
  if (!err) {
    message.value = t('midi.testSent', { channel: channel.value });
    window.setTimeout(() => { message.value = ''; }, 5000);
  }
}
</script>

<style scoped>
.midi-test {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.test-message {
  font-size: 0.85rem;
  color: var(--muted);
  margin: 0;
}
</style>
