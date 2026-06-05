<template>
  <div class="sh-root">
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
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import Terminal from './Terminal.vue';
import { api, createWS } from '../api/index.js';

const props = defineProps({
  theme: { type: String, default: 'cyber' },
  initialCwd: { type: String, default: '/' },
});
const terminalRef = ref(null);
const status = ref('connecting');
const cwd = ref(props.initialCwd || '/');
let ws = null;
let closing = false;
let wsRun = 0;
let readyTimer = null;
let fallbackTimer = null;
let httpRun = 0;
const WS_FALLBACK_DELAY = 3000;
const HTTP_POLL_WAIT = 20000;

function clearTimers() {
  clearTimeout(readyTimer);
  clearTimeout(fallbackTimer);
}

function start() {
  const run = ++wsRun;
  cleanup(false);
  closing = false;
  status.value = 'connecting';
  const socket = createWS();
  ws = socket;

  function switchToHttpFallback(message) {
    if (run !== wsRun || closing || status.value === 'connected') return;
    wsRun++;
    try { socket.close(); } catch (_) {}
    if (message) terminalRef.value?.write(message);
    startHttp();
  }

  fallbackTimer = setTimeout(switchToHttpFallback, WS_FALLBACK_DELAY);

  socket.onopen = () => {
    if (run !== wsRun) return;
    clearTimeout(fallbackTimer);
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
        switchToHttpFallback('\r\n\x1b[31m[shell not ready; switching to HTTP fallback]\x1b[0m\r\n');
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
      if (msg.type === 'shell_replay_start') {
        terminalRef.value?.clear?.();
        return;
      }
      if (msg.type === 'shell_replay_end') {
        terminalRef.value?.fit?.();
        nextTick(() => terminalRef.value?.scrollToBottom?.());
        return;
      }
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
    clearTimers();
    if (run !== wsRun || closing) return;
    status.value = 'closed';
    terminalRef.value?.write('\r\n\x1b[33m[shell disconnected; reconnecting]\x1b[0m\r\n');
    setTimeout(() => {
      if (run !== wsRun || closing) return;
      startHttp();
    }, 1000);
  };
  socket.onerror = () => {};
}

function cleanup(kill = true) {
  closing = true;
  clearTimers();
  httpRun++;
  if (ws && ws.readyState === WebSocket.OPEN && kill) {
    try { ws.send(JSON.stringify({ type: 'shell_kill' })); } catch (_) {}
  }
  if ((!ws || ws.readyState !== WebSocket.OPEN) && kill) {
    api.shell.kill().catch(() => {});
  }
  try { ws?.close(); } catch (_) {}
  ws = null;
}

function sendInput(data) {
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'shell_input', data }));
  } else if (status.value === 'connected') {
    api.shell.input({
      data,
      cols: terminalRef.value?.getCols?.() ?? 80,
      rows: terminalRef.value?.getRows?.() ?? 24,
    }).catch(() => {});
  }
}

function onInput(data) {
  sendInput(data);
  terminalRef.value?.trackInput?.(data);
}

function onResize({ cols, rows }) {
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'shell_resize', cols, rows }));
  } else if (status.value === 'connected') {
    api.shell.resize({ cols, rows }).catch(() => {});
  }
}

function onPaste(text) {
  sendInput(text);
}

function applyHttpSnapshot(snapshot, clearFirst = false) {
  if (!snapshot) return;
  clearTimeout(readyTimer);
  status.value = snapshot.alive === false ? 'closed' : 'connected';
  cwd.value = snapshot.cwd || cwd.value;
  if (clearFirst || snapshot.reset) terminalRef.value?.clear?.();
  if (snapshot.output) terminalRef.value?.write?.(snapshot.output);
  if (snapshot.output) nextTick(() => terminalRef.value?.scrollToBottom?.());
  if (snapshot.alive === false) terminalRef.value?.write('\r\n\x1b[33m[shell exited]\x1b[0m\r\n');
}

async function startHttp() {
  const run = ++httpRun;
  clearTimers();
  try { ws?.close(); } catch (_) {}
  ws = null;
  closing = false;
  status.value = 'connecting';

  try {
    await nextTick();
    terminalRef.value?.fit?.();
    const snapshot = await api.shell.start({
      cwd: cwd.value || '/',
      cols: terminalRef.value?.getCols?.() ?? 80,
      rows: terminalRef.value?.getRows?.() ?? 24,
    });
    if (run !== httpRun || closing) return;
    applyHttpSnapshot(snapshot, true);
    pollHttp(run, snapshot.cursor ?? 0);
  } catch (e) {
    if (run !== httpRun || closing) return;
    status.value = 'error';
    terminalRef.value?.write(`\r\n\x1b[31m[shell error: ${e.message}]\x1b[0m\r\n`);
    setTimeout(() => {
      if (run === httpRun && !closing) startHttp();
    }, 2000);
  }
}

async function pollHttp(run, cursor) {
  let retryDelay = 1000;
  while (run === httpRun && !closing) {
    try {
      const result = await api.shell.poll(cursor, HTTP_POLL_WAIT);
      if (run !== httpRun || closing) return;
      retryDelay = 1000;
      applyHttpSnapshot(result, false);
      cursor = result.cursor ?? cursor;
      if (result.alive === false) return;
    } catch (_) {
      if (run !== httpRun || closing) return;
      status.value = 'closed';
      terminalRef.value?.write(`\r\n\x1b[33m[shell disconnected; retrying ${(retryDelay/1000).toFixed(1)}s]\x1b[0m\r\n`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      retryDelay = Math.min(retryDelay * 1.5, 15000);
    }
  }
}

onMounted(start);
onBeforeUnmount(() => cleanup(false));
</script>

<style scoped>
.sh-root {
  flex: 1; min-height: 0;
  display: flex; flex-direction: column;
  background: transparent;
}
.sh-terminal {
  flex: 1; min-height: 0;
}
</style>
