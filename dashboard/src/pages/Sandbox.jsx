import { useState } from "react";
import T from "../lib/theme";
import { api } from "../lib/api";
import { Badge, Card, Btn, TextInput, Field, useToast } from "../components/ui";
import { useLang } from "../lib/i18n";

const presets = [
  { label: "✅ Clean", msg: "Semangat bang! Keep up the content 🔥", c: "success" },
  { label: "🚫 Judol", msg: "slot gacor maxwin hari ini deposit 25rb", c: "danger" },
  { label: "🔤 Leet", msg: "sl0t g4c0r m4xw1n d3p0sit 25rb", c: "danger" },
  { label: "⬜ Spaced", msg: "s l o t  g a c o r  maxwin", c: "danger" },
  { label: "💰 Pinjol", msg: "pinjaman online cair cepat WA 081234567890", c: "danger" },
  { label: "🤔 Subtle", msg: "cobain deposit 50rb bonus 100% langsung cair", c: "warning" },
];

export default function PageSandbox({ user }) {
  const [donator, setDonator] = useState("TestViewer");
  const [message, setMessage] = useState("");
  const [amount, setAmount] = useState("10000");
  const [results, setResults] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [previewSize, setPreviewSize] = useState("md");
  const toast = useToast();
  const { t } = useLang();

  const sizeOpts = { sm: { h: 180, label: "S" }, md: { h: 320, label: "M" }, lg: { h: 500, label: "L" } };

  const send = async () => {
    if (!message.trim()) return;
    try {
      const d = await api(`/test/donation/${user.webhook_token}`, {
        method: "POST",
        body: { donator, message, amount: parseInt(amount) || 10000 },
      });
      setResults(prev => [{ ...d, message, donator, ts: Date.now() }, ...prev].slice(0, 20));
      toast(
        d.filterResult?.blocked ? `Blocked: ${d.filterResult.reason}` : "Passed — sent to overlay",
        d.filterResult?.blocked ? "error" : "success"
      );
      setMessage("");
    } catch {
      toast("Failed to send test donation", "error");
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>{t("sandbox.title")}</h2>
      <p style={{ color: T.textDim, marginBottom: 24, fontSize: 14 }}>
        {t("sandbox.desc")}
      </p>

      <style>{`@media (max-width: 900px) { .sg-sandbox-grid { grid-template-columns: 1fr !important; } }`}</style>
      <div className="sg-sandbox-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div>
          <Card>
            <div style={{ fontWeight: 600, marginBottom: 16 }}>{t("sandbox.sendTest")}</div>
            <TextInput label={t("sandbox.donator")} value={donator} onChange={e => setDonator(e.target.value)} />
            <TextInput label={t("sandbox.amount")} type="number" value={amount} onChange={e => setAmount(e.target.value)} />
            <Field label={t("sandbox.message")}>
              <textarea value={message} onChange={e => setMessage(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder={t("sandbox.msgPlaceholder")}
                rows={3}
                className="sg-input"
                style={{
                  width: "100%", padding: "10px 14px", borderRadius: 8,
                  border: `1px solid ${T.border}`, background: T.bg, color: T.text,
                  fontSize: 14, fontFamily: "inherit", outline: "none",
                  resize: "vertical", boxSizing: "border-box",
                  transition: "border-color 0.15s, box-shadow 0.15s",
                }} />
            </Field>
            <Btn onClick={send} style={{ width: "100%" }}>{t("sandbox.send")}</Btn>
          </Card>

          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: T.textDim, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>{t("sandbox.presets")}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {presets.map((p, i) => (
                <button key={i} onClick={() => setMessage(p.msg)} style={{
                  padding: "5px 10px", borderRadius: 6, border: `1px solid ${T[p.c]}33`,
                  background: `${T[p.c]}0a`, color: T[p.c],
                  fontSize: 12, cursor: "pointer", fontFamily: "inherit",
                }}>{p.label}</button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <Card style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{t("sandbox.overlayPreview")}</div>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                {showPreview && Object.entries(sizeOpts).map(([k, v]) => (
                  <button key={k} onClick={() => setPreviewSize(k)} style={{
                    padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                    border: `1px solid ${previewSize === k ? T.accent : T.border}`,
                    background: previewSize === k ? T.accentDim : "transparent",
                    color: previewSize === k ? T.accent : T.textMuted,
                    cursor: "pointer", fontFamily: "inherit",
                  }}>{v.label}</button>
                ))}
                <Btn onClick={() => setShowPreview(!showPreview)} v="outline" style={{ fontSize: 11, padding: "4px 10px" }}>
                  {showPreview ? t("common.hide") : t("common.show")}
                </Btn>
              </div>
            </div>
            {showPreview ? (
              <div style={{
                width: "100%", height: sizeOpts[previewSize].h, borderRadius: 8, overflow: "hidden",
                border: `1px solid ${T.border}`, background: "#000", transition: "height 0.2s ease",
                resize: "vertical", minHeight: 120, maxHeight: 700,
              }}>
                <iframe src={`/overlay?token=${user.overlay_token}`}
                  style={{ width: "100%", height: "100%", border: "none" }}
                  title="Overlay" />
              </div>
            ) : (
              <div style={{ color: T.textDim, fontSize: 13 }}>{t("sandbox.showOverlay")}</div>
            )}
          </Card>

          <Card>
            <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 14 }}>{t("sandbox.results")}</div>
            {results.length === 0 ? (
              <div style={{ color: T.textDim, fontSize: 13, fontStyle: "italic" }}>{t("sandbox.noResults")}</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 340, overflowY: "auto" }}>
                {results.map((r, i) => (
                  <div key={r.ts + i} style={{
                    padding: 12, borderRadius: 8, fontSize: 13,
                    background: r.filterResult?.blocked ? T.dangerDim : T.successDim,
                    border: `1px solid ${r.filterResult?.blocked ? T.danger : T.success}22`,
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontWeight: 600 }}>{r.donator}</span>
                      <Badge color={r.filterResult?.blocked ? "danger" : "success"}>
                        {r.filterResult?.blocked ? "BLOCKED" : "PASSED"}
                      </Badge>
                    </div>
                    <div style={{ color: T.textDim }}>"{r.message}"</div>
                    {r.filterResult?.blocked && (
                      <div style={{ color: T.danger, fontSize: 11, marginTop: 4 }}>
                        {r.filterResult.reason} • {r.filterResult.layer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
