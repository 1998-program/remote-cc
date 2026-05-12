const BASE = '';

function getToken() { return localStorage.getItem('rcc_token') || ''; }
function setToken(tok) { localStorage.setItem('rcc_token', tok); }
function clearToken() { localStorage.removeItem('rcc_token'); }

export function saveUsername(user) { localStorage.setItem('rcc_user', user); }
export function getSavedUsername() { return localStorage.getItem('rcc_user') || ''; }

function authHeader() {
  const tok = getToken();
  return tok ? { Authorization: `Bearer ${tok}` } : {};
}

// 401 回调：token 失效时通知 App 跳回登录页
let _onUnauthorized = null;
export function setUnauthorizedHandler(fn) { _onUnauthorized = fn; }

function handleUnauthorized() {
  clearToken();
  if (_onUnauthorized) _onUnauthorized();
}

export async function login(username, password) {
  const res = await fetch(BASE + '/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error('Invalid credentials');
  const { token } = await res.json();
  setToken(token);
  saveUsername(username);
}

export function logout() { clearToken(); }
export function isLoggedIn() { return !!getToken(); }

async function apiFetch(path, opts = {}) {
  const res = await fetch(BASE + path, {
    ...opts,
    headers: { ...authHeader(), ...(opts.headers || {}) },
  });
  if (res.status === 401) { handleUnauthorized(); throw new Error('Unauthorized'); }
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function apiFetchText(path) {
  const res = await fetch(BASE + path, { headers: authHeader() });
  if (res.status === 401) { handleUnauthorized(); throw new Error('Unauthorized'); }
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

export const api = {
  getProjects:        ()           => apiFetch('/api/projects'),
  getSessions:        (projectId)  => apiFetch(`/api/sessions/${encodeURIComponent(projectId)}`),
  getSession:         (sessionId)  => apiFetch(`/api/session/${encodeURIComponent(sessionId)}`),
  getActiveSessions:  ()           => apiFetch('/api/active-sessions'),
  getSessionLog:      (sessionId, bytes = 50000) => apiFetchText(`/api/session-log/${encodeURIComponent(sessionId)}?bytes=${bytes}`),
  fs: {
    list:  (path, hidden = false) => apiFetch(`/api/fs/list?path=${encodeURIComponent(path)}&hidden=${hidden}`),
    read:  (path, maxBytes = 102400) => apiFetch(`/api/fs/read?path=${encodeURIComponent(path)}&maxBytes=${maxBytes}`),
    stat:  (path) => apiFetch(`/api/fs/stat?path=${encodeURIComponent(path)}`),
  },
};

export function createWS() {
  const tok = getToken();
  const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
  return new WebSocket(`${proto}//${location.host}/ws?token=${encodeURIComponent(tok)}`);
}
