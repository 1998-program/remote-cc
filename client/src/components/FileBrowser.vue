<template>
  <div class="fb-root">

    <!-- ── 工具栏 ──────────────────────────────────────────────── -->
    <div class="fb-toolbar">
      <div class="fb-breadcrumb">
        <span
          v-for="(crumb, i) in breadcrumbs"
          :key="crumb.path"
          class="fb-crumb"
          @click="navigateTo(crumb.path)"
        >{{ crumb.label }}</span>
      </div>

      <input
        v-model="pathInput"
        class="fb-path-input"
        :placeholder="currentPath || '输入路径…'"
        @keyup.enter="navigateTo(pathInput)"
        spellcheck="false"
      />

      <label class="fb-hidden-toggle" title="显示隐藏文件">
        <input type="checkbox" v-model="showHidden" @change="loadDir(currentPath)" />
        <span>隐藏文件</span>
      </label>

      <button class="fb-close-btn" @click="$emit('close')" title="关闭">✕</button>
    </div>

    <!-- ── 主体 ─────────────────────────────────────────────────── -->
    <div class="fb-body">

      <!-- 文件列表 -->
      <div class="fb-list-panel">
        <div v-if="loading" class="fb-status">加载中…</div>
        <div v-else-if="error" class="fb-status fb-status-err">{{ error }}</div>
        <div v-else-if="!entries.length && !parentPath" class="fb-status">目录为空</div>
        <div v-else class="fb-entries">
          <!-- 向上一级 -->
          <div v-if="parentPath" class="fb-entry fb-dir" @click="navigateTo(parentPath)">
            <span class="fb-icon fb-icon-dir">↩</span>
            <span class="fb-name">..</span>
          </div>
          <!-- 条目 -->
          <div
            v-for="entry in entries"
            :key="entry.name"
            class="fb-entry"
            :class="{ 'fb-dir': entry.type === 'dir', 'fb-selected': selectedEntry?.name === entry.name }"
            @click="selectEntry(entry)"
            @dblclick="onDblClick(entry)"
          >
            <span class="fb-icon" :class="entry.type === 'dir' ? 'fb-icon-dir' : 'fb-icon-file'">
              {{ entry.type === 'dir' ? '▸' : fileIcon(entry.ext) }}
            </span>
            <span class="fb-name" :title="entry.name">{{ entry.name }}</span>
            <span class="fb-meta">
              <span v-if="entry.type === 'file'" class="fb-size">{{ fmtSize(entry.size) }}</span>
              <button class="fb-copy-btn" title="复制路径" @click.stop="copyPath(entry)">⎘</button>
            </span>
          </div>
        </div>
      </div>

      <!-- 预览面板 -->
      <div class="fb-preview-panel">
        <div v-if="!preview.show" class="fb-preview-empty">
          <div class="fb-preview-empty-icon">⊞</div>
          <div>点击文件预览，双击全屏查看</div>
        </div>
        <template v-else>
          <div class="fb-preview-header">
            <span class="fb-preview-filename">{{ selectedEntry?.name }}</span>
            <span class="fb-preview-ext" v-if="selectedEntry?.ext">{{ selectedEntry.ext }}</span>
            <span class="fb-preview-size">{{ fmtSize(preview.size) }}</span>
            <span v-if="preview.truncated" class="fb-preview-truncated">已截断</span>
            <button class="fb-preview-fullscreen" title="全屏查看" @click="fullscreen = true">⛶</button>
            <button class="fb-preview-copy" title="复制文件路径" @click="copyPath(selectedEntry)">⎘ 复制路径</button>
          </div>
          <div v-if="preview.loading" class="fb-preview-loading">加载中…</div>
          <div v-else-if="preview.type === 'text'" class="fb-preview-code">
            <div class="fb-code-wrap">
              <div class="fb-line-nums" aria-hidden="true">
                <span v-for="n in lineCount" :key="n">{{ n }}</span>
              </div>
              <pre class="fb-code-content">{{ preview.content }}</pre>
            </div>
          </div>
          <div v-else-if="preview.type === 'image'" class="fb-preview-img">
            <img :src="preview.dataUrl" :alt="selectedEntry?.name" />
          </div>
          <div v-else class="fb-preview-unsupported">
            <div class="fb-unsupported-icon">{{ fileIcon(selectedEntry?.ext) }}</div>
            <div class="fb-unsupported-name">{{ selectedEntry?.name }}</div>
            <div class="fb-unsupported-info">
              <span v-if="preview.type === 'image_too_large'">图片过大（{{ fmtSize(preview.size) }}）</span>
              <span v-else>{{ fmtSize(preview.size) }} · 二进制文件</span>
            </div>
            <button class="fb-copy-path-btn" @click="copyPath(selectedEntry)">⎘ 复制路径</button>
          </div>
        </template>
      </div>
    </div>

    <!-- Toast -->
    <transition name="fb-toast-fade">
      <div v-if="copyToast" class="fb-toast">{{ copyToast }}</div>
    </transition>

    <!-- ── 全屏预览 ─────────────────────────────────────────────── -->
    <Teleport to="body">
      <div v-if="fullscreen" class="fb-fs-overlay" @click.self="fullscreen = false">
        <div class="fb-fs-box">
          <!-- 全屏头部 -->
          <div class="fb-fs-header">
            <span class="fb-preview-filename">{{ selectedEntry?.name }}</span>
            <span class="fb-preview-ext" v-if="selectedEntry?.ext">{{ selectedEntry.ext }}</span>
            <span class="fb-preview-size">{{ fmtSize(preview.size) }}</span>
            <span v-if="preview.truncated" class="fb-preview-truncated">已截断</span>
            <button class="fb-preview-copy" @click="copyPath(selectedEntry)">⎘ 复制路径</button>
            <button class="fb-fs-close" @click="fullscreen = false" title="关闭全屏">✕</button>
          </div>
          <!-- 全屏内容（复用同一份 preview 数据，无需重新请求） -->
          <div v-if="preview.loading" class="fb-preview-loading">加载中…</div>
          <div v-else-if="preview.type === 'text'" class="fb-preview-code fb-fs-content">
            <div class="fb-code-wrap">
              <div class="fb-line-nums" aria-hidden="true">
                <span v-for="n in lineCount" :key="n">{{ n }}</span>
              </div>
              <pre class="fb-code-content">{{ preview.content }}</pre>
            </div>
          </div>
          <div v-else-if="preview.type === 'image'" class="fb-preview-img fb-fs-content">
            <img :src="preview.dataUrl" :alt="selectedEntry?.name" />
          </div>
          <div v-else class="fb-preview-unsupported fb-fs-content">
            <div class="fb-unsupported-icon">{{ fileIcon(selectedEntry?.ext) }}</div>
            <div class="fb-unsupported-name">{{ selectedEntry?.name }}</div>
            <div class="fb-unsupported-info">
              <span v-if="preview.type === 'image_too_large'">图片过大（{{ fmtSize(preview.size) }}）</span>
              <span v-else>{{ fmtSize(preview.size) }} · 二进制文件</span>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { api } from '../api/index.js';

