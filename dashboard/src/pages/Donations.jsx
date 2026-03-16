import { useState, useEffect, useCallback } from "react";
import T from "../lib/theme";
import { api } from "../lib/api";
import { Badge, Card, Btn, LoadingState, useToast } from "../components/ui";

export default function PageDonations() {
  const [donations, setDonations] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);
  const toast = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    const ep = filter === "blocked" ? "/api/donations/blocked" : filter === "passed" ? "/api/donations/passed" : "/api/donations";
    const d = await api(ep);
    setDonations(d.donations || []);
    setLastRefresh(new Date());
    setLoading(false);
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  // Auto-refresh every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      api(filter === "blocked" ? "/api/donations/blocked" : filter === "passed" ? "/api/donations/passed" : "/api/donations")
        .then(d => {
          setDonations(d.donations || []);
          setLastRefresh(new Date());
        });
    }, 15000);
    return () => clearInterval(interval);
  }, [filter]);

  const approve = async (id) => {
    await api(`/api/donations/${id}/approve`, { method: "POST" });
    toast("Donation approved & sent to overlay", "success");
    load();
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>Donation History</h2>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {lastRefresh && (
            <span style={{ fontSize: 11, color: T.textMuted }}>
              Updated {lastRefresh.toLocaleTimeString("id-ID")}
            </span>
          )}
          <Btn onClick={load} v="ghost" style={{ fontSize: 13 }}>↻ Refresh</Btn>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {[["all", "All"], ["passed", "Passed"], ["blocked", "Blocked"]].map(([k, l]) => (
          <button key={k} onClick={() => setFilter(k)} style={{
            padding: "8px 16px", borderRadius: 8,
            border: `1px solid ${filter === k ? T.accent : T.border}`,
            background: filter === k ? T.accentDim : "transparent",
            color: filter === k ? T.accent : T.textDim,
            fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
          }}>{l}</button>
        ))}
      </div>

      {loading ? (
        <LoadingState message="Loading donations..." />
      ) : donations.length === 0 ? (
        <Card style={{ textAlign: "center", padding: 48 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>📭</div>
          <div style={{ color: T.textDim, fontSize: 15, marginBottom: 4 }}>No donations found</div>
          <div style={{ color: T.textMuted, fontSize: 13 }}>
            {filter === "all" ? "Donations will appear here when they come in" : `No ${filter} donations yet`}
          </div>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {donations.map(d => (
            <Card key={d.id} style={{ padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{d.donator_name}</span>
                    <span style={{ color: T.accent, fontWeight: 700, fontSize: 13 }}>Rp{Number(d.amount).toLocaleString("id-ID")}</span>
                    <Badge color={d.blocked ? "danger" : "success"}>{d.blocked ? "Blocked" : "Passed"}</Badge>
                    {d.manually_approved && <Badge color="warning">Approved</Badge>}
                  </div>
                  <div style={{ fontSize: 14, color: T.text, marginBottom: 4 }}>{d.message || "(no message)"}</div>
                  <div style={{ display: "flex", gap: 12, fontSize: 11, color: T.textMuted, flexWrap: "wrap" }}>
                    {d.filter_reason && <span>Reason: {d.filter_reason}</span>}
                    <span>{new Date(d.created_at).toLocaleString("id-ID")}</span>
                  </div>
                </div>
                {d.blocked && !d.manually_approved && (
                  <Btn onClick={() => approve(d.id)} v="outline" style={{ fontSize: 12, padding: "6px 12px", flexShrink: 0, marginLeft: 12 }}>
                    Approve
                  </Btn>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
