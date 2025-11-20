<template>
  <div class="legal-page container">
    <header class="legal-header">
      <button class="link-btn back-link" type="button" @click="navigateHome">
        {{ t('legal.back') }}
      </button>
      <h1>{{ t('legal.title') }}</h1>
      <p class="legal-note">{{ t('legal.lead') }}</p>
    </header>

    <section class="card legal-section">
      <h2>{{ t('legal.disclaimerTitle') }}</h2>
      <p>{{ t('legal.disclaimer1') }}</p>
      <p>{{ t('legal.disclaimer2') }}</p>
      <p>{{ t('legal.disclaimer3') }}</p>
    </section>

    <section class="card legal-section">
      <h2>{{ t('legal.liabilityTitle') }}</h2>
      <p>{{ t('legal.liability1') }}</p>
      <p>{{ t('legal.liability2') }}</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

const router = useRouter();
const { t } = useI18n();
function navigateHome() {
  void router.push({ name: 'home' });
}
</script>

<style scoped>
.legal-page {
  min-height: 100vh;
  padding-top: 2rem;
}
.legal-header {
  margin-bottom: 1.5rem;
}
.legal-note {
  color: var(--muted);
  margin: 0.25rem 0 0;
}
.back-link {
  margin-bottom: 0.5rem;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}
.legal-section + .legal-section {
  margin-top: 1rem;
}
.legal-section p {
  margin: 0 0 0.75rem;
}
.legal-section p:last-child {
  margin-bottom: 0;
}
</style>
