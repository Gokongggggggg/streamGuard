import { useState } from "react";
import T from "../lib/theme";
import { api } from "../lib/api";
import { Badge, Card, Btn, TextInput, Field, useToast } from "../components/ui";

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
  const toast = useToast();

  const send = async () => {
    if (!message.trim()) return;
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
  };

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Testing Sandbox</h2>
      <p style={{ color: T.textDim, marginBottom: 24, fontSize: 14 }}>
        Test the filter without real donations. See what gets blocked and what passes.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div>
          <Card>
            <div style={{ fontWeight: 600, marginBottom: 16 }}>Send Test Donation</div>
            <TextInput label="Donator" value={donator} onChange={e => setDonator(e.target.value)} />
            <TextInput label="Amount (Rp)" type="number" value={amount} onChange={e => setAmount(e.target.value)} />
            <Field label="Message">
              <textarea value={message} onChange={e => setMessage(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder="Type donation message to test..."
                rows={3}
                style={{
                  width: "100%", padding: "10px 14px", borderRadius: 8,
                  border: `1px solid ${T.border}`, background: T.bg, color: T.text,
                  fontSize: 14, fontFamily: "inherit", outline: "none",
                  resize: "vertical", boxSizing: "border-box",
                }} />
            </Field>
            <Btn onClick={send} style={{ width: "100%" }}>Send Test</Btn>
          </Card>

          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: T.textDim, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Presets</div>
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
              <div style={{ fontWeight: 600, fontSize: 14 }}>Overlay Preview</div>
              <Btn onClick={() => setShowPreview(!showPreview)} v="outline" style={{ fontSize: 11, padding: "4px 10px" }}>
                {showPreview ? "Hide" : "Show"}
              </Btn>
            </div>
            {showPreview ? (
              <div style={{
                width: "100%", height: 180, borderRadius: 8, overflow: "hidden",
                border: `1px solid ${T.border}`, background: "#000",
              }}>
                <iframe src={`/overlay?token=${user.overlay_token}`}
                  style={{ width: "100%", height: "100%", border: "none" }}
                  title="Overlay" />
              </div>
            ) : (
              <div style={{ color: T.textDim, fontSize: 13 }}>Click Show to preview your OBS overlay live</div>
            )}
          </Card>

          <Card>
            <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 14 }}>Results</div>
            {results.length === 0 ? (
              <div style={{ color: T.textDim, fontSize: 13, fontStyle: "italic" }}>Send a test to see results</div>
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
