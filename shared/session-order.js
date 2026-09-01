export function sessionActiveTs(session) {
  return Number(session?.lastActiveAt || session?.createdAt || 0);
}

export function sortSessionsByRecentActivity(sessions) {
  return [...sessions].sort((a, b) => sessionActiveTs(b) - sessionActiveTs(a));
}
