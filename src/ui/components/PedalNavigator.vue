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
      <button
        v-for="entry in entries"
        :key="entry.id"
        type="button"
        class="nav-item"
        role="option"
        :aria-selected="isSelected(entry.id) ? 'true' : 'false'"
        :aria-controls="`pedal-card-${entry.id}`"
        :data-id="entry.id"
        @click="handleSelect(entry.id)"
        @keydown.up.prevent="focusSibling(entry.id, 'previous')"
        @keydown.down.prevent="focusSibling(entry.id, 'next')"
        @keydown.home.prevent="focusEdge('start')"
        @keydown.end.prevent="focusEdge('end')"
      >
        <div class="nav-item-main">
          <span class="nav-item-name">{{ entry.label }}</span>
          <span class="nav-item-channel">{{ entry.channelLabel }}</span>
        </div>
        <span
          v-if="entry.dirty"
          class="nav-item-dirty"
          :aria-label="t('board.dirtyLabel')"
          role="status"
        >
          •
        </span>
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

function queryItems(): HTMLButtonElement[] {
  const container = listRef.value;
  if (!container) return [];
  return Array.from(container.querySelectorAll<HTMLButtonElement>('button.nav-item'));
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
</script>

<style scoped>
.pedal-navigator {
  position: sticky;
  top: 1rem;
  align-self: flex-start;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
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
  padding-right: 0.25rem;
}
.nav-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
  padding: 0.5rem 0.6rem;
  background: transparent;
  color: inherit;
  cursor: pointer;
  text-align: left;
  transition: background-color 0.15s ease, border-color 0.15s ease;
}
.nav-item[aria-selected='true'] {
  border-color: var(--primary);
  background: rgba(47, 111, 235, 0.08);
}
.nav-item:hover {
  background: rgba(0, 0, 0, 0.04);
}
@media (prefers-color-scheme: dark) {
  .nav-item:hover {
    background: rgba(255, 255, 255, 0.04);
  }
}
.nav-item-main {
  display: flex;
  flex-direction: column;
}
.nav-item-name {
  font-weight: 600;
}
.nav-item-channel {
  font-size: 0.85rem;
  color: var(--muted);
}
.nav-item-dirty {
  font-size: 1.2rem;
  color: var(--primary);
  line-height: 1;
  padding-left: 0.35rem;
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
