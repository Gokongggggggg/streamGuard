import T from "../lib/theme";
import { Card, CopyField, Stat } from "../components/ui";

export default function PageOverview({ user, stats, baseUrl }) {
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
        <Stat label="Blocked" value={stats.blocked} color={T.danger} />
      </div>

      <Card glow={T.accent + "33"}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Quick Setup</h3>
        <CopyField label="Webhook URL — paste di Saweria Integration" value={`${baseUrl}/webhook/saweria/${user.webhook_token}`} />
        <CopyField label="Webhook URL Trakteer — paste di Trakteer Integration → Webhook" value={`${baseUrl}/webhook/trakteer/${user.webhook_token}`} />
        <CopyField label="Overlay URL — paste di OBS Browser Source" value={`${baseUrl}/overlay?token=${user.overlay_token}`} />
      </Card>
    </div>
  );
}
