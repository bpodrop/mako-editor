<template>
  <div class="snapshot-manager">
    <h3 class="heading">{{ t('snapshots.title') }}</h3>
    <div class="row">
      <input
        ref="nameInput"
        class="input"
        type="text"
        :placeholder="t('snapshots.placeholder')"
        v-model="snapshotName"
        @keyup.enter="save"
      />
      <button class="btn" type="button" :disabled="!snapshotName.trim()" @click="save">
        {{ t('snapshots.save') }}
      </button>
    </div>
    <p v-if="snapshots.length === 0" class="empty">{{ t('snapshots.empty') }}</p>
    <ul v-else class="snapshot-list">
      <li v-for="snap in snapshots" :key="snap.id" class="snapshot-item">
        <div class="info">
          <strong>{{ snap.name }}</strong>
          <small>{{ formatDate(snap.createdAt) }}</small>
        </div>
        <div class="actions">
          <button type="button" class="link-btn" @click="$emit('apply', snap.id)">{{ t('snapshots.apply') }}</button>
          <button type="button" class="link-btn danger" @click="$emit('delete', snap.id)">{{ t('snapshots.delete') }}</button>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { PedalSnapshot } from '../../composables/useSnapshots';

const props = defineProps<{
  snapshots: PedalSnapshot[];
}>();

const emit = defineEmits<{
  (e: 'save', name: string): void;
  (e: 'apply', id: string): void;
  (e: 'delete', id: string): void;
}>();

const snapshotName = ref('');
const nameInput = ref<HTMLInputElement | null>(null);
const { t } = useI18n();

function save() {
  const name = snapshotName.value.trim();
  if (!name) return;
  emit('save', name);
  snapshotName.value = '';
  nameInput.value?.focus();
}

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}
</script>

<style scoped>
.snapshot-manager {
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background: var(--surface);
}
.heading {
  margin: 0;
  font-size: 1rem;
}
.row {
  display: flex;
  gap: 0.5rem;
}
.input {
  flex: 1;
  min-width: 0;
}
.empty {
  margin: 0;
  font-size: 0.9rem;
  color: var(--muted);
}
.snapshot-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.snapshot-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
}
.info {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}
.info small {
  color: var(--muted);
}
.actions {
  display: flex;
  gap: 0.35rem;
}
.link-btn.danger {
  color: var(--danger, #c00);
}
</style>
