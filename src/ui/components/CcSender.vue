<template>
  <div class="panel">
    <h2>{{ t('ccSender.title') }}</h2>
    <div class="grid">
      <div>
        <label class="label" for="cc-controller">{{ t('ccSender.controller') }}</label>
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
        <label class="label" for="cc-value">{{ t('ccSender.value') }}</label>
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
      <button class="btn" type="button" :disabled="disabled" @click="send">{{ t('ccSender.send') }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMidi } from '../../ui/composables/useMidiStore';
import { useMidiControls } from '../../application/use-midi-controls';

const { isOutputReady } = useMidi();
const { sendControlChange } = useMidiControls();
const controller = ref<number>(0);
const value = ref<number>(0);
const disabled = computed(() => !isOutputReady.value);
const { t } = useI18n();

function send() { sendControlChange(controller.value, value.value); }
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
