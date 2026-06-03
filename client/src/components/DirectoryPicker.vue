<template>
  <div class="dp-root">
    <div class="dp-toolbar">
      <div class="dp-crumbs">
        <button
          v-for="crumb in breadcrumbs"
          :key="crumb.path"
          class="dp-crumb"
          @click="loadDir(crumb.path)"
        >
          {{ crumb.label }}
        </button>
      </div>
      <input
        v-model="pathInput"
        class="dp-input"
        spellcheck="false"
        @keyup.enter="loadDir(pathInput)"
      />
      <label class="dp-hidden" title="显示隐藏目录">
        <input type="checkbox" v-model="showHidden" @change="loadDir(currentPath)" />
        <span>隐藏</span>
      </label>
      <button class="dp-select" @click="selectPath(currentPath)">选择当前</button>
      <button class="dp-close" title="关闭" @click="$emit('cancel')"><AppIcon name="close" /></button>
    </div>

    <div class="dp-body">
      <div v-if="loading" class="dp-status">加载中…</div>
      <div v-else-if="error" class="dp-status dp-error">{{ error }}</div>
      <template v-else>
        <button v-if="parentPath" class="dp-row dp-parent" @click="loadDir(parentPath)">
          <span class="dp-icon"><AppIcon name="parent" /></span>
          <span class="dp-name">..</span>
        </button>
        <button
          v-for="entry in dirs"
          :key="entry.name"
          class="dp-row"
          :class="{ active: fullPath(entry) === selectedPath }"
          @click="selectedPath = fullPath(entry)"
          @dblclick="loadDir(fullPath(entry))"
        >
          <span class="dp-icon"><AppIcon name="folder" /></span>
          <span class="dp-name">{{ entry.name }}</span>
          <span class="dp-actions">
            <span class="dp-action" @click.stop="loadDir(fullPath(entry))">打开</span>
            <span class="dp-action primary" @click.stop="selectPath(fullPath(entry))">选择</span>
          </span>
        </button>
        <div v-if="!dirs.length && !parentPath" class="dp-status">无目录</div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { api } from '../api/index.js';
import AppIcon from './AppIcon.vue';

const props = defineProps({
  initialPath: { type: String, default: '/' },
});
const emit = defineEmits(['select', 'cancel']);

const currentPath = ref('');
const pathInput = ref('');
const entries = ref([]);
const selectedPath = ref('');
const showHidden = ref(false);
const loading = ref(false);
const error = ref('');

const dirs = computed(() => entries.value.filter(entry => entry.type === 'dir'));

const breadcrumbs = computed(() => {
  const p = currentPath.value;
  if (!p) return [];
  const parts = p.split('/').filter(Boolean);
  const crumbs = [{ label: '/', path: '/' }];
  let acc = '';
  for (const part of parts) {
    acc += '/' + part;
    crumbs.push({ label: part, path: acc });
  }
  return crumbs;
});

const parentPath = computed(() => {
  const p = currentPath.value;
  if (!p || p === '/') return '';
  return p.split('/').slice(0, -1).join('/') || '/';
});

function fullPath(entry) {
  if (!entry) return '';
  if (currentPath.value === '/') return `/${entry.name}`;
  return `${currentPath.value.replace(/\/+$/, '')}/${entry.name}`;
}

async function loadDir(path) {
  loading.value = true;
  error.value = '';
  try {
    const res = await api.fs.list(path || '/', showHidden.value);
    currentPath.value = res.path;
    pathInput.value = res.path;
    selectedPath.value = res.path;
    entries.value = res.entries;
  } catch (e) {
    error.value = e.message || '加载失败';
  } finally {
    loading.value = false;
  }
}

function selectPath(path) {
  if (!path) return;
  emit('select', path);
}

onMounted(() => loadDir(props.initialPath || '/'));

watch(() => props.initialPath, path => {
  if (path && path !== currentPath.value) loadDir(path);
});
</script>

<style scoped>
.dp-root {
  border: 1px solid var(--border);
  border-radius: 7px;
  background: color-mix(in srgb, var(--bg) 78%, var(--bg2));
  overflow: hidden;
}
.dp-toolbar {
  display: flex; align-items: center; gap: 7px;
  padding: 7px;
  background: var(--bg2);
  border-bottom: 1px solid var(--border);
  flex-wrap: wrap;
}
.dp-crumbs {
  display: flex; align-items: center; gap: 2px;
  max-width: 32%;
  overflow: hidden;
}
.dp-crumb {
  background: none; border: none; cursor: pointer;
  color: var(--muted); font-family: 'JetBrains Mono', monospace;
  font-size: 11px; padding: 2px 3px;
  white-space: nowrap;
}
.dp-crumb:hover { color: var(--neon); }
.dp-crumb:not(:last-child)::after { content: '/'; opacity: .35; margin-left: 3px; }
.dp-input {
  flex: 1; min-width: 160px;
  background: var(--bg); color: var(--text);
  border: 1px solid var(--border); border-radius: 5px;
  font-family: 'JetBrains Mono', monospace; font-size: 12px;
  padding: 6px 8px; outline: none;
}
.dp-input:focus { border-color: var(--neon); }
.dp-hidden {
  display: flex; align-items: center; gap: 4px;
  color: var(--muted); font-size: 11px; white-space: nowrap;
}
.dp-hidden input { accent-color: var(--neon); }
.dp-select,
.dp-close {
  background: none; border: 1px solid var(--border); border-radius: 5px;
  color: var(--muted); cursor: pointer;
  font-family: 'JetBrains Mono', monospace; font-size: 11px;
  height: 28px; padding: 0 9px;
  transition: color .12s, border-color .12s, background .12s;
  display: inline-flex; align-items: center; justify-content: center; gap: 5px;
}
.dp-select:hover,
.dp-close:hover {
  color: var(--neon); border-color: var(--neon);
  background: color-mix(in srgb, var(--neon) 8%, transparent);
}
.dp-body {
  max-height: min(340px, 42vh);
  overflow: auto;
  padding: 4px;
}
.dp-row {
  display: flex; align-items: center; gap: 7px;
  width: 100%;
  background: none; border: none; border-radius: 5px;
  color: var(--text); cursor: pointer;
  padding: 7px 8px; text-align: left;
  font-family: 'JetBrains Mono', monospace; font-size: 12px;
}
.dp-row:hover,
.dp-row.active {
  background: color-mix(in srgb, var(--neon) 8%, transparent);
}
.dp-parent { color: var(--neon2); }
.dp-icon {
  width: 18px; text-align: center; color: var(--neon); flex-shrink: 0;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 16px;
}
.dp-name {
  flex: 1; min-width: 0;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.dp-actions {
  display: flex; align-items: center; gap: 6px;
  flex-shrink: 0; opacity: 0;
}
.dp-row:hover .dp-actions,
.dp-row.active .dp-actions { opacity: 1; }
.dp-action {
  color: var(--muted); font-size: 10px;
}
.dp-action.primary { color: var(--neon); }
.dp-status {
  padding: 16px 10px;
  color: var(--muted); font-size: 12px; text-align: center;
}
.dp-error { color: #f38ba8; }
@media (max-width: 700px) {
  .dp-crumbs { max-width: 100%; width: 100%; }
  .dp-actions { opacity: 1; }
}
</style>
