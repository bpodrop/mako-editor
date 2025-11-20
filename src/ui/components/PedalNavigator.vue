<template>
  <aside class="pedal-navigator card" aria-labelledby="board-nav-title">
    <div class="navigator-header">
      <h2 id="board-nav-title">{{ t('board.navigatorTitle') }}</h2>
      <p class="navigator-help" id="board-nav-help">
        {{ t('board.navigatorHelp') }}
      </p>
      <div class="selection-toggle" role="group" :aria-label="t('board.selectionModeLabel')">
        <label>
          <input
            type="radio"
            name="selection-mode"
            value="single"
            :checked="props.selectionMode === 'single'"
            @change="() => emit('update:selection-mode', 'single')"
          />
          {{ t('board.selectionSingle') }}
        </label>
        <label>
          <input
            type="radio"
            name="selection-mode"
            value="multi"
            :checked="props.selectionMode === 'multi'"
            @change="() => emit('update:selection-mode', 'multi')"
          />
          {{ t('board.selectionMulti') }}
        </label>
      </div>
    </div>

    <div
      ref="listRef"
      class="navigator-list"
      role="listbox"
      :aria-multiselectable="props.selectionMode === 'multi' ? 'true' : 'false'"
      aria-labelledby="board-nav-title"
      aria-describedby="board-nav-help"
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
  selectionMode: 'single' | 'multi';
  dirtyMap: Record<string, boolean>;
}>();

const emit = defineEmits<{
  (e: 'update:selected-ids', ids: string[]): void;
  (e: 'update:selection-mode', mode: 'single' | 'multi'): void;
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
  if (props.selectionMode === 'single') {
    emit('update:selected-ids', [id]);
    return;
  }
  const set = new Set(props.selectedIds);
  if (set.has(id)) {
    set.delete(id);
  } else {
    set.add(id);
  }
  emit('update:selected-ids', Array.from(set));
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
  flex-direction: column;
  gap: 0.35rem;
}
.navigator-help {
  margin: 0;
  font-size: 0.9rem;
  color: var(--muted);
}
.selection-toggle {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  font-size: 0.95rem;
}
.selection-toggle label {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}
.selection-toggle input[type='radio'] {
  margin: 0;
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
