import { useState, useEffect, useCallback, useRef } from "react";
import T from "../lib/theme";
import { api } from "../lib/api";
import { Badge, Card, Btn, LoadingState, useToast } from "../components/ui";

const FILTERS = [["all", "All"], ["passed", "Passed"], ["blocked", "Blocked"]];
const PAGE_SIZE = 20;

export default function PageDonations() {
  const [donations, setDonations] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const toast = useToast();
  const intervalRef = useRef(null);

  const endpoint = filter === "blocked" ? "/api/donations/blocked"
    : filter === "passed" ? "/api/donations/passed"
    : "/api/donations";

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const d = await api(`${endpoint}?page=${page}&limit=${PAGE_SIZE}`);
      setDonations(d.donations || []);
      setTotalPages(d.totalPages || 1);
      setTotal(d.total || 0);
      setLastRefresh(new Date());
    } catch {
      if (!silent) toast("Failed to load donations", "error");
    }
    if (!silent) setLoading(false);
  }, [endpoint, page]);

  useEffect(() => { load(); }, [load]);

  // Auto-refresh every 15s (silent)
  useEffect(() => {
    intervalRef.current = setInterval(() => load(true), 15000);
    return () => clearInterval(intervalRef.current);
  }, [load]);

  // Reset page & selection when switching filter
  useEffect(() => {
    setPage(1);
    setSelected(new Set());
  }, [filter]);

  const approve = async (id) => {
    try {
      await api(`/api/donations/${id}/approve`, { method: "POST" });
      toast("Donation approved & sent to overlay", "success");
      load();
    } catch {
      toast("Failed to approve donation", "error");
    }
  };

  const bulkApprove = async () => {
    if (selected.size === 0) return;
    setBulkLoading(true);
    try {
      const d = await api("/api/donations/bulk-approve", { method: "POST", body: { ids: [...selected] } });
      toast(`${d.approved} donation(s) approved`, "success");
      setSelected(new Set());
      load();
    } catch {
      toast("Failed to bulk approve", "error");
    }
    setBulkLoading(false);
  };

  const exportCsv = () => {
    window.open("/api/donations/export", "_blank");
  };

  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAllBlocked = () => {
    const blockedIds = donations.filter(d => d.blocked && !d.manually_approved).map(d => d.id);
    setSelected(prev => {
      const allSelected = blockedIds.every(id => prev.has(id));
      if (allSelected) return new Set();
      return new Set(blockedIds);
    });
  };

  const blockedOnPage = donations.filter(d => d.blocked && !d.manually_approved);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Donation History</h2>
          <span style={{ fontSize: 12, color: T.textMuted }}>{total} total</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {lastRefresh && (
            <span style={{ fontSize: 11, color: T.textMuted }}>
              Updated {lastRefresh.toLocaleTimeString("id-ID")}
            </span>
          )}
          <Btn onClick={exportCsv} v="outline" style={{ fontSize: 12, padding: "7px 14px" }}>Export CSV</Btn>
          <Btn onClick={() => load()} v="ghost" style={{ fontSize: 13 }}>↻ Refresh</Btn>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {FILTERS.map(([k, l]) => (
          <button key={k} onClick={() => setFilter(k)} style={{
            padding: "8px 16px", borderRadius: 8,
            border: `1px solid ${filter === k ? T.accent : T.border}`,
            background: filter === k ? T.accentDim : "transparent",
            color: filter === k ? T.accent : T.textDim,
            fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
          }}>{l}</button>
        ))}
      </div>

      {/* Bulk actions bar */}
      {blockedOnPage.length > 0 && filter !== "passed" && (
        <div style={{
          display: "flex", alignItems: "center", gap: 12, marginBottom: 14,
          padding: "10px 16px", borderRadius: 8, background: T.surface, border: `1px solid ${T.border}`,
        }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: T.textDim, cursor: "pointer" }}>
            <input type="checkbox" checked={blockedOnPage.length > 0 && blockedOnPage.every(d => selected.has(d.id))}
              onChange={selectAllBlocked}
              style={{ accentColor: T.accent }} />
            Select all blocked ({blockedOnPage.length})
          </label>
          {selected.size > 0 && (
            <Btn onClick={bulkApprove} disabled={bulkLoading} v="outline" style={{ fontSize: 12, padding: "6px 14px" }}>
              {bulkLoading ? "Approving..." : `Approve ${selected.size} selected`}
            </Btn>
          )}
        </div>
      )}

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
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flex: 1, minWidth: 0 }}>
                  {d.blocked && !d.manually_approved && (
                    <input type="checkbox" checked={selected.has(d.id)}
                      onChange={() => toggleSelect(d.id)}
                      style={{ marginTop: 4, accentColor: T.accent }} />
                  )}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{
          display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 24,
        }}>
          <Btn onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
            v="ghost" style={{ fontSize: 13, padding: "8px 14px" }}>← Prev</Btn>
          <span style={{ fontSize: 13, color: T.textDim }}>
            Page {page} of {totalPages}
          </span>
          <Btn onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
            v="ghost" style={{ fontSize: 13, padding: "8px 14px" }}>Next →</Btn>
        </div>
      )}
    </div>
  );
}
