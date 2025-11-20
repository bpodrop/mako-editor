<template>
  <div>
    <label class="label" for="locale-select">{{ t('locale.label') }}</label>
    <select
      id="locale-select"
      class="select"
      :value="locale"
      @change="onChange"
    >
      <option v-for="opt in options" :key="opt.value" :value="opt.value">
        {{ opt.label }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { SUPPORTED_LOCALES, setLocale } from '../../app/i18n';

const { locale, t } = useI18n();

const options = computed(() =>
  SUPPORTED_LOCALES.map((loc) => ({
    value: loc.value,
    label: loc.value === 'en' ? t('locale.english') : t('locale.french'),
  }))
);

function onChange(e: Event) {
  const next = (e.target as HTMLSelectElement).value;
  setLocale(next);
}
</script>

<style scoped>
.label { display: block; margin-bottom: 0.25rem; }
.select { width: 100%; }
</style>
