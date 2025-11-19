<template>
  <div class="pc">
    <div class="pc-header">
      <h2 class="pc-title">{{ t('pcSender.title') }}</h2>
      <span v-if="pedalName" class="pc-hint">{{ pedalName }}</span>
    </div>

    <div v-if="banks.length" class="pc-row bank-row">
      <label class="label" for="pc-bank">{{ t('pcSender.bank') }}</label>
      <select id="pc-bank" class="select" :value="selectedBank" @change="onBankChange">
        <option v-for="bank in banks" :key="bank.name" :value="bank.name">{{ bank.name }}</option>
      </select>
    </div>

    <div v-if="displayPresets.length" class="preset-grid">
      <button
        v-for="preset in displayPresets"
        :key="preset.id"
        class="preset-btn"
        type="button"
        :disabled="disabled"
        @click="applyPreset(preset)"
      >
        <span class="preset-name">{{ preset.name }}</span>
        <small v-if="preset.value != null">PC #{{ preset.value }}</small>
        <small v-else-if="preset.range">{{ preset.range[0] }}–{{ preset.range[1] }}</small>
      </button>
    </div>

    <div class="pc-row">
      <label class="label" for="pc-program">{{ t('pcSender.label') }}</label>
      <input
        id="pc-program"
        class="pc-input"
        type="number"
        :min="manualRange[0]"
        :max="manualRange[1]"
        step="1"
        v-model.number="program"
        aria-describedby="pc-help"
      />
      <button class="btn" type="button" :disabled="disabled" @click="sendManual">{{ t('pcSender.select') }}</button>
    </div>
    <small id="pc-help" class="pc-help">{{ t('pcSender.range', { min: manualRange[0], max: manualRange[1] }) }}</small>

    <p v-if="activePreset" class="pc-active">
      <span v-if="activePreset.bank">{{ t('pcSender.bankLabel', { bank: activePreset.bank }) }} · </span>
      {{ t('pcSender.active', {
        preset: activePreset.name ?? activePreset.number,
        number: activePreset.number
      }) }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMidi } from '../../ui/composables/useMidiStore';
import { useMidiControls } from '../../application/use-midi-controls';
import type { PcConfig, PedalConfig } from '../../config/types';
import type { AnyControl, EnumControl, ZoneEnumControl } from '../../core/entities/controls';

type BankPreset = { id: string; name: string; value: number | null; range?: [number, number] };
type BankView = { name: string; presets: BankPreset[] };

const props = defineProps<{
  pedalName?: string;
  pcConfig?: PcConfig;
  config?: PedalConfig;
}>();

const { isOutputReady } = useMidi();
const { sendProgramChange, sendControlChange } = useMidiControls();
const program = ref<number>(0);
const disabled = computed(() => !isOutputReady.value);
const { t } = useI18n();
const activePreset = ref<{ number: number; bank?: string; name?: string } | null>(null);

const manualRange = computed<[number, number]>(() => props.pcConfig?.range ?? [0, 127]);

const banks = computed<BankView[]>(() => {
  const list = props.pcConfig?.banks ?? [];
  return list.map((bank) => ({
    name: bank.bank,
    presets: Object.entries(bank.presets ?? {}).map(([name, raw]) => ({
      id: `${bank.bank}-${name}`,
      name,
      value: Array.isArray(raw) ? null : Number(raw),
      range: Array.isArray(raw) ? [Number(raw[0]), Number(raw[1])] as [number, number] : undefined,
    })),
  }));
});

const selectedBank = ref<string>('');

watch(banks, (list) => {
  if (!list.length) {
    selectedBank.value = '';
  } else if (!list.some((b) => b.name === selectedBank.value)) {
    selectedBank.value = list[0]?.name ?? '';
  }
}, { immediate: true });

const displayPresets = computed(() => {
  return banks.value.find((bank) => bank.name === selectedBank.value)?.presets ?? [];
});

const bankControl = computed<AnyControl | undefined>(() => {
  return props.config?.controls.find((ctrl) => ctrl.id === 'bankSwitch');
});

function bankValueFor(name: string): number | null {
  const ctrl = bankControl.value;
  if (!ctrl) return null;
  if (ctrl.type === 'zoneEnum') {
    const zone = (ctrl as ZoneEnumControl).zones.find((z) => z.name === name);
    if (zone) return Math.round((zone.min + zone.max) / 2);
  }
  if (ctrl.type === 'enum') {
    const value = (ctrl as EnumControl).map[name];
    if (typeof value === 'number') return value;
  }
  return null;
}

function sendBankIfNeeded(name?: string) {
  if (!name) return;
  const ctrl = bankControl.value;
  if (!ctrl) return;
  const value = bankValueFor(name);
  if (value == null) return;
  sendControlChange(ctrl.cc, value);
}

function onBankChange(event: Event) {
  const name = (event.target as HTMLSelectElement).value;
  selectedBank.value = name;
  sendBankIfNeeded(name);
}

function recordActive(number: number, bank?: string, presetName?: string) {
  activePreset.value = { number, bank, name: presetName };
}

function applyPreset(preset: BankPreset) {
  if (preset.value != null) {
    sendBankIfNeeded(selectedBank.value);
    const err = sendProgramChange(preset.value);
    if (!err) recordActive(preset.value, selectedBank.value, preset.name);
  } else if (preset.range) {
    program.value = preset.range[0];
  }
}

function sendManual() {
  sendBankIfNeeded(selectedBank.value);
  const err = sendProgramChange(program.value);
  if (!err) recordActive(program.value, selectedBank.value);
}
</script>

<style scoped>
.pc { display: flex; flex-direction: column; gap: .75rem; }
.pc-header { display: flex; align-items: baseline; justify-content: space-between; }
.pc-title { margin: 0; }
.pc-hint { color: var(--muted); font-weight: 600; }
.pc-row { display: flex; gap: .5rem; align-items: center; }
.pc-input { flex: 1; min-width: 0; }
.pc-help { color: var(--muted); }
.bank-row .select { flex: 1; }
.preset-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.5rem;
}
.preset-btn {
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  padding: 0.35rem 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.1rem;
  background: var(--secondary-surface, var(--surface));
}
.preset-btn small {
  color: var(--muted);
}
.pc-active {
  margin: 0;
  font-size: 0.9rem;
  color: var(--muted);
}
</style>
