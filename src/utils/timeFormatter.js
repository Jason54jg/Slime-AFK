function formatTimestamp() {
  const now = new Date();
  return `<${now.toLocaleTimeString()}> `;
}

function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  return hours > 0
    ? `${hours}h ${minutes % 60}m`
    : minutes > 0
      ? `${minutes}m ${seconds % 60}s`
      : `${seconds}s`;
}

module.exports = {
  formatTimestamp,
  formatDuration
};