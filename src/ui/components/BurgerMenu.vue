<template>
  <div class="burger-container">
    <button
      class="burger-btn"
      :class="{ open }"
      type="button"
      :aria-expanded="open ? 'true' : 'false'"
      aria-controls="app-drawer"
      :aria-label="open ? t('menu.close') : t('menu.open')"
      :title="open ? t('menu.close') : t('menu.open')"
      @click="toggle"
    >
      <span class="icon-stack" aria-hidden="true">
        <!-- Menu icon -->
        <svg class="icon icon-menu" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 6h18"/>
          <path d="M3 12h18"/>
          <path d="M3 18h18"/>
        </svg>
        <!-- Close icon -->
        <svg class="icon icon-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 6l12 12"/>
          <path d="M18 6l-12 12"/>
        </svg>
      </span>
    </button>

    <transition name="fade">
      <div v-if="open" class="overlay" @click="close" aria-hidden="true"></div>
    </transition>

    <aside
      id="app-drawer"
      class="drawer"
      :class="{ open }"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
    >
      <header class="drawer-header">
        <h2 id="drawer-title" class="drawer-title">{{ t('menu.title') }}</h2>
      </header>

      <div class="drawer-content">
        <section class="drawer-section">
          <LocaleSwitcher />
        </section>

        <section class="drawer-section">
          <DeviceSelect />
        </section>

        <section class="drawer-section">
          <ChannelPicker />
        </section>

        <section class="drawer-section">
          <MidiTestButton />
        </section>

        <section class="drawer-section drawer-meta" role="note" :aria-label="t('menu.infoTitle')">
          <div class="info-box">
            <strong class="info-title">{{ t('menu.infoTitle') }}</strong>
            <ul class="info-list">
              <li>{{ t('menu.tipMidi') }}</li>
              <li>{{ t('menu.tipPwa') }}</li>
            </ul>
          </div>
        </section>

        <section class="drawer-section">
          <button class="link-btn" type="button" @click="openLegal">
            {{ t('menu.legal') }}
          </button>
        </section>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';
import DeviceSelect from './DeviceSelect.vue';
import ChannelPicker from './ChannelPicker.vue';
import LocaleSwitcher from './LocaleSwitcher.vue';
import MidiTestButton from './MidiTestButton.vue';

const emit = defineEmits<{
  (e: 'open-legal'): void;
}>();

const open = ref(false);
const { t } = useI18n();

function toggle() { open.value = !open.value; }
function close() { open.value = false; }

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && open.value) {
    e.preventDefault();
    close();
  }
}

function openLegal() {
  emit('open-legal');
  close();
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown);
});
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown);
});
</script>

<style scoped>
.burger-container { position: relative; }
.burger-btn {
  width: 40px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: inherit;
  cursor: pointer;
  transition: background-color .2s ease, border-color .2s ease, color .2s ease, transform .2s ease;
}
.burger-btn:hover { transform: translateY(-1px); }
.burger-btn:active { transform: translateY(0); }
.burger-btn.open { background: var(--primary); color: var(--primary-contrast); border-color: var(--primary); }

.icon-stack { position: relative; width: 22px; height: 22px; display: inline-block; }
.icon { position: absolute; inset: 0; width: 22px; height: 22px; transition: opacity .2s ease, transform .2s ease; }
.icon-menu { opacity: 1; }
.icon-close { opacity: 0; transform: rotate(-90deg) scale(.9); }
.burger-btn.open .icon-menu { opacity: 0; transform: rotate(90deg) scale(.9); }
.burger-btn.open .icon-close { opacity: 1; transform: rotate(0deg) scale(1); }

.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.35);
  z-index: 1000;
}
.fade-enter-active, .fade-leave-active { transition: opacity .2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.drawer {
  position: fixed;
  top: 0; right: 0; bottom: 0;
  width: min(90vw, 360px);
  background: var(--surface);
  border-left: 1px solid var(--border);
  box-shadow: var(--shadow-1);
  transform: translateX(100%);
  transition: transform .2s ease;
  z-index: 1001;
  display: flex;
  flex-direction: column;
}
.drawer.open { transform: translateX(0); }
.drawer-header {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: .75rem 1rem;
  border-bottom: 1px solid var(--border);
}
.drawer-title { margin: 0; font-size: 1.1rem; }
.drawer-content { padding: 1rem; overflow: auto; }
.drawer-section { margin-bottom: 1rem; }
.drawer-meta .info-box {
  border: 1px solid var(--border);
  background: var(--bg);
  border-radius: var(--radius-sm);
  padding: .75rem .9rem;
}
.drawer-meta .info-title { display: block; font-size: .95rem; margin-bottom: .4rem; }
.drawer-meta .info-list { margin: 0; padding-left: 1rem; font-size: .9rem; color: var(--muted); }
.drawer-meta .info-list li { margin: .2rem 0; }
.row { display: flex; gap: .5rem; align-items: center; }
.label { display: block; margin-bottom: .25rem; }
select { width: 100%; }
</style>
