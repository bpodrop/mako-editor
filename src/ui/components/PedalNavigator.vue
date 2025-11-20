<template>
  <aside class="pedal-navigator card" aria-labelledby="board-nav-title">
    <div class="navigator-header">
      <h2 id="board-nav-title">{{ t('board.navigatorTitle') }}</h2>
      <button class="btn small add-btn" type="button" @click="emit('add-pedal')">
        {{ t('board.addPedal') }}
      </button>
    </div>

    <div
      ref="listRef"
      class="navigator-list"
      role="listbox"
      aria-labelledby="board-nav-title"
      aria-multiselectable="false"
    >
      <div
        v-for="entry in entries"
        :key="entry.id"
        class="nav-item"
        role="option"
        tabindex="0"
        :aria-selected="isSelected(entry.id) ? 'true' : 'false'"
        :aria-controls="`pedal-card-${entry.id}`"
        :data-id="entry.id"
        @click="handleSelect(entry.id)"
        @keydown.enter.prevent="handleSelect(entry.id)"
        @keydown.space.prevent="handleSelect(entry.id)"
        @keydown.up.prevent="focusSibling(entry.id, 'previous')"
        @keydown.down.prevent="focusSibling(entry.id, 'next')"
        @keydown.home.prevent="focusEdge('start')"
        @keydown.end.prevent="focusEdge('end')"
      >
        <div class="nav-item-main">
          <span class="nav-item-name">{{ entry.label }}</span>
          <span class="nav-item-channel">{{ entry.channelLabel }}</span>
        </div>
        <div class="nav-item-actions">
          <span
            v-if="entry.dirty"
            class="nav-item-dirty"
            :aria-label="t('board.dirtyLabel')"
            role="status"
          >
            •
          </span>
          <button
            type="button"
            class="delete-btn"
            :aria-label="t('board.remove')"
            :title="t('board.remove')"
            @click.stop.prevent="handleRemove(entry.id)"
          >
            🗑
          </button>
        </div>
      </div>
    </div>

    <div class="navigator-fab">
      <button
        type="button"
        class="fab-btn"
        :title="t('board.addPedal')"
        :aria-label="t('board.addPedal')"
        @click="emit('add-pedal')"
      >
        <span aria-hidden="true">+</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { PedalInstance } from '../../composables/usePedalBoard';

const props = defineProps<{
  instances: PedalInstance[];
  selectedIds: string[];
  dirtyMap: Record<string, boolean>;
}>();

const emit = defineEmits<{
  (e: 'update:selected-ids', ids: string[]): void;
  (e: 'add-pedal'): void;
  (e: 'remove', id: string): void;
}>();

const { t } = useI18n();

const listRef = ref<HTMLDivElement | null>(null);

const entries = computed(() =>
  props.instances.map((inst) => ({
    id: inst.id,
    label: inst.device ?? t('board.cardTitle'),
    channelLabel: t('board.channelLabel', { channel: inst.channel }),
    dirty: Boolean(props.dirtyMap?.[inst.id]),
  })),
);

function isSelected(id: string): boolean {
  return props.selectedIds.includes(id);
}

function handleSelect(id: string) {
  emit('update:selected-ids', [id]);
}

function queryItems(): HTMLElement[] {
  const container = listRef.value;
  if (!container) return [];
  return Array.from(container.querySelectorAll<HTMLElement>('.nav-item'));
}

function focusSibling(id: string, direction: 'previous' | 'next') {
  const items = queryItems();
  if (!items.length) return;
  const currentIndex = items.findIndex((el) => el.dataset.id === id);
  if (currentIndex < 0) return;
  const targetIndex = direction === 'previous'
    ? Math.max(0, currentIndex - 1)
    : Math.min(items.length - 1, currentIndex + 1);
  items[targetIndex]?.focus();
}

function focusEdge(position: 'start' | 'end') {
  const items = queryItems();
  if (!items.length) return;
  const target = position === 'start' ? items[0] : items[items.length - 1];
  target?.focus();
}

function handleRemove(id: string) {
  const confirmed = window.confirm(t('board.removeConfirm'));
  if (!confirmed) return;
  emit('remove', id);
}
</script>

<style scoped>
.pedal-navigator {
  position: sticky;
  top: 1rem;
  align-self: flex-start;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding-bottom: 3.5rem;
}
.navigator-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}
.add-btn {
  flex-shrink: 0;
}
.navigator-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  max-height: min(70vh, 640px);
  overflow-y: auto;
  padding: 0.4rem;
  border-radius: var(--radius);
  background: rgba(var(--primary-rgb, 47, 111, 235), 0.05);
  box-shadow: inset 0 0 0 1px rgba(var(--primary-rgb, 47, 111, 235), 0.08);
}
.nav-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  border-radius: calc(var(--radius-sm) * 1.2);
  border: 1px solid rgba(var(--primary-rgb, 47, 111, 235), 0.1);
  padding: 0.6rem 0.75rem;
  background: rgba(var(--primary-rgb, 47, 111, 235), 0.06);
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08);
  color: inherit;
  cursor: pointer;
  text-align: left;
  transition: background-color 0.15s ease, border-color 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;
}
.nav-item[aria-selected='true'] {
  border-color: rgba(var(--primary-rgb, 47, 111, 235), 0.4);
  background: rgba(var(--primary-rgb, 47, 111, 235), 0.12);
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.15);
}
.nav-item:hover {
  background: rgba(var(--primary-rgb, 47, 111, 235), 0.1);
  transform: translateY(-1px);
}
@media (prefers-color-scheme: dark) {
  .nav-item:hover {
    background: rgba(var(--primary-rgb, 47, 111, 235), 0.18);
  }
}
.nav-item-main {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.nav-item-name {
  font-weight: 600;
}
.nav-item-channel {
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--primary);
  background: rgba(var(--primary-rgb, 47, 111, 235), 0.18);
  border-radius: 999px;
  padding: 0.15rem 0.6rem;
  display: inline-flex;
  align-items: center;
  margin-top: 0.2rem;
  font-weight: 600;
}
.nav-item-actions {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}
.nav-item-dirty {
  font-size: 1.2rem;
  color: var(--primary);
  line-height: 1;
  padding-left: 0.35rem;
}
.delete-btn {
  border: none;
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  padding: 0.1rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}
.delete-btn:hover {
  color: var(--danger, #c00);
}
.navigator-fab {
  position: sticky;
  bottom: 1rem;
  display: flex;
  justify-content: flex-end;
  padding-top: 0.5rem;
  pointer-events: none;
}
.fab-btn {
  pointer-events: auto;
  width: 3rem;
  height: 3rem;
  border-radius: 999px;
  border: none;
  background: var(--primary);
  color: var(--primary-contrast);
  font-size: 1.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 20px 40px rgba(47, 111, 235, 0.4);
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.fab-btn:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 25px 50px rgba(47, 111, 235, 0.45);
}
.fab-btn:focus-visible {
  outline: 2px solid var(--primary-contrast);
  outline-offset: 2px;
  box-shadow: var(--focus-ring);
}
.delete-btn:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
  box-shadow: var(--focus-ring);
}
@media (max-width: 720px) {
  .pedal-navigator {
    position: static;
    top: auto;
  }
  .navigator-list {
    max-height: none;
  }
}
</style>
