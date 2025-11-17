<template>
  <div>
    <label class="label" for="midi-output">{{ t('device.label') }}</label>
    <div class="row">
      <select
        id="midi-output"
        class="select"
        :value="selectedId"
        @change="onChange($event as Event)"
      >
        <option v-if="outputs.length === 0" disabled value="">{{ t('device.empty') }}</option>
        <option v-for="o in outputs" :key="o.id" :value="o.id">
          {{ o.name || t('device.unnamed') }}
        </option>
      </select>
      <button class="btn" type="button" @click="refresh">{{ t('device.refresh') }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMidi } from '../../ui/composables/useMidiStore';

const midi = useMidi();
const outputs = computed(() => midi.outputs.value);
const selectedId = computed(() => midi.selectedOutputId.value ?? '');
const { t } = useI18n();

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