const props = defineProps({
  initialPath: { type: String, default: '' },
});
const emit = defineEmits(['close']);

// ── State ─────────────────────────────────────────────────────────────────────
const currentPath   = ref('');
const entries       = ref([]);
const showHidden    = ref(false);
const selectedEntry = ref(null);
const loading       = ref(false);
const error         = ref('');
const pathInput     = ref('');
const copyToast     = ref('');
const fullscreen    = ref(false);

const preview = reactive({
  show:      false,
  loading:   false,
  type:      '',
  content:   '',
  dataUrl:   '',
  truncated: false,
  size:      0,
});

// ESC 关闭全屏
function onKeydown(e) {
  if (e.key === 'Escape' && fullscreen.value) fullscreen.value = false;
}
onMounted(() => window.addEventListener('keydown', onKeydown));
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown));

// ── 面包屑 ────────────────────────────────────────────────────────────────────
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

const lineCount = computed(() => {
  if (preview.type !== 'text' || !preview.content) return 0;
  return preview.content.split('\n').length;
});

// ── 目录加载 ──────────────────────────────────────────────────────────────────
async function loadDir(reqPath) {
  loading.value = true;
  error.value   = '';
  entries.value = [];
  selectedEntry.value = null;
  preview.show  = false;
  fullscreen.value = false;
  try {
    const res = await api.fs.list(reqPath || '~', showHidden.value);
    currentPath.value = res.path;
    pathInput.value   = res.path;
    entries.value     = res.entries;
  } catch (e) {
    error.value = e.message || '加载失败';
  } finally {
    loading.value = false;
  }
}

function navigateTo(p) {
  if (p) loadDir(p);
}

// ── 条目交互 ──────────────────────────────────────────────────────────────────
function selectEntry(entry) {
  selectedEntry.value = entry;
  if (entry.type === 'file') loadPreview(entry);
  else preview.show = false;
}

