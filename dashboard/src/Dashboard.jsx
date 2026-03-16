import { useState, useEffect } from "react";
import T from "./lib/theme";
import { api } from "./lib/api";
import { Btn } from "./components/ui";
import PageOverview from "./pages/Overview";
import PagePlatforms from "./pages/Platforms";
import PageDonations from "./pages/Donations";
import PageFilter from "./pages/Filter";
import PageSandbox from "./pages/Sandbox";

const nav = [
  { id: "overview", label: "Overview", icon: "◉" },
  { id: "platforms", label: "Platforms", icon: "⟁" },
  { id: "donations", label: "Donations", icon: "◈" },
  { id: "filter", label: "Filter", icon: "⊘" },
  { id: "sandbox", label: "Sandbox", icon: "▷" },
];

export default function Dashboard({ user: init, onLogout }) {
  const [user, setUser] = useState(init);
  const [page, setPage] = useState("overview");
  const [stats, setStats] = useState({ total: 0, blocked: 0, passed: 0 });
  const baseUrl = window.location.origin;

  useEffect(() => {
    api("/api/me").then(d => {
      if (d.stats) setStats(d.stats);
      if (d.user) setUser(prev => ({ ...prev, ...d.user }));
    });
  }, [page]);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: T.bg, color: T.text }}>
      {/* Sidebar */}
      <div style={{
        width: 220, background: T.surface, borderRight: `1px solid ${T.border}`,
        padding: "24px 0", display: "flex", flexDirection: "column", flexShrink: 0,
      }}>
        <div style={{ padding: "0 20px", marginBottom: 36 }}>
          <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5 }}>
            Stream<span style={{ color: T.accent }}>Guard</span>
          </div>
          <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>Dashboard v0.2</div>
        </div>

        <nav style={{ flex: 1 }}>
          {nav.map(n => (
            <button key={n.id} onClick={() => setPage(n.id)} style={{
              display: "flex", alignItems: "center", gap: 10, width: "100%",
              padding: "11px 20px", border: "none", cursor: "pointer", fontFamily: "inherit",
              background: page === n.id ? T.accentDim : "transparent",
              color: page === n.id ? T.accent : T.textDim,
              borderLeft: `2px solid ${page === n.id ? T.accent : "transparent"}`,
              fontSize: 14, fontWeight: page === n.id ? 600 : 400,
              transition: "all 0.12s", textAlign: "left",
            }}>
              <span style={{ fontSize: 15, width: 18 }}>{n.icon}</span>
              {n.label}
            </button>
          ))}
        </nav>

        <div style={{ padding: "0 20px" }}>
          <div style={{
            padding: "10px 12px", borderRadius: 8, background: T.bg,
            marginBottom: 10, border: `1px solid ${T.border}`,
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{user.username || "Streamer"}</div>
            <div style={{ fontSize: 11, color: T.textMuted }}>{user.email}</div>
          </div>
          <Btn onClick={onLogout} v="ghost" style={{ width: "100%", fontSize: 13, padding: "8px" }}>
            Sign Out
          </Btn>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: 32, maxWidth: 960, overflowY: "auto" }}>
        {page === "overview" && <PageOverview user={user} stats={stats} baseUrl={baseUrl} />}
        {page === "platforms" && <PagePlatforms user={user} baseUrl={baseUrl} />}
        {page === "donations" && <PageDonations />}
        {page === "filter" && <PageFilter user={user} onUserUpdate={setUser} />}
        {page === "sandbox" && <PageSandbox user={user} />}
      </div>
    </div>
  );
}
