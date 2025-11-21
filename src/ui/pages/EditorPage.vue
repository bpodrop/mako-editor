<template>
  <div class="container">
    <header class="header" role="banner">
      <div class="hero">
        <div class="hero-meta">
          <span class="hero-badge">{{ appVersion }}</span>
        </div>
        <div class="hero-content">
          <div class="hero-text">
            <h1>{{ t('app.title') }}</h1>
            <p class="hero-lede">{{ t('app.subtitle') }}</p>
          </div>
          <div class="hero-actions">
            <BurgerMenu @open-legal="navigateLegal" />
          </div>
        </div>
      </div>
    </header>

    <main id="main" role="main">
      <div class="board-layout" :class="{ 'is-compact': isCompactLayout }">
        <div
          id="pedal-navigator-panel"
          class="navigator-panel"
          :data-open="isNavigatorVisible ? 'true' : 'false'"
          :aria-hidden="isCompactLayout && !isNavigatorOpen ? 'true' : 'false'"
        >
          <PedalNavigator
            :instances="instances"
            :selected-ids="selectedIds"
            :dirty-map="dirtyMap"
            @update:selected-ids="onNavigatorSelection"
            @add-pedal="openAddPedalDialog"
            @remove="removeInstance"
          />
        </div>

        <section class="board-content" aria-live="polite">
          <section class="board-toolbar" aria-labelledby="controls-heading">
            <div class="controls-heading">
              <h2 id="controls-heading">{{ t('controls.heading') }}</h2>
              <ModeToggle v-model="interactionMode" />
            </div>
            <div class="board-actions">
              <button
                v-if="isCompactLayout"
                class="btn btn--ghost navigator-toggle"
                type="button"
                @click="toggleNavigator"
                :aria-expanded="isNavigatorVisible ? 'true' : 'false'"
                aria-controls="pedal-navigator-panel"
              >
                {{ isNavigatorVisible ? t('board.hideNavigator') : t('board.showNavigator') }}
              </button>
            </div>
          </section>

          <p class="sr-only" aria-live="polite">{{ selectionStatusMessage }}</p>

          <div
            v-if="isBoardEmpty"
            class="empty-selection empty-state"
            role="status"
            aria-live="polite"
          >
            <h3>{{ t('board.emptyStateTitle') }}</h3>
            <p>{{ t('board.emptyStateAction') }}</p>
            <div class="empty-actions">
              <button class="btn" type="button" @click="openAddPedalDialog">
                {{ t('board.addPedal') }}
              </button>
            </div>
          </div>

          <div v-else class="board-grid">
            <PedalBoardCard
              v-for="instance in instances"
              :key="instance.id"
              v-show="isInstanceVisible(instance.id)"
              :instance="instance"
              :interaction-mode="interactionMode"
              
              :is-output-ready="isOutputReady"
              @update-device="onUpdateDevice"
              @update-channel="onUpdateChannel"
              @dirty-state="onDirtyState"
              @edit="openEditPedalDialog"
            />
          </div>

          <p v-if="!isBoardEmpty && !visibleInstances.length" class="empty-selection">
            {{ emptySelectionMessage }}
          </p>

          <p v-if="errorMessage" class="error" role="alert" aria-live="assertive">{{ errorMessage }}</p>
        </section>
      </div>
    </main>

    <AddPedalDialog
      :open="isAddPedalDialogOpen"
      :options="pedalOptions"
      :initial-device="pendingAddDevice"
      :initial-channel="pendingAddChannel"
      :mode="pedalDialogMode"
      @confirm="onAddPedalConfirm"
      @cancel="closeAddPedalDialog"
    />

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
import { onMounted, onBeforeUnmount, computed, ref, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import BurgerMenu from '../components/BurgerMenu.vue';
import ModeToggle from '../components/ModeToggle.vue';
import AddPedalDialog from '../components/AddPedalDialog.vue';
import PedalBoardCard from '../components/PedalBoardCard.vue';
import PedalNavigator from '../components/PedalNavigator.vue';
import { listPedals } from '../../config/pedalConfig';
import { useMidi } from '../composables/useMidiStore';
import { usePedalBoard } from '../../composables/usePedalBoard';
import pkg from '../../../package.json';

const router = useRouter();
const { t } = useI18n();
const { init, errorMessage, isOutputReady } = useMidi();
const { instances, addInstance, removeInstance, updateInstance } = usePedalBoard();

const pedalOptions = listPedals();

const currentYear = new Date().getFullYear();
const appVersion = computed(() => t('app.version', { version: pkg?.version ?? '0.0.0' }));

const initialMode = typeof window !== 'undefined' ? localStorage.getItem('midi-mode') : null;
const interactionMode = ref<'live' | 'preset'>(initialMode === 'preset' ? 'preset' : 'live');
const selectedIds = ref<string[]>([]);
const dirtyMap = ref<Record<string, boolean>>({});
const isCompactLayout = ref(false);
const isNavigatorOpen = ref(true);
const MOBILE_QUERY = '(max-width: 720px)';
const isAddPedalDialogOpen = ref(false);
const pendingAddDevice = ref('');
const pendingAddChannel = ref(1);
const pedalDialogMode = ref<'add' | 'edit'>('add');
const editingInstanceId = ref<string | null>(null);
let mediaQuery: MediaQueryList | null = null;

watch(interactionMode, (mode) => {
  try { localStorage.setItem('midi-mode', mode); } catch {}
});

const visibleInstances = computed(() => {
  if (!instances.value.length) return [];
  const id = selectedIds.value[0];
  if (!id) return [];
  const match = instances.value.find((inst) => inst.id === id);
  return match ? [match] : [];
});

const isBoardEmpty = computed(() => instances.value.length === 0);
const visibleIdSet = computed(() => new Set(visibleInstances.value.map((inst) => inst.id)));
const emptySelectionMessage = computed(() => (isBoardEmpty.value
  ? t('board.emptyStateAction')
  : t('board.noSelectionSingle')));
const selectionStatusMessage = computed(() => {
  const count = visibleInstances.value.length;
  if (!count) return emptySelectionMessage.value;
  return t('board.visibleCount', { count });
});

function isInstanceVisible(id: string): boolean {
  return visibleIdSet.value.has(id);
}
const isNavigatorVisible = computed(() => !isCompactLayout.value || isNavigatorOpen.value);

function suggestChannel(): number {
  const used = new Set(instances.value.map((inst) => inst.channel));
  for (let c = 1; c <= 16; c += 1) {
    if (!used.has(c)) return c;
  }
  return instances.value[instances.value.length - 1]?.channel ?? 1;
}

function addPedal(device?: string | null, channel?: number | null) {
  const instance = addInstance(device ?? null, channel ?? null);
  syncSelectedIds([instance.id]);
}

function openAddPedalDialog() {
  if (!pedalOptions.length) return;
  pendingAddDevice.value = pedalOptions[0]?.value ?? '';
  pendingAddChannel.value = suggestChannel();
  pedalDialogMode.value = 'add';
  editingInstanceId.value = null;
  isAddPedalDialogOpen.value = true;
}

function openEditPedalDialog(id: string) {
  const instance = instances.value.find((inst) => inst.id === id);
  if (!instance) return;
  pendingAddDevice.value = instance.device ?? pedalOptions[0]?.value ?? '';
  pendingAddChannel.value = instance.channel ?? 1;
  pedalDialogMode.value = 'edit';
  editingInstanceId.value = id;
  isAddPedalDialogOpen.value = true;
}

function closeAddPedalDialog() {
  isAddPedalDialogOpen.value = false;
  editingInstanceId.value = null;
  pedalDialogMode.value = 'add';
}

function onAddPedalConfirm(payload: { device: string; channel: number }) {
  const editingId = editingInstanceId.value;
  if (editingId) {
    updateInstance(editingId, { device: payload.device, channel: payload.channel });
  } else {
    addPedal(payload.device, payload.channel);
  }
  closeAddPedalDialog();
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

function applyLayoutMode(matches: boolean, { preserveState = false }: { preserveState?: boolean } = {}) {
  isCompactLayout.value = matches;
  if (!matches) {
    isNavigatorOpen.value = true;
    return;
  }
  if (!preserveState) {
    isNavigatorOpen.value = false;
  }
}

function handleMediaChange(event: MediaQueryListEvent | MediaQueryList) {
  applyLayoutMode(event.matches, { preserveState: true });
}

onMounted(() => {
  void init();
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
  mediaQuery = window.matchMedia(MOBILE_QUERY);
  applyLayoutMode(mediaQuery.matches);
  if (typeof mediaQuery.addEventListener === 'function') {
    mediaQuery.addEventListener('change', handleMediaChange);
  } else {
    mediaQuery.addListener(handleMediaChange);
  }
});

onBeforeUnmount(() => {
  if (!mediaQuery) return;
  if (typeof mediaQuery.removeEventListener === 'function') {
    mediaQuery.removeEventListener('change', handleMediaChange);
  } else {
    mediaQuery.removeListener(handleMediaChange);
  }
});

watch(instances, (next) => {
  pruneDirtyState(next);
  syncSelectedIds(selectedIds.value);
}, { immediate: true });

watch(selectedIds, (current, previous) => {
  const currentId = current[0];
  const previousId = previous?.[0];
  if (!currentId || currentId === previousId) return;
  if (typeof window === 'undefined') return;
  void nextTick(() => {
    const target = document.getElementById(`pedal-card-${currentId}`);
    target?.focus({ preventScroll: true });
  });
});

function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((value, idx) => value === b[idx]);
}

function sanitizeIds(source: string[]): string[] {
  const allowed = new Set(instances.value.map((inst) => inst.id));
  for (const id of source) {
    if (allowed.has(id)) return [id];
  }
  const fallback = instances.value[0]?.id;
  return fallback ? [fallback] : [];
}

function syncSelectedIds(next: string[]) {
  const sanitized = sanitizeIds(next);
  if (!arraysEqual(sanitized, selectedIds.value)) {
    selectedIds.value = sanitized;
  }
}

function onNavigatorSelection(ids: string[]) {
  syncSelectedIds(ids);
}

function onDirtyState(payload: { id: string; dirty: boolean }) {
  if (!dirtyMap.value[payload.id] && !payload.dirty) return;
  dirtyMap.value = {
    ...dirtyMap.value,
    [payload.id]: payload.dirty,
  };
}

function pruneDirtyState(nextInstances: typeof instances.value) {
  const allowed = new Set(nextInstances.map((inst) => inst.id));
  const nextEntries = Object.entries(dirtyMap.value).filter(([id]) => allowed.has(id));
  const nextMap: Record<string, boolean> = {};
  for (const [id, value] of nextEntries) {
    nextMap[id] = value;
  }
  dirtyMap.value = nextMap;
}

function toggleNavigator() {
  isNavigatorOpen.value = !isNavigatorOpen.value;
}
</script>

<style scoped>
.header {
  margin-bottom: var(--space-6);
}
.hero {
  background: linear-gradient(120deg,
    color-mix(in srgb, var(--primary) 65%, transparent) 0%,
    color-mix(in srgb, var(--primary) 25%, var(--surface)) 60%);
  border-radius: calc(var(--radius) * 1.5);
  padding: 2.25rem clamp(1rem, 4vw, 2.75rem);
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.12);
  color: var(--primary-contrast);
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}
.hero-meta {
  display: flex;
  justify-content: flex-end;
}
.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--font-xs);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: var(--space-1) var(--space-3);
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.45);
  background: rgba(255, 255, 255, 0.12);
}
.hero-content {
  display: flex;
  justify-content: space-between;
  gap: var(--space-6);
  flex-wrap: wrap;
  align-items: center;
}
.hero-text {
  flex: 1;
  min-width: 220px;
}
.hero-text h1 {
  margin: 0;
  font-size: var(--font-hero);
  line-height: 1.1;
}
.hero-lede {
  margin: var(--space-2) 0 0;
  font-size: var(--font-lg);
  color: rgba(255, 255, 255, 0.85);
}
.hero-actions {
  display: flex;
  gap: var(--space-3);
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-end;
}
.hero-actions :deep(.burger-btn) {
  border-color: rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.08);
  color: var(--primary-contrast);
}
.hero-actions :deep(.burger-btn.open) {
  background: var(--primary-contrast);
  color: var(--primary);
  border-color: transparent;
}
.controls-heading {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}
.board-layout {
  display: grid;
  grid-template-columns: minmax(240px, 280px) minmax(0, 1fr);
  gap: var(--space-4);
  align-items: flex-start;
}
.board-layout.is-compact {
  grid-template-columns: 1fr;
}
.navigator-panel {
  min-width: 0;
  transition: opacity 0.25s ease, transform 0.25s ease, max-height 0.3s ease;
  will-change: opacity, transform;
}
.board-layout.is-compact .navigator-panel {
  position: relative;
  width: 100%;
  max-height: 999px;
  overflow: hidden;
  opacity: 1;
  transform: translateY(0);
  visibility: visible;
}
.board-layout.is-compact .navigator-panel[data-open='false'],
.board-layout.is-compact .navigator-panel[aria-hidden='true'] {
  max-height: 0;
  opacity: 0;
  transform: translateY(-0.5rem);
  pointer-events: none;
  visibility: hidden;
}
.board-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
.navigator-toggle {
  border-color: var(--border);
  color: inherit;
}
.board-toolbar {
  display: flex;
  justify-content: space-between;
  gap: var(--space-4);
  flex-wrap: wrap;
  align-items: flex-start;
}
.board-actions {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
  justify-content: flex-end;
}
.board-actions .btn,
.controls-actions .btn,
.navigator-toggle {
  transition: transform 0.18s ease, box-shadow 0.18s ease;
  will-change: transform;
}
.board-actions .btn:hover:not(:disabled),
.board-actions .btn:focus-visible,
.controls-actions .btn:hover:not(:disabled),
.controls-actions .btn:focus-visible,
.navigator-toggle:hover:not(:disabled),
.navigator-toggle:focus-visible {
  transform: translateY(-1px);
  box-shadow: var(--focus-ring);
}
.board-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: var(--space-5);
}
.empty-selection {
  margin: 0;
  padding: var(--space-4);
  border-radius: var(--radius);
  border: 1px dashed var(--border);
  background: var(--surface);
}
.empty-state {
  text-align: center;
  display: grid;
  gap: var(--space-1);
  justify-items: center;
}
.empty-state h3 {
  margin: 0;
  font-size: var(--font-lg);
}
.empty-state p {
  margin: 0;
  color: var(--muted);
}
.empty-actions {
  margin-top: var(--space-1);
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}
@media (max-width: 900px) {
  .board-layout {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 720px) {
  .board-actions {
    justify-content: flex-start;
  }
  .navigator-toggle {
    flex: 1 1 auto;
    text-align: left;
  }
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
