<template>
  <div class="guide-page container">
    <header class="guide-header">
      <button class="link-btn back-link" type="button" @click="navigateHome">
        {{ t('manual.back') }}
      </button>
      <h1>{{ t('manual.title') }}</h1>
      <p class="guide-lead">{{ t('manual.lead') }}</p>
    </header>

    <section
      v-for="section in sections"
      :key="section.title"
      class="card guide-section"
    >
      <h2>{{ section.title }}</h2>
      <ul>
        <li v-for="item in section.items" :key="item">{{ item }}</li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

const router = useRouter();
const { t } = useI18n();

const sections = computed(() => [
  {
    title: t('manual.start.title'),
    items: [
      t('manual.start.items.prereq'),
      t('manual.start.items.install'),
      t('manual.start.items.dev'),
      t('manual.start.items.build'),
    ],
  },
  {
    title: t('manual.ui.title'),
    items: [
      t('manual.ui.items.menu'),
      t('manual.ui.items.board'),
      t('manual.ui.items.modes'),
      t('manual.ui.items.importExport'),
    ],
  },
  {
    title: t('manual.add.title'),
    items: [
      t('manual.add.items.open'),
      t('manual.add.items.pick'),
      t('manual.add.items.channel'),
      t('manual.add.items.edit'),
    ],
  },
  {
    title: t('manual.mode.title'),
    items: [
      t('manual.mode.items.live'),
      t('manual.mode.items.preset'),
      t('manual.mode.items.apply'),
      t('manual.mode.items.cancel'),
    ],
  },
  {
    title: t('manual.pc.title'),
    items: [
      t('manual.pc.items.manual'),
      t('manual.pc.items.banks'),
      t('manual.pc.items.bankSwitch'),
    ],
  },
  {
    title: t('manual.io.title'),
    items: [
      t('manual.io.items.export'),
      t('manual.io.items.import'),
    ],
  },
  {
    title: t('manual.persist.title'),
    items: [
      t('manual.persist.items.storage'),
      t('manual.persist.items.pwa'),
      t('manual.persist.items.troubleshootMidi'),
    ],
  },
]);

function navigateHome() {
  void router.push({ name: 'home' });
}
</script>

<style scoped>
.guide-page {
  min-height: 100vh;
  padding-top: 2rem;
  display: grid;
  gap: 1.25rem;
}
.guide-header {
  margin-bottom: 0.5rem;
  display: grid;
  gap: 0.35rem;
}
.guide-lead {
  margin: 0;
  color: var(--muted);
}
.back-link {
  margin-bottom: 0.5rem;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}
.guide-section h2 {
  margin: 0 0 0.5rem;
}
.guide-section ul {
  margin: 0;
  padding-left: 1.1rem;
  display: grid;
  gap: 0.35rem;
}
</style>