function onDblClick(entry) {
  if (entry.type === 'dir') {
    navigateTo(currentPath.value + '/' + entry.name);
  } else {
    // 文件双击：已有预览则直接全屏，否则先加载再全屏
    if (preview.show && selectedEntry.value?.name === entry.name && !preview.loading) {
      fullscreen.value = true;
    } else {
      selectEntry(entry);
      // 等加载完成后自动全屏
      const stop = watch(() => preview.loading, (loading) => {
        if (!loading) { fullscreen.value = true; stop(); }
      });
    }
  }
}

async function loadPreview(entry) {
  const fp = currentPath.value + '/' + entry.name;
  preview.show    = true;
  preview.loading = true;
  preview.content = '';
  preview.dataUrl = '';
  preview.type    = '';
  preview.truncated = false;
  preview.size    = entry.size ?? 0;
  try {
    const res = await api.fs.read(fp);
    preview.type      = res.type;
    preview.content   = res.content   || '';
    preview.dataUrl   = res.dataUrl   || '';
    preview.truncated = res.truncated || false;
    preview.size      = res.size ?? entry.size ?? 0;
  } catch (_) {
    preview.type = 'unsupported';
  } finally {
    preview.loading = false;
  }
}

// ── 复制路径 ──────────────────────────────────────────────────────────────────
function fullPath(entry) {
  if (!entry) return '';
  const base = currentPath.value || '';
  if (base === '/') return `/${entry.name}`;
  return `${base.replace(/\/+$/, '')}/${entry.name}`;
}

let toastTimer = null;
async function copyPath(entry) {
  const p = fullPath(entry);
  if (!p) {
    showToast('复制失败');
    return;
  }
  if (await copyText(p)) {
    showToast(p);
    return;
  }
  showToast('复制失败');
}

async function copyText(text) {
  if (navigator.clipboard?.writeText && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_) {}
  }
  return fallbackCopyText(text);
}

function fallbackCopyText(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', '');
  ta.style.position = 'fixed';
  ta.style.left = '-9999px';
  ta.style.top = '0';
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  ta.setSelectionRange(0, ta.value.length);
  let copied = false;
  try {
    copied = document.execCommand('copy');
  } catch (_) {
    copied = false;
  } finally {
    document.body.removeChild(ta);
  }
  return copied;
}

function showToast(msg) {
  copyToast.value = msg;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { copyToast.value = ''; }, 2500);
}

