<template>
  <div class="pc">
    <div class="pc-header">
      <h2 class="pc-title">{{ t('pcSender.title') }}</h2>
      <span v-if="pedalName" class="pc-hint">{{ pedalName }}</span>
    </div>

    <div class="pc-row">
      <label class="label" for="pc-program">{{ t('pcSender.label') }}</label>
      <input
        id="pc-program"
        class="pc-input"
        type="number"
        min="0"
        max="127"
        step="1"
        v-model.number="program"
        aria-describedby="pc-help"
      />
      <button class="btn" type="button" :disabled="disabled" @click="send">{{ t('pcSender.select') }}</button>
    </div>
    <small id="pc-help" class="pc-help">{{ t('pcSender.range') }}</small>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMidi } from '../../ui/composables/useMidiStore';
import { useMidiControls } from '../../application/use-midi-controls';

const { pedalName } = defineProps<{ pedalName?: string }>();
const { isOutputReady } = useMidi();
const { sendProgramChange } = useMidiControls();
const program = ref<number>(0);
const disabled = computed(() => !isOutputReady.value);
const { t } = useI18n();

function send() { sendProgramChange(program.value); }
</script>

<style scoped>
.pc { display: flex; flex-direction: column; gap: .5rem; }
.pc-header { display: flex; align-items: baseline; justify-content: space-between; }
.pc-title { margin: 0; }
.pc-hint { color: var(--muted); font-weight: 600; }
.pc-row { display: flex; gap: .5rem; align-items: center; }
.pc-input { flex: 1; min-width: 0; }
.pc-help { color: var(--muted); }
</style>
