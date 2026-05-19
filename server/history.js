const fs = require('fs');
const path = require('path');
const os = require('os');
const { normalizeAgent } = require('./agent-config');

const CLAUDE_PROJECTS_DIR = path.join(os.homedir(), '.claude', 'projects');
const CODEX_HISTORY_FILE = path.join(os.homedir(), '.codex', 'history.jsonl');

function getProjects(agent = 'claude') {
  return normalizeAgent(agent) === 'codex' ? getCodexProjects() : getClaudeProjects();
}

function getClaudeProjects() {
  if (!fs.existsSync(CLAUDE_PROJECTS_DIR)) return [];
  const dirs = fs.readdirSync(CLAUDE_PROJECTS_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  const projects = [];
  for (const dir of dirs) {
    const sessions = getSessions(dir);
    if (sessions.length === 0) continue;
    // cwd 从最新 session 的第一条消息中读取
    const latestSession = sessions[0];
    projects.push({
      id: dir,
      displayPath: latestSession.cwd || dir,
      sessionCount: sessions.length,
      lastModified: sessions[0].lastModified,
    });
  }
  return projects.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
}

function getSessions(projectId, agent = 'claude') {
  return normalizeAgent(agent) === 'codex' ? getCodexSessions(projectId) : getClaudeSessions(projectId);
}

function getClaudeSessions(projectId) {
  const dir = path.join(CLAUDE_PROJECTS_DIR, projectId);
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir)
    .filter(f => f.endsWith('.jsonl'))
    .map(f => {
      const filePath = path.join(dir, f);
      const stat = fs.statSync(filePath);
      return { file: f, filePath, mtime: stat.mtime };
    })
    .sort((a, b) => b.mtime - a.mtime);

  return files.map(({ file, filePath, mtime }) => {
    const sessionId = file.replace('.jsonl', '');
    const preview = readSessionPreview(filePath);
    return {
      sessionId,
      projectId,
      lastModified: mtime.toISOString(),
      lastMessage: preview.lastMessage,
      messageCount: preview.messageCount,
      cwd: preview.cwd,
    };
  });
}

function readSessionPreview(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.trim().split('\n').filter(Boolean);
    let lastMessage = '';
    let messageCount = 0;
    let cwd = '';

    for (const line of lines) {
      try {
        const obj = JSON.parse(line);
        if (obj.cwd && !cwd) cwd = obj.cwd;
        if (obj.type === 'user' || obj.type === 'assistant') {
          messageCount++;
          // 取最后一条用户消息作为预览
          if (obj.type === 'user') {
            const msg = obj.message;
            if (msg && msg.content) {
              if (typeof msg.content === 'string') lastMessage = msg.content.slice(0, 100);
              else if (Array.isArray(msg.content)) {
                const textPart = msg.content.find(p => p.type === 'text');
                if (textPart) lastMessage = textPart.text.slice(0, 100);
              }
            }
          }
        }
      } catch (_) {}
    }
    return { lastMessage, messageCount, cwd };
  } catch (_) {
    return { lastMessage: '', messageCount: 0, cwd: '' };
  }
}

function readSession(sessionId, agent = 'claude') {
  if (normalizeAgent(agent) === 'codex') return [];
  // search all project dirs for this session
  if (!fs.existsSync(CLAUDE_PROJECTS_DIR)) return [];
  const dirs = fs.readdirSync(CLAUDE_PROJECTS_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  for (const dir of dirs) {
    const filePath = path.join(CLAUDE_PROJECTS_DIR, dir, `${sessionId}.jsonl`);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.trim().split('\n').filter(Boolean);
      return lines.map(l => { try { return JSON.parse(l); } catch (_) { return null; } }).filter(Boolean);
    }
  }
  return [];
}

function getCodexHistoryEntries() {
  if (!fs.existsSync(CODEX_HISTORY_FILE)) return [];
  try {
    return fs.readFileSync(CODEX_HISTORY_FILE, 'utf8')
      .trim()
      .split('\n')
      .filter(Boolean)
      .map(line => {
        try { return JSON.parse(line); } catch (_) { return null; }
      })
      .filter(item => item && item.session_id);
  } catch (_) {
    return [];
  }
}

function getCodexProjects() {
  const sessions = getCodexSessions('codex');
  if (!sessions.length) return [];
  return [{
    id: 'codex',
    displayPath: '~/.codex/history.jsonl',
    sessionCount: sessions.length,
    lastModified: sessions[0].lastModified,
  }];
}

function getCodexSessions(projectId) {
  if (projectId !== 'codex') return [];
  const byId = new Map();
  for (const item of getCodexHistoryEntries()) {
    const id = item.session_id;
    const current = byId.get(id) || {
      sessionId: id,
      projectId: 'codex',
      lastModified: new Date(0).toISOString(),
      lastMessage: '',
      messageCount: 0,
      cwd: '',
    };
    current.messageCount += 1;
    if (item.text) current.lastMessage = String(item.text).slice(0, 100);
    if (item.ts) current.lastModified = new Date(item.ts * 1000).toISOString();
    byId.set(id, current);
  }
  return Array.from(byId.values()).sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
}

module.exports = { getProjects, getSessions, readSession };