// ── 格式化 ────────────────────────────────────────────────────────────────────
function fmtSize(bytes) {
  if (bytes == null || bytes === '') return '';
  if (bytes < 1024)             return bytes + ' B';
  if (bytes < 1024 * 1024)      return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

const EXT_ICON = {
  '.md': '≡', '.txt': '≡', '.log': '≡', '.csv': '≡',
  '.js': 'JS', '.ts': 'TS', '.jsx': 'JS', '.tsx': 'TS',
  '.py': 'Py', '.rb': 'rb', '.go': 'Go', '.rs': 'Rs',
  '.vue': '⬡', '.html': '≷', '.css': '~', '.scss': '~',
  '.json': '{}', '.yaml': '{}', '.yml': '{}', '.toml': '{}',
  '.sh': '$', '.bash': '$', '.zsh': '$',
  '.png': '▣', '.jpg': '▣', '.jpeg': '▣', '.gif': '▣',
  '.svg': '▣', '.webp': '▣',
  '.pdf': '≡',
};
function fileIcon(ext) {
  return EXT_ICON[(ext || '').toLowerCase()] || '·';
}

onMounted(() => loadDir(props.initialPath || '~'));

watch(() => props.initialPath, (newPath) => {
  if (newPath && newPath !== currentPath.value) loadDir(newPath);
});
</script>

<style scoped>
.fb-root {
  display: flex; flex-direction: column;
  height: 100%; background: var(--bg); color: var(--text);
  font-family: 'JetBrains Mono', monospace; font-size: 13px;
  position: relative; overflow: hidden;
}

/* ── 工具栏 ─────────────────────────────────────── */
.fb-toolbar {
  display: flex; align-items: center; gap: 8px;
  padding: 6px 12px; background: var(--bg2);
  border-bottom: 1px solid var(--border); flex-shrink: 0;
  min-height: 40px; flex-wrap: wrap;
}

.fb-breadcrumb {
  display: flex; align-items: center; flex-shrink: 0;
  max-width: 35%; overflow: hidden; gap: 1px;
}
.fb-crumb {
  cursor: pointer; color: var(--muted); font-size: 11px;
  padding: 2px 3px; border-radius: 3px;
  transition: color .12s, background .12s; white-space: nowrap;
}
.fb-crumb:hover { color: var(--neon); background: color-mix(in srgb, var(--neon) 8%, transparent); }
.fb-crumb:not(:last-child)::after { content: '/'; color: var(--muted); opacity: .4; margin-left: 1px; }
.fb-crumb:last-child { color: var(--text); }

.fb-path-input {
  flex: 1; min-width: 100px;
  background: var(--bg3); color: var(--text);
  border: 1px solid var(--border); border-radius: 5px;
  font-family: inherit; font-size: 12px;
  padding: 4px 8px; outline: none; transition: border-color .15s;
}
.fb-path-input:focus { border-color: var(--neon); }

.fb-hidden-toggle {
  display: flex; align-items: center; gap: 4px;
  cursor: pointer; color: var(--muted); font-size: 11px;
  flex-shrink: 0; white-space: nowrap;
}
.fb-hidden-toggle input { accent-color: var(--neon); }

.fb-close-btn {
  background: none; border: none; cursor: pointer;
  color: var(--muted); font-size: 13px; padding: 3px 7px;
  border-radius: 4px; flex-shrink: 0; transition: color .15s, background .15s;
}
.fb-close-btn:hover { color: #f38ba8; background: color-mix(in srgb, #f38ba8 10%, transparent); }

/* ── 主体 ────────────────────────────────────────── */
.fb-body { flex: 1; min-height: 0; display: flex; overflow: hidden; }

/* ── 文件列表 ─────────────────────────────────────── */
.fb-list-panel {
  width: 260px; min-width: 160px; flex-shrink: 0;
  border-right: 1px solid var(--border);
  overflow-y: auto; overflow-x: hidden;
}
.fb-entries { padding: 3px; }

.fb-status { color: var(--muted); padding: 20px 12px; text-align: center; font-size: 12px; }
.fb-status-err { color: #f38ba8; text-align: left; }

.fb-entry {
  display: flex; align-items: center; gap: 5px;
  padding: 4px 6px; border-radius: 4px; cursor: pointer;
  transition: background .1s; user-select: none;
}
.fb-entry:hover { background: color-mix(in srgb, var(--neon) 7%, transparent); }
.fb-entry.fb-selected { background: color-mix(in srgb, var(--neon) 14%, transparent); }

.fb-icon { width: 16px; text-align: center; flex-shrink: 0; font-size: 10px; }
.fb-icon-dir { color: var(--neon); font-size: 12px; }
.fb-icon-file { color: var(--muted); }

.fb-name {
  flex: 1; min-width: 0;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 12px;
}
.fb-dir .fb-name { color: var(--neon); }

.fb-meta { display: flex; align-items: center; gap: 4px; flex-shrink: 0; opacity: 0; transition: opacity .1s; }
.fb-entry:hover .fb-meta,
.fb-entry.fb-selected .fb-meta { opacity: 1; }

.fb-size { color: var(--muted); font-size: 10px; white-space: nowrap; }

.fb-copy-btn {
  background: none; border: 1px solid var(--border); border-radius: 3px;
  color: var(--muted); font-size: 10px; padding: 0 4px; line-height: 16px;
  cursor: pointer; transition: color .1s, border-color .1s;
}
.fb-copy-btn:hover { color: var(--neon); border-color: var(--neon); }

/* ── 预览面板 ─────────────────────────────────────── */
.fb-preview-panel {
  flex: 1; min-width: 0; display: flex; flex-direction: column;
  overflow: hidden; background: var(--bg);
}

.fb-preview-empty {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 10px; color: var(--muted); font-size: 12px;
}
.fb-preview-empty-icon { font-size: 28px; opacity: .3; }

.fb-preview-header {
  display: flex; align-items: center; gap: 8px;
  padding: 6px 12px; background: var(--bg2);
  border-bottom: 1px solid var(--border); flex-shrink: 0;
  font-size: 11px; min-height: 34px; flex-wrap: wrap;
}
.fb-preview-filename { color: var(--text); font-weight: bold; font-size: 12px; }
.fb-preview-ext {
  background: color-mix(in srgb, var(--neon) 12%, transparent);
  color: var(--neon); font-size: 10px; padding: 1px 5px;
  border-radius: 3px; border: 1px solid color-mix(in srgb, var(--neon) 25%, transparent);
}
.fb-preview-size { color: var(--muted); }
.fb-preview-truncated {
  color: #f9e2af; font-size: 10px;
  background: color-mix(in srgb, #f9e2af 10%, transparent);
  padding: 1px 5px; border-radius: 3px;
}
.fb-preview-fullscreen {
  background: none; border: 1px solid var(--border); border-radius: 4px;
  color: var(--muted); font-size: 12px; padding: 1px 6px; cursor: pointer;
  transition: color .12s, border-color .12s;
}
.fb-preview-fullscreen:hover { color: var(--neon); border-color: var(--neon); }
.fb-preview-copy {
  margin-left: auto;
  background: none; border: 1px solid var(--border); border-radius: 4px;
  color: var(--muted); font-size: 11px; padding: 2px 8px; cursor: pointer;
  font-family: inherit; transition: color .12s, border-color .12s; white-space: nowrap;
}
.fb-preview-copy:hover { color: var(--neon); border-color: var(--neon); }

.fb-preview-loading {
  flex: 1; display: flex; align-items: center; justify-content: center;
  color: var(--muted); font-size: 12px;
}

.fb-preview-code { flex: 1; overflow: auto; background: var(--bg); }
.fb-code-wrap { display: flex; min-height: 100%; }
.fb-line-nums {
  display: flex; flex-direction: column;
  padding: 14px 10px 14px 14px;
  text-align: right; user-select: none;
  border-right: 1px solid var(--border);
  background: var(--bg2); flex-shrink: 0;
}
.fb-line-nums span {
  font-size: 11px; line-height: 1.65;
  color: var(--muted); opacity: .5;
  font-family: 'JetBrains Mono', monospace;
}
.fb-code-content {
  flex: 1; margin: 0; padding: 14px 16px;
  white-space: pre; overflow-x: auto;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px; line-height: 1.65; color: var(--text); tab-size: 2;
}

.fb-preview-img {
  flex: 1; overflow: auto;
  display: flex; align-items: flex-start; justify-content: center;
  padding: 20px; background: color-mix(in srgb, var(--bg) 60%, #00000020);
}
.fb-preview-img img {
  max-width: 100%; object-fit: contain;
  border-radius: 6px; box-shadow: 0 4px 24px #00000040;
}

.fb-preview-unsupported {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 8px; color: var(--muted);
}
.fb-unsupported-icon { font-size: 32px; opacity: .3; }
.fb-unsupported-name { color: var(--text); font-size: 13px; }
.fb-unsupported-info { font-size: 11px; }
.fb-copy-path-btn {
  margin-top: 8px;
  background: none; border: 1px solid var(--border); border-radius: 5px;
  color: var(--muted); font-size: 12px; padding: 5px 14px; cursor: pointer;
  font-family: inherit; transition: color .12s, border-color .12s;
}
.fb-copy-path-btn:hover { color: var(--neon); border-color: var(--neon); }

/* ── 全屏预览 ─────────────────────────────────────── */
.fb-fs-overlay {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(0, 0, 0, .85);
  display: flex; align-items: stretch;
}
.fb-fs-box {
  flex: 1; display: flex; flex-direction: column;
  background: var(--bg); overflow: hidden;
}
.fb-fs-header {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 14px; background: var(--bg2);
  border-bottom: 1px solid var(--border); flex-shrink: 0;
  font-size: 11px; flex-wrap: wrap;
}
.fb-fs-close {
  margin-left: auto;
  background: none; border: none; cursor: pointer;
  color: var(--muted); font-size: 16px; padding: 2px 8px;
  border-radius: 4px; transition: color .15s, background .15s;
}
.fb-fs-close:hover { color: #f38ba8; background: color-mix(in srgb, #f38ba8 10%, transparent); }
.fb-fs-content { flex: 1; min-height: 0; }

/* ── Toast ───────────────────────────────────────── */
.fb-toast {
  position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%);
  background: var(--bg2); border: 1px solid var(--border);
  color: var(--text); font-size: 11px; padding: 6px 16px;
  border-radius: 20px; pointer-events: none;
  max-width: 80%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  box-shadow: 0 4px 20px #00000060;
}
.fb-toast-fade-enter-active { transition: opacity .15s, transform .15s; }
.fb-toast-fade-leave-active { transition: opacity .2s, transform .2s; }
.fb-toast-fade-enter-from  { opacity: 0; transform: translateX(-50%) translateY(8px); }
.fb-toast-fade-leave-to    { opacity: 0; transform: translateX(-50%) translateY(8px); }
</style>
