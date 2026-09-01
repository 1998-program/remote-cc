function sessionActiveTs(session) {
  return Number(session?.lastActiveAt || session?.createdAt || 0);
}

function sortSessionsByRecentActivity(sessions) {
  return [...sessions].sort((a, b) => sessionActiveTs(b) - sessionActiveTs(a));
}

module.exports = {
  sessionActiveTs,
  sortSessionsByRecentActivity,
};
