import { useState, useEffect } from "react";
import T from "../lib/theme";
import { Card, CopyField, Stat, Badge } from "../components/ui";
import { api } from "../lib/api";

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

const providerColors = {
  saweria: T.accent,
  trakteer: T.success,
};

export default function PageOverview({ user, stats, baseUrl }) {
  const [recentDonations, setRecentDonations] = useState([]);

  useEffect(() => {
    api("/api/donations/recent")
      .then((d) => setRecentDonations(d.donations || []))
      .catch(() => {});
  }, []);

  const total = parseInt(stats.total) || 0;
  const blocked = parseInt(stats.blocked) || 0;
  const blockRate = total > 0 ? ((blocked / total) * 100).toFixed(1) : "0";

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
        Welcome back, {user.username || "Streamer"} 👋
      </h2>
      <p style={{ color: T.textDim, marginBottom: 28, fontSize: 14 }}>
        {user.filter_enabled ? "Your filter is active and protecting your stream." : "⚠️ Your filter is currently disabled."}
      </p>

      <div style={{ display: "flex", gap: 12, marginBottom: 28 }}>
        <Stat label="Total" value={stats.total} />
        <Stat label="Passed" value={stats.passed} color={T.success} />
        <Stat label="Blocked" value={stats.blocked} color={T.danger} sub={`${blockRate}% block rate`} />
      </div>

      <div style={{ fontSize: 12, fontWeight: 600, color: T.textMuted, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>
        Quick Setup
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        <Card style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <span style={{
              width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
              background: T.accentDim, fontSize: 14,
            }}>⟁</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Donation Platforms</div>
              <div style={{ fontSize: 11, color: T.textMuted }}>Webhook URLs untuk menerima donasi</div>
            </div>
          </div>
          <CopyField label="Saweria" value={`${baseUrl}/webhook/saweria/${user.webhook_token}`} />
          <CopyField label="Trakteer" value={`${baseUrl}/webhook/trakteer/${user.webhook_token}`} />
        </Card>

        <Card style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <span style={{
              width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
              background: T.successDim, fontSize: 14,
            }}>▶</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>OBS Overlay</div>
              <div style={{ fontSize: 11, color: T.textMuted }}>Browser Source untuk tampilkan donasi</div>
            </div>
          </div>
          <CopyField label="Overlay URL" value={`${baseUrl}/overlay?token=${user.overlay_token}`} />
          <div style={{ fontSize: 12, color: T.textDim, marginTop: 4, lineHeight: 1.5 }}>
            Buka OBS → Sources → <strong>+</strong> → Browser → paste URL di atas.
            Recommended: 800×600, custom CSS kosong.
          </div>
        </Card>
      </div>

      <div style={{ fontSize: 12, fontWeight: 600, color: T.textMuted, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>
        Recent Activity
      </div>

      {recentDonations.length === 0 ? (
        <div style={{ color: T.textMuted, fontSize: 13, padding: "18px 0", textAlign: "center" }}>
          No activity yet
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {recentDonations.map((d) => (
            <Card key={d.id} style={{ padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{
                width: 8, height: 8, borderRadius: "50%",
                background: providerColors[d.provider] || T.textMuted,
                flexShrink: 0,
              }} />
              <span style={{ fontSize: 13, fontWeight: 600, minWidth: 80, flexShrink: 0 }}>
                {d.donator_name}
              </span>
              <span style={{ fontSize: 13, color: T.accent, fontWeight: 600, minWidth: 60, flexShrink: 0 }}>
                Rp{Number(d.amount).toLocaleString("id-ID")}
              </span>
              <span style={{ fontSize: 12, color: T.textDim, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {d.message ? (d.message.length > 40 ? d.message.slice(0, 40) + "..." : d.message) : ""}
              </span>
              <span style={{ fontSize: 11, color: T.textMuted, flexShrink: 0, minWidth: 50, textAlign: "right" }}>
                {timeAgo(d.created_at)}
              </span>
              <Badge color={d.blocked ? "danger" : "success"}>
                {d.blocked ? "Blocked" : "Passed"}
              </Badge>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
