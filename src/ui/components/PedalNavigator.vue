<template>
  <aside class="pedal-navigator card" aria-labelledby="board-nav-title">
    <div class="navigator-header">
      <h2 id="board-nav-title">{{ t('board.navigatorTitle') }}</h2>
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
          <span class="nav-item-channel badge badge--primary">{{ entry.channelLabel }}</span>
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
  top: var(--space-4);
  align-self: flex-start;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding-bottom: var(--space-9);
}
.navigator-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
}
.add-btn {
  flex-shrink: 0;
}
.navigator-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  max-height: min(70vh, 640px);
  overflow-y: auto;
  padding: var(--space-2);
  border-radius: var(--radius);
  background: var(--surface-inset);
  box-shadow: inset 0 0 0 1px var(--border-subtle);
}
.nav-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  border-radius: calc(var(--radius-sm) * 1.2);
  border: 1px solid var(--border-subtle);
  padding: var(--space-2) var(--space-3);
  background: var(--surface-strong);
  box-shadow: var(--shadow-lifted);
  color: inherit;
  cursor: pointer;
  text-align: left;
  transition: background-color 0.15s ease, border-color 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;
}
.nav-item[aria-selected='true'] {
  border-color: var(--border-strong);
  background: var(--surface-strong-alt);
  box-shadow: var(--shadow-lifted);
}
.nav-item:hover {
  background: var(--surface-strong-alt);
  transform: translateY(-1px);
}
.nav-item-main {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.nav-item-name {
  font-weight: var(--weight-semibold);
}
.nav-item-channel {
  margin-top: var(--space-1);
}
.nav-item-actions {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
}
.nav-item-dirty {
  font-size: var(--font-lg);
  color: var(--primary);
  line-height: 1;
  padding-left: var(--space-1);
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
  font-size: var(--font-base);
}
.delete-btn:hover {
  color: var(--danger);
}
.navigator-fab {
  position: sticky;
  bottom: var(--space-4);
  display: flex;
  justify-content: flex-end;
  padding-top: var(--space-2);
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
