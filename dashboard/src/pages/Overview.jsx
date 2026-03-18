import T from "../lib/theme";
import { Card, CopyField, Stat } from "../components/ui";

export default function PageOverview({ user, stats, baseUrl }) {
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
    </div>
  );
}
