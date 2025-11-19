<template>
  <div class="container">
    <header class="header" role="banner">
      <div>
        <h1>{{ t('app.title') }}</h1>
        <p class="subtitle">{{ t('app.subtitle') }}</p>
      </div>
      <BurgerMenu @open-legal="navigateLegal" />
    </header>

    <main id="main" role="main">
      <section class="board-toolbar" aria-labelledby="controls-heading">
        <div class="controls-heading">
          <h2 id="controls-heading">{{ t('controls.heading') }}</h2>
          <ModeToggle v-model="interactionMode" />
          <p class="mode-info">{{ modeDescription }}</p>
        </div>
        <div class="board-actions">
          <button class="btn" type="button" @click="addPedal">
            {{ t('board.addPedal') }}
          </button>
        </div>
      </section>

      <div class="board-grid">
        <PedalBoardCard
          v-for="instance in instances"
          :key="instance.id"
          :instance="instance"
          :pedal-options="pedalOptions"
          :interaction-mode="interactionMode"
          :mode-description="modeDescription"
          :is-output-ready="isOutputReady"
          @update-device="onUpdateDevice"
          @update-channel="onUpdateChannel"
          @duplicate="duplicateInstance"
          @remove="removeInstance"
          @move-up="(id: string) => moveInstance(id, 'up')"
          @move-down="(id: string) => moveInstance(id, 'down')"
        />
      </div>

      <p v-if="errorMessage" class="error" role="alert" aria-live="assertive">{{ errorMessage }}</p>
    </main>

    <footer class="footer">
      <small class="copyright">
        © {{ currentYear }} - {{ appVersion }} - <a href="https://fr.audiofanzine.com/membres/207406/" target="_blank" rel="noopener noreferrer">benbao</a>
      </small>
      <div class="footer-actions">
        <button class="link-btn legal-link" type="button" @click="navigateLegal">
          {{ t('footer.legal') }}
        </button>
        <a
          class="github-link"
          href="https://github.com/bpodrop/mako-editor"
          target="_blank"
          rel="noopener noreferrer"
          :aria-label="t('footer.github')"
        >
          <svg class="github-icon" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false">
            <path
              d="M12 .296a12 12 0 00-3.797 23.39c.6.113.82-.26.82-.58l-.016-2.052c-3.338.73-4.043-1.61-4.043-1.61-.546-1.386-1.334-1.756-1.334-1.756-1.09-.745.083-.73.083-.73 1.21.085 1.846 1.242 1.846 1.242 1.068 1.832 2.804 1.303 3.486.996.107-.774.418-1.304.762-1.604-2.665-.305-5.467-1.332-5.467-5.932 0-1.309.467-2.381 1.235-3.22-.124-.303-.536-1.523.117-3.176 0 0 1.008-.322 3.302 1.23a11.42 11.42 0 016 0c2.294-1.552 3.3-1.23 3.3-1.23.655 1.653.243 2.873.12 3.176.77.839 1.233 1.911 1.233 3.22 0 4.61-2.807 5.624-5.48 5.92.43.37.814 1.103.814 2.226l-.012 3.298c0 .322.217.7.825.58A12 12 0 0012 .296z"
            />
          </svg>
        </a>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import BurgerMenu from '../components/BurgerMenu.vue';
import ModeToggle from '../components/ModeToggle.vue';
import PedalBoardCard from '../components/PedalBoardCard.vue';
import { listPedals } from '../../config/pedalConfig';
import { useMidi } from '../composables/useMidiStore';
import { usePedalBoard } from '../../composables/usePedalBoard';
import pkg from '../../../package.json';

const router = useRouter();
const { t } = useI18n();
const { init, errorMessage, isOutputReady } = useMidi();
const { instances, addInstance, removeInstance, duplicateInstance, moveInstance, updateInstance } = usePedalBoard();

const pedalOptions = listPedals();

const currentYear = new Date().getFullYear();
const appVersion = computed(() => t('app.version', { version: pkg?.version ?? '0.0.0' }));

const initialMode = typeof window !== 'undefined' ? localStorage.getItem('midi-mode') : null;
const interactionMode = ref<'live' | 'preset'>(initialMode === 'preset' ? 'preset' : 'live');

watch(interactionMode, (mode) => {
  try { localStorage.setItem('midi-mode', mode); } catch {}
});

const modeDescription = computed(() =>
  interactionMode.value === 'live' ? t('modes.descriptionLive') : t('modes.descriptionPreset')
);

function addPedal() {
  addInstance();
}

function onUpdateDevice(payload: { id: string; device: string | null }) {
  updateInstance(payload.id, { device: payload.device });
}

function onUpdateChannel(payload: { id: string; channel: number }) {
  updateInstance(payload.id, { channel: payload.channel });
}

function navigateLegal() {
  void router.push({ name: 'legal' });
}

onMounted(async () => { void init(); });
</script>

<style scoped>
.header {
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.subtitle {
  margin: 0.25rem 0 0;
}
.controls-heading {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.board-toolbar {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: flex-start;
  margin-bottom: 1rem;
}
.board-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}
.board-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1rem;
}
.mode-info {
  margin: 0;
  color: var(--muted);
}
.footer {
  margin-top: 2rem;
  text-align: center;
}
.footer small { display: block; }
.footer .disclaimer { color: var(--muted); margin-top: .25rem; }
.footer-actions {
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}
.github-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 999px;
  color: inherit;
  border: 1px solid transparent;
  transition: color .15s ease, border-color .15s ease, background-color .15s ease;
}
.github-link:hover {
  color: var(--primary);
  border-color: var(--border);
  background: rgba(0, 0, 0, 0.02);
}
.github-link:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
.github-icon {
  width: 1.5rem;
  height: 1.5rem;
  fill: currentColor;
}
.legal-link { margin: 0; }
</style>
