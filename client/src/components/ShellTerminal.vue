<template>
  <div class="sh-root">
    <div class="sh-toolbar">
      <div class="sh-title">
        <span class="sh-dot" :class="statusClass"></span>
        <span class="sh-label">Shell</span>
        <span class="sh-cwd" :title="cwd">{{ shortCwd(cwd) }}</span>
      </div>
      <div class="sh-actions">
        <button class="sh-btn" title="重启 shell" @click="restart"><AppIcon name="refresh" /></button>
        <button class="sh-btn danger" title="关闭 shell" @click="close"><AppIcon name="close" /></button>
      </div>
    </div>
    <Terminal
      ref="terminalRef"
      class="sh-terminal"
      :theme="theme"
      symbol-mode="shell"
      @input="onInput"
      @resize="onResize"
      @paste="onPaste"
    />
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import Terminal from './Terminal.vue';
import AppIcon from './AppIcon.vue';
import { createWS } from '../api/index.js';

const props = defineProps({
  theme: { type: String, default: 'cyber' },
  initialCwd: { type: String, default: '/' },
});
const emit = defineEmits(['close']);

const terminalRef = ref(null);
const status = ref('connecting');
const cwd = ref(props.initialCwd || '/');
let ws = null;
let closing = false;
let wsRun = 0;
let readyTimer = null;

const statusClass = computed(() => ({
  connected: status.value === 'connected',
  dead: status.value === 'closed' || status.value === 'error',
}));

function shortCwd(path) {
  if (!path) return '';
  return path.replace(/^\/paddle\//, '~/').replace(/^\/root\//, '~/').replace(/^\/home\/[^/]+\//, '~/');
}

function start() {
  const run = ++wsRun;
  cleanup(false);
  closing = false;
  status.value = 'connecting';
  const socket = createWS();
  ws = socket;

  socket.onopen = () => {
    if (run !== wsRun) return;
    nextTick(() => {
      if (run !== wsRun || socket.readyState !== WebSocket.OPEN) return;
      terminalRef.value?.fit();
      socket.send(JSON.stringify({
        type: 'shell_start',
        cwd: cwd.value || '/',
        cols: terminalRef.value?.getCols?.() ?? 80,
        rows: terminalRef.value?.getRows?.() ?? 24,
      }));
      readyTimer = setTimeout(() => {
        if (run !== wsRun || status.value !== 'connecting') return;
        status.value = 'error';
        terminalRef.value?.write('\r\n\x1b[31m[shell not ready; run remotecc restart after updating]\x1b[0m\r\n');
      }, 3000);
    });
  };

  socket.onmessage = (evt) => {
    if (run !== wsRun) return;
    const data = evt.data;
    try {
      const msg = JSON.parse(data);
      if (!msg?.type) throw 0;
      if (msg.type === 'session_list') return;
      if (msg.type === 'shell_ready') {
        clearTimeout(readyTimer);
        status.value = 'connected';
        cwd.value = msg.cwd || cwd.value;
        return;
      }
      if (msg.type === 'shell_error') {
        clearTimeout(readyTimer);
        status.value = 'error';
        terminalRef.value?.write(`\r\n\x1b[31m[shell error: ${msg.message}]\x1b[0m\r\n`);
        return;
      }
      if (msg.type === 'shell_exit') {
        clearTimeout(readyTimer);
        status.value = 'closed';
        terminalRef.value?.write(`\r\n\x1b[33m[shell exited]\x1b[0m\r\n`);
        return;
      }
    } catch (_) {}
    terminalRef.value?.write(data);
  };

  socket.onclose = () => {
    clearTimeout(readyTimer);
    if (run !== wsRun || closing) return;
    status.value = 'closed';
    terminalRef.value?.write('\r\n\x1b[33m[shell disconnected]\x1b[0m\r\n');
  };
  socket.onerror = () => {};
}

function cleanup(kill = true) {
  closing = true;
  clearTimeout(readyTimer);
  if (ws && ws.readyState === WebSocket.OPEN && kill) {
    try { ws.send(JSON.stringify({ type: 'shell_kill' })); } catch (_) {}
  }
  try { ws?.close(); } catch (_) {}
  ws = null;
}

function restart() {
  terminalRef.value?.write('\r\n\x1b[36m[restarting shell]\x1b[0m\r\n');
  start();
}

function close() {
  cleanup(true);
  emit('close');
}

function sendInput(data) {
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'shell_input', data }));
  }
}

function onInput(data) {
  sendInput(data);
  terminalRef.value?.trackInput?.(data);
}

function onResize({ cols, rows }) {
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'shell_resize', cols, rows }));
  }
}

function onPaste(text) {
  sendInput(text);
}

onMounted(start);
onBeforeUnmount(() => cleanup(true));
</script>

<style scoped>
.sh-root {
  flex: 1; min-height: 0;
  display: flex; flex-direction: column;
  background: var(--bg);
}
.sh-toolbar {
  display: flex; align-items: center; justify-content: space-between;
  gap: 10px; min-height: 34px; padding: 5px 10px;
  background: var(--bg2); border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}
.sh-title {
  display: flex; align-items: center; gap: 8px;
  min-width: 0;
}
.sh-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: #f9e2af; box-shadow: 0 0 5px #f9e2af70;
  flex-shrink: 0;
}
.sh-dot.connected { background: #a6e3a1; box-shadow: 0 0 5px #a6e3a170; }
.sh-dot.dead { background: #f38ba8; box-shadow: 0 0 5px #f38ba870; }
.sh-label {
  font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 800;
  color: var(--text);
}
.sh-cwd {
  color: var(--muted); font-size: 11px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  max-width: min(56vw, 520px);
}
.sh-actions {
  display: flex; align-items: center; gap: 6px;
  flex-shrink: 0;
}
.sh-btn {
  background: none; border: 1px solid var(--border); border-radius: 4px;
  color: var(--muted); cursor: pointer;
  width: 26px; height: 23px;
  display: inline-flex; align-items: center; justify-content: center;
  transition: color .12s, border-color .12s, background .12s;
}
.sh-btn:hover {
  color: var(--neon); border-color: var(--neon);
  background: color-mix(in srgb, var(--neon) 8%, transparent);
}
.sh-btn.danger:hover {
  color: #f38ba8; border-color: #f38ba8;
  background: color-mix(in srgb, #f38ba8 10%, transparent);
}
.sh-terminal {
  flex: 1; min-height: 0;
}
</style>
