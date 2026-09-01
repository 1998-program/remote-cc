const assert = require('assert');
const { sortSessionsByRecentActivity } = require('./session-order');

const sessions = [
  { sessionId: 'old-created-recent-active', createdAt: 1000, lastActiveAt: 9000 },
  { sessionId: 'new-created-old-active', createdAt: 8000, lastActiveAt: 2000 },
  { sessionId: 'created-fallback', createdAt: 7000 },
];

const ordered = sortSessionsByRecentActivity(sessions).map(s => s.sessionId);

assert.deepStrictEqual(ordered, [
  'old-created-recent-active',
  'created-fallback',
  'new-created-old-active',
]);

assert.deepStrictEqual(
  sessions.map(s => s.sessionId),
  ['old-created-recent-active', 'new-created-old-active', 'created-fallback'],
  'sortSessionsByRecentActivity must not mutate its input',
);
