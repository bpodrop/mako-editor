<template>
  <div>
    <label class="label" for="midi-channel">{{ t('channel.label') }}</label>
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
import { useI18n } from 'vue-i18n';
import { useMidi } from '../../ui/composables/useMidiStore';

const midi = useMidi();
const channels = Array.from({ length: 16 }, (_, i) => i + 1);
const channel = computed(() => midi.channel.value);
const { t } = useI18n();

function onChange(e: Event) {
  const value = Number((e.target as HTMLSelectElement).value);
  midi.setChannel(value);
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
