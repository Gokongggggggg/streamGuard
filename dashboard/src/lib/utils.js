export function relativeTime(dateStr) {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString("id-ID");
}

export function providerColor(provider) {
  const colors = { saweria: "#F7A41C", trakteer: "#E91E63", test: "#64748b" };
  return colors[provider] || "#64748b";
}

export function providerLabel(provider) {
  const labels = { saweria: "Saweria", trakteer: "Trakteer", test: "Test" };
  return labels[provider] || provider || "Unknown";
}
