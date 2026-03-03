import { useState, useEffect, useCallback } from "react";

// ══════════════════════════════════════════
// THEME
// ══════════════════════════════════════════
const T = {
  bg: "#0a0e17",
  surface: "#111827",
  surfaceHover: "#1a2332",
  border: "#1e2d3d",
  accent: "#22d3ee",
  accentDim: "rgba(34,211,238,0.1)",
  danger: "#ef4444",
  dangerDim: "rgba(239,68,68,0.1)",
  success: "#10b981",
  successDim: "rgba(16,185,129,0.1)",
  warning: "#f59e0b",
  warningDim: "rgba(245,158,11,0.1)",
  text: "#e2e8f0",
  textDim: "#64748b",
  textMuted: "#475569",
};

// ══════════════════════════════════════════
// API HELPER
// ══════════════════════════════════════════
async function api(path, opts = {}) {
  const userId = sessionStorage.getItem("sg_uid");
  const res = await fetch(path, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(userId ? { "x-user-id": userId } : {}),
      ...opts.headers,
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  return res.json();
}

// ══════════════════════════════════════════
// SMALL COMPONENTS
// ══════════════════════════════════════════

function Badge({ children, color = "accent" }) {
  const c = {
    accent: { bg: T.accentDim, fg: T.accent },
    danger: { bg: T.dangerDim, fg: T.danger },
    success: { bg: T.successDim, fg: T.success },
    warning: { bg: T.warningDim, fg: T.warning },
  }[color];
  return (
    <span style={{
      padding: "2px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600,
      background: c.bg, color: c.fg, border: `1px solid ${c.fg}22`,
      letterSpacing: 0.3,
    }}>{children}</span>
  );
}

function Card({ children, style, glow }) {
  return (
    <div style={{
      background: T.surface, border: `1px solid ${glow || T.border}`,
      borderRadius: 12, padding: 24,
      ...(glow ? { boxShadow: `0 0 20px ${glow}15` } : {}),
      ...style,
    }}>{children}</div>
  );
}

function Btn({ children, onClick, v = "primary", disabled, style }) {
  const vars = {
    primary: { bg: T.accent, fg: T.bg },
    danger: { bg: T.danger, fg: "#fff" },
    ghost: { bg: "transparent", fg: T.textDim },
    outline: { bg: "transparent", fg: T.accent },
  };
  const s = vars[v];
  return (
    <button disabled={disabled} onClick={onClick} style={{
      padding: "10px 20px", borderRadius: 8,
      border: v === "outline" ? `1px solid ${T.accent}44` : "none",
      background: disabled ? T.textMuted : s.bg, color: disabled ? T.textDim : s.fg,
      fontWeight: 600, fontSize: 14, cursor: disabled ? "not-allowed" : "pointer",
      transition: "all 0.15s", fontFamily: "inherit", ...style,
    }}>{children}</button>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={{ display: "block", marginBottom: 6, fontSize: 13, color: T.textDim, fontWeight: 500 }}>{label}</label>}
      {children}
    </div>
  );
}

function TextInput({ label, ...props }) {
  return (
    <Field label={label}>
      <input {...props} style={{
        width: "100%", padding: "10px 14px", borderRadius: 8,
        border: `1px solid ${T.border}`, background: T.bg, color: T.text,
        fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box",
        ...props.style,
      }} />
    </Field>
  );
}

function CopyField({ label, value }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Field label={label}>
      <div style={{ display: "flex", gap: 8 }}>
        <div style={{
          flex: 1, padding: "10px 14px", borderRadius: 8, border: `1px solid ${T.border}`,
          background: T.bg, color: T.accent, fontSize: 12, fontFamily: "'DM Mono', monospace",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>{value}</div>
        <Btn onClick={copy} v="outline" style={{ flexShrink: 0, fontSize: 12, padding: "8px 14px" }}>
          {copied ? "✓" : "Copy"}
        </Btn>
      </div>
    </Field>
  );
}

function Stat({ label, value, color = T.accent }) {
  return (
    <div style={{
      padding: 20, borderRadius: 10, border: `1px solid ${T.border}`,
      background: T.surface, textAlign: "center", flex: 1, minWidth: 0,
    }}>
      <div style={{ fontSize: 32, fontWeight: 700, color, letterSpacing: -1 }}>{value}</div>
      <div style={{ fontSize: 12, color: T.textDim, marginTop: 4, letterSpacing: 0.5, textTransform: "uppercase" }}>{label}</div>
    </div>
  );
}

function Toggle({ on, onToggle }) {
  return (
    <button onClick={onToggle} style={{
      width: 48, height: 26, borderRadius: 13, border: "none", cursor: "pointer",
      background: on ? T.accent : T.textMuted, position: "relative", transition: "background 0.2s",
    }}>
      <div style={{
        width: 20, height: 20, borderRadius: 10, background: "#fff",
        position: "absolute", top: 3, left: on ? 25 : 3,
        transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
      }} />
    </button>
  );
}

// ══════════════════════════════════════════
// LANDING PAGE
// ══════════════════════════════════════════

function LandingPage({ onGetStarted }) {
  return (
    <div style={{ background: T.bg, color: T.text, minHeight: "100vh" }}>
      <nav style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "20px 40px", maxWidth: 1100, margin: "0 auto",
      }}>
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -1 }}>
          Stream<span style={{ color: T.accent }}>Guard</span>
        </div>
        <Btn onClick={onGetStarted} v="outline" style={{ padding: "8px 20px", fontSize: 13 }}>
          Masuk
        </Btn>
      </nav>

      <section style={{
        textAlign: "center", padding: "80px 40px 60px",
        maxWidth: 800, margin: "0 auto",
        background: `radial-gradient(ellipse at 50% 0%, ${T.accentDim} 0%, transparent 60%)`,
      }}>
        <div style={{
          display: "inline-block", padding: "6px 16px", borderRadius: 999,
          background: T.accentDim, border: `1px solid ${T.accent}22`,
          fontSize: 13, color: T.accent, fontWeight: 500, marginBottom: 24,
        }}>
          Gratis untuk streamer Indonesia
        </div>
        <h1 style={{ fontSize: 52, fontWeight: 800, lineHeight: 1.1, letterSpacing: -2, marginBottom: 20 }}>
          Stop spam judol<br />di donasi stream kamu
        </h1>
        <p style={{ fontSize: 18, color: T.textDim, lineHeight: 1.6, maxWidth: 560, margin: "0 auto 36px" }}>
          StreamGuard otomatis filter pesan donasi dari promosi judi online, pinjol ilegal, dan spam lainnya. Viewer kamu tetap bisa donasi lewat Saweria seperti biasa.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <Btn onClick={onGetStarted} style={{ padding: "14px 32px", fontSize: 16, borderRadius: 10 }}>
            Mulai Gratis
          </Btn>
          <Btn v="outline" onClick={() => {
            document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
          }} style={{ padding: "14px 32px", fontSize: 16, borderRadius: 10 }}>
            Gimana Caranya?
          </Btn>
        </div>
      </section>

      <section style={{ padding: "60px 40px", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12, letterSpacing: -1 }}>Masalahnya</h2>
          <p style={{ color: T.textDim, fontSize: 16, maxWidth: 600, margin: "0 auto" }}>
            Promotor judi online memanfaatkan donasi sebagai media iklan murah di stream kamu
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          {[
            { icon: "💸", title: "Donasi = Iklan Judol", desc: "Cukup Rp5.000, pesan promosi judi langsung muncul di layar stream kamu dan ditonton ribuan viewer." },
            { icon: "🔤", title: "Filter Bawaan Mudah Dibypass", desc: "Spammer pakai trik seperti sl0t g4c0r, s.l.o.t, atau karakter khusus untuk lolos dari filter kata sederhana." },
            { icon: "⚠️", title: "Reputasi Streamer Rusak", desc: "Viewer melihat iklan judi di stream kamu. Ini bisa merusak image dan bahkan melanggar aturan platform." },
          ].map((item, i) => (
            <Card key={i} style={{ textAlign: "center", padding: 28 }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>{item.icon}</div>
              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 8 }}>{item.title}</div>
              <div style={{ fontSize: 13, color: T.textDim, lineHeight: 1.6 }}>{item.desc}</div>
            </Card>
          ))}
        </div>
      </section>

      <section style={{ padding: "60px 40px", background: `linear-gradient(180deg, transparent 0%, ${T.accentDim} 50%, transparent 100%)` }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12, letterSpacing: -1 }}>Solusinya</h2>
            <p style={{ color: T.textDim, fontSize: 16, maxWidth: 600, margin: "0 auto" }}>
              StreamGuard pakai NLP untuk deteksi spam yang lolos filter biasa
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[
              { icon: "🧠", title: "Filter NLP Berlapis", desc: "Normalisasi teks, keyword matching, regex pattern, dan klasifikasi ML." },
              { icon: "⚡", title: "Real-time < 500ms", desc: "Donasi difilter dan diteruskan ke OBS dalam hitungan milidetik." },
              { icon: "🔧", title: "Zero Setup Hassle", desc: "Tetap pakai Saweria seperti biasa. Cuma perlu paste 2 URL." },
              { icon: "📊", title: "Dashboard Lengkap", desc: "Monitor donasi yang di-block, approve false positive, dan lihat statistik." },
            ].map((item, i) => (
              <Card key={i} glow={T.accent + "22"} style={{ padding: 28 }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{item.icon}</div>
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 8 }}>{item.title}</div>
                <div style={{ fontSize: 13, color: T.textDim, lineHeight: 1.6 }}>{item.desc}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" style={{ padding: "60px 40px", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12, letterSpacing: -1 }}>Cara Kerja</h2>
          <p style={{ color: T.textDim, fontSize: 16 }}>Setup 5 menit, proteksi selamanya</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {[
            { step: "01", title: "Daftar Akun", desc: "Buat akun gratis di StreamGuard. Kamu langsung dapat webhook URL dan overlay URL yang unik." },
            { step: "02", title: "Pasang Webhook di Saweria", desc: "Buka Saweria → Integration → Webhook → Nyalakan → Paste webhook URL → Simpan." },
            { step: "03", title: "Ganti Overlay di OBS", desc: "Di OBS, ganti URL Browser Source donasi kamu dengan overlay URL StreamGuard." },
            { step: "04", title: "Stream Dengan Tenang", desc: "StreamGuard otomatis filter setiap donasi. Yang bersih muncul, yang judol di-block." },
          ].map((item, i) => (
            <div key={i} style={{
              display: "flex", gap: 24, padding: "28px 0",
              borderBottom: i < 3 ? `1px solid ${T.border}` : "none",
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                background: T.accentDim, border: `1px solid ${T.accent}33`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 800, fontSize: 18, color: T.accent,
              }}>{item.step}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 6 }}>{item.title}</div>
                <div style={{ fontSize: 14, color: T.textDim, lineHeight: 1.6 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: "60px 40px", maxWidth: 700, margin: "0 auto" }}>
        <Card glow={T.danger + "33"} style={{ padding: 32 }}>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Contoh Filter</h3>
            <p style={{ color: T.textDim, fontSize: 14 }}>Pesan donasi seperti ini akan otomatis di-block</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { msg: "slot gacor maxwin hari ini deposit 25rb", reason: "Keyword: slot" },
              { msg: "sl0t g4c0r m4xw1n d3p0sit 25rb", reason: "Leetspeak decoded → slot" },
              { msg: "s l o t  g a c o r  maxwin link: judol.com", reason: "Pattern: spaced text + domain" },
              { msg: "pinjaman online cair cepat WA 081234567890", reason: "Keyword: pinjaman online" },
            ].map((item, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "12px 16px", borderRadius: 8,
                background: T.dangerDim, border: `1px solid ${T.danger}22`,
              }}>
                <div>
                  <div style={{ fontSize: 13, color: T.text, marginBottom: 2 }}>"{item.msg}"</div>
                  <div style={{ fontSize: 11, color: T.danger }}>{item.reason}</div>
                </div>
                <Badge color="danger">BLOCKED</Badge>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section style={{ padding: "60px 40px", maxWidth: 700, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, letterSpacing: -1 }}>Harga</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Card style={{ padding: 28, textAlign: "center" }}>
            <div style={{ fontSize: 13, color: T.textDim, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Free</div>
            <div style={{ fontSize: 36, fontWeight: 800, marginBottom: 4 }}>Rp0</div>
            <div style={{ fontSize: 13, color: T.textDim, marginBottom: 20 }}>selamanya</div>
            <div style={{ fontSize: 13, color: T.textDim, lineHeight: 2, textAlign: "left" }}>
              ✓ Filter NLP judol & pinjol<br />✓ 1 platform (Saweria)<br />✓ Dashboard + statistik<br />✓ Custom blocklist (10 kata)
            </div>
          </Card>
          <Card glow={T.accent + "33"} style={{ padding: 28, textAlign: "center" }}>
            <div style={{ fontSize: 13, color: T.accent, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Pro</div>
            <div style={{ fontSize: 36, fontWeight: 800, color: T.accent, marginBottom: 4 }}>Soon</div>
            <div style={{ fontSize: 13, color: T.textDim, marginBottom: 20 }}>coming soon</div>
            <div style={{ fontSize: 13, color: T.textDim, lineHeight: 2, textAlign: "left" }}>
              ✓ Semua fitur Free<br />✓ Multi-platform support<br />✓ ML classification model<br />✓ Unlimited custom blocklist<br />✓ Priority support
            </div>
          </Card>
        </div>
      </section>

      <section style={{
        padding: "80px 40px", textAlign: "center",
        background: `radial-gradient(ellipse at 50% 100%, ${T.accentDim} 0%, transparent 60%)`,
      }}>
        <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16, letterSpacing: -1 }}>Siap lindungi stream kamu?</h2>
        <p style={{ color: T.textDim, fontSize: 16, marginBottom: 32, maxWidth: 500, margin: "0 auto 32px" }}>
          Daftar gratis sekarang. Setup 5 menit, tanpa ribet.
        </p>
        <Btn onClick={onGetStarted} style={{ padding: "16px 40px", fontSize: 17, borderRadius: 12 }}>
          Daftar Gratis Sekarang
        </Btn>
      </section>

      <footer style={{
        padding: "24px 40px", borderTop: `1px solid ${T.border}`,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        maxWidth: 1100, margin: "0 auto",
      }}>
        <div style={{ fontSize: 14, fontWeight: 700 }}>Stream<span style={{ color: T.accent }}>Guard</span></div>
        <div style={{ fontSize: 12, color: T.textMuted }}>© 2026 StreamGuard</div>
      </footer>
    </div>
  );
}

// ══════════════════════════════════════════
// AUTH SCREEN
// ══════════════════════════════════════════

function AuthScreen({ onLogin , onBack}) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError(""); setLoading(true);
    try {
      const isReg = mode === "register";
      const data = await api(isReg ? "/api/auth/register" : "/api/auth/login", {
        method: "POST",
        body: isReg ? { email, password, username } : { email, password },
      });
      if (data.error) { setError(data.error); setLoading(false); return; }
      sessionStorage.setItem("sg_uid", data.user.id);
      onLogin(data.user);
    } catch { setError("Connection failed"); }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: `radial-gradient(ellipse at 25% 15%, ${T.accentDim} 0%, ${T.bg} 55%)`,
    }}>
      <div style={{ width: 400 }}>

        <button onClick={onBack} style={{
  background: "none", border: "none", color: T.textDim, cursor: "pointer",
  fontSize: 13, fontFamily: "inherit", marginBottom: 20, display: "block",
}}>← Kembali ke beranda</button>

        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 44, fontWeight: 800, letterSpacing: -2 }}>
            Stream<span style={{ color: T.accent }}>Guard</span>
          </div>
          <div style={{ color: T.textDim, marginTop: 8, fontSize: 15 }}>
            Protect your stream from gambling spam
          </div>
        </div>

        <Card>
          <div style={{ display: "flex", marginBottom: 24, borderRadius: 8, overflow: "hidden", border: `1px solid ${T.border}` }}>
            {["login", "register"].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(""); }} style={{
                flex: 1, padding: "10px 0", border: "none", fontSize: 14, fontWeight: 600,
                background: mode === m ? T.accent : "transparent",
                color: mode === m ? T.bg : T.textDim,
                cursor: "pointer", fontFamily: "inherit", textTransform: "capitalize",
              }}>{m}</button>
            ))}
          </div>

          {mode === "register" && (
            <TextInput label="Username" value={username} onChange={e => setUsername(e.target.value)} placeholder="Your stream name" />
          )}
          <TextInput label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="streamer@example.com" />
          <TextInput label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters"
            onKeyDown={e => e.key === "Enter" && submit()} />

          {error && <div style={{ color: T.danger, fontSize: 13, marginBottom: 12, padding: "8px 12px", background: T.dangerDim, borderRadius: 6 }}>{error}</div>}

          <Btn onClick={submit} disabled={loading} style={{ width: "100%", marginTop: 8 }}>
            {loading ? "..." : mode === "register" ? "Create Account" : "Sign In"}
          </Btn>
        </Card>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════
// PAGE: OVERVIEW
// ══════════════════════════════════════════

function PageOverview({ user, stats, baseUrl }) {
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

// ══════════════════════════════════════════
// PAGE: PLATFORMS
// ══════════════════════════════════════════

function PagePlatforms({ user, baseUrl }) {
  const platforms = [
    { id: "saweria", name: "Saweria", status: "active", color: "#F7A41C", desc: "Indonesia's #1 donation platform", icon: "S" },
    { id: "trakteer", name: "Trakteer", status: "active", color: "#E91E63", desc: "Dukung kreator favoritmu", icon: "T" },
    { id: "sociabuzz", name: "Sociabuzz", status: "coming", color: "#7C3AED", desc: "Monetize your social presence", icon: "S" },
    { id: "streamlabs", name: "Streamlabs", status: "coming", color: "#80F5D2", desc: "Global streaming toolkit", icon: "S" },
  ];

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Platform Integration</h2>
      <p style={{ color: T.textDim, marginBottom: 24, fontSize: 14 }}>Connect your donation platform to enable spam filtering</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 28 }}>
        {platforms.map(p => (
          <Card key={p.id} glow={p.status === "active" ? p.color + "33" : undefined}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10, background: `${p.color}1a`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 800, color: p.color, fontSize: 18,
              }}>{p.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: T.textDim }}>{p.desc}</div>
              </div>
              <Badge color={p.status === "active" ? "success" : "warning"}>
                {p.status === "active" ? "Active" : "Soon"}
              </Badge>
            </div>
          </Card>
        ))}
      </div>

      <Card glow="#E91E6333" style={{ marginTop: 16 }}>
  <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: "#E91E63" }}>Panduan Setup Trakteer</h3>
  <CopyField label="1. Webhook URL" value={`${baseUrl}/webhook/trakteer/${user.webhook_token}`} />
  <CopyField label="2. Overlay URL (sama seperti Saweria)" value={`${baseUrl}/overlay?token=${user.overlay_token}`} />

  <div style={{
    padding: 16, borderRadius: 8, background: "rgba(233,30,99,0.06)",
    border: "1px solid rgba(233,30,99,0.15)", marginTop: 16,
  }}>
    <div style={{ fontSize: 13, color: "#E91E63", fontWeight: 600, marginBottom: 10 }}>Langkah-langkah</div>
    <div style={{ fontSize: 13, color: T.textDim, lineHeight: 2 }}>
      1. Buka <b style={{ color: T.text }}>trakteer.id</b> → Login<br />
      2. Buka <b style={{ color: T.text }}>Integrasi</b> → <b style={{ color: T.text }}>Webhook</b><br />
      3. Paste <b style={{ color: T.text }}>Webhook URL</b> di atas → Simpan<br />
      4. Klik <b style={{ color: T.text }}>Send Webhook Test</b> untuk verifikasi<br />
      5. Aktifkan toggle webhook
    </div>
  </div>
</Card>

      <Card glow={`#F7A41C33`}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: "#F7A41C" }}>
          Saweria Setup Guide
        </h3>

        <CopyField label="1. Webhook URL" value={`${baseUrl}/webhook/saweria/${user.webhook_token}`} />
        <CopyField label="2. Overlay URL" value={`${baseUrl}/overlay?token=${user.overlay_token}`} />

        <div style={{
          padding: 16, borderRadius: 8, background: "rgba(247,164,28,0.06)",
          border: "1px solid rgba(247,164,28,0.15)", marginTop: 16,
        }}>
          <div style={{ fontSize: 13, color: "#F7A41C", fontWeight: 600, marginBottom: 10 }}>Step by step</div>
          <div style={{ fontSize: 13, color: T.textDim, lineHeight: 2 }}>
            1. Buka <b style={{ color: T.text }}>saweria.co/admin/integrations</b><br />
            2. Klik <b style={{ color: T.text }}>Webhook</b> → Toggle <b style={{ color: T.text }}>Nyalakan</b><br />
            3. Paste <b style={{ color: T.text }}>Webhook URL</b> di atas → <b style={{ color: T.text }}>Simpan</b><br />
            4. Di OBS, tambah <b style={{ color: T.text }}>Browser Source</b> → Paste <b style={{ color: T.text }}>Overlay URL</b><br />
            5. Test dengan <b style={{ color: T.text }}>Munculkan Notifikasi</b> di Saweria
          </div>
        </div>
      </Card>
    </div>
  );
}

// ══════════════════════════════════════════
// PAGE: DONATIONS
// ══════════════════════════════════════════

function PageDonations() {
  const [donations, setDonations] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const ep = filter === "blocked" ? "/api/donations/blocked" : filter === "passed" ? "/api/donations/passed" : "/api/donations";
    const d = await api(ep);
    setDonations(d.donations || []);
    setLoading(false);
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const approve = async (id) => {
    await api(`/api/donations/${id}/approve`, { method: "POST" });
    load();
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>Donation History</h2>
        <Btn onClick={load} v="ghost" style={{ fontSize: 13 }}>↻ Refresh</Btn>
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
        <div style={{ textAlign: "center", padding: 40, color: T.textDim }}>Loading...</div>
      ) : donations.length === 0 ? (
        <Card style={{ textAlign: "center", padding: 48 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>📭</div>
          <div style={{ color: T.textDim }}>No donations found</div>
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

// ══════════════════════════════════════════
// PAGE: FILTER SETTINGS
// ══════════════════════════════════════════

function PageFilter({ user, onUserUpdate }) {
  const [words, setWords] = useState([]);
  const [newWord, setNewWord] = useState("");
  const [filterOn, setFilterOn] = useState(user.filter_enabled);

  useEffect(() => {
    api("/api/blocklist").then(d => setWords(d.words || []));
  }, []);

  const toggle = async () => {
    const d = await api("/api/settings/filter", { method: "POST", body: { enabled: !filterOn } });
    setFilterOn(d.filter_enabled);
    onUserUpdate({ ...user, filter_enabled: d.filter_enabled });
  };

  const add = async () => {
    if (!newWord.trim()) return;
    const d = await api("/api/blocklist", { method: "POST", body: { word: newWord.trim() } });
    setWords(d.words || []);
    setNewWord("");
  };

  const remove = async (w) => {
    const d = await api(`/api/blocklist/${encodeURIComponent(w)}`, { method: "DELETE" });
    setWords(d.words || []);
  };

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Filter Settings</h2>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>NLP Judol Filter</div>
            <div style={{ fontSize: 13, color: T.textDim }}>
              {filterOn ? "Active — gambling spam is being filtered" : "Disabled — all donations pass through"}
            </div>
          </div>
          <Toggle on={filterOn} onToggle={toggle} />
        </div>
      </Card>

      <Card>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>Custom Blocklist</div>
        <div style={{ fontSize: 13, color: T.textDim, marginBottom: 16 }}>
          Block additional words beyond the built-in judol filter
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <input value={newWord} onChange={e => setNewWord(e.target.value)}
            onKeyDown={e => e.key === "Enter" && add()}
            placeholder="Add word to block..."
            style={{
              flex: 1, padding: "10px 14px", borderRadius: 8, border: `1px solid ${T.border}`,
              background: T.bg, color: T.text, fontSize: 14, fontFamily: "inherit", outline: "none",
            }} />
          <Btn onClick={add}>Add</Btn>
        </div>

        {words.length === 0 ? (
          <div style={{ color: T.textDim, fontSize: 13, fontStyle: "italic" }}>No custom words added</div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {words.map(w => (
              <span key={w} style={{
                padding: "6px 12px", borderRadius: 999, fontSize: 13, fontWeight: 500,
                background: T.dangerDim, color: T.danger, border: `1px solid ${T.danger}22`,
                display: "inline-flex", alignItems: "center", gap: 8,
              }}>
                {w}
                <span onClick={() => remove(w)} style={{ cursor: "pointer", fontWeight: 700, opacity: 0.6 }}>×</span>
              </span>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

// ══════════════════════════════════════════
// PAGE: SANDBOX
// ══════════════════════════════════════════

function PageSandbox({ user }) {
  const [donator, setDonator] = useState("TestViewer");
  const [message, setMessage] = useState("");
  const [amount, setAmount] = useState("10000");
  const [results, setResults] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  const send = async () => {
    if (!message.trim()) return;
    const d = await api(`/test/donation/${user.webhook_token}`, {
      method: "POST",
      body: { donator, message, amount: parseInt(amount) || 10000 },
    });
    setResults(prev => [{ ...d, message, donator, ts: Date.now() }, ...prev].slice(0, 20));
    setMessage("");
  };

  const presets = [
    { label: "✅ Clean", msg: "Semangat bang! Keep up the content 🔥", c: "success" },
    { label: "🚫 Judol", msg: "slot gacor maxwin hari ini deposit 25rb", c: "danger" },
    { label: "🔤 Leet", msg: "sl0t g4c0r m4xw1n d3p0sit 25rb", c: "danger" },
    { label: "⬜ Spaced", msg: "s l o t  g a c o r  maxwin", c: "danger" },
    { label: "💰 Pinjol", msg: "pinjaman online cair cepat WA 081234567890", c: "danger" },
    { label: "🤔 Subtle", msg: "cobain deposit 50rb bonus 100% langsung cair", c: "warning" },
  ];

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

// ══════════════════════════════════════════
// DASHBOARD SHELL
// ══════════════════════════════════════════

function Dashboard({ user: init, onLogout }) {
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

  const nav = [
    { id: "overview", label: "Overview", icon: "◉" },
    { id: "platforms", label: "Platforms", icon: "⟁" },
    { id: "donations", label: "Donations", icon: "◈" },
    { id: "filter", label: "Filter", icon: "⊘" },
    { id: "sandbox", label: "Sandbox", icon: "▷" },
  ];

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

// ══════════════════════════════════════════
// APP ROOT
// ══════════════════════════════════════════

export default function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    const uid = sessionStorage.getItem("sg_uid");
    if (uid) {
      api("/api/me").then(d => {
        if (d.user) setUser(d.user);
        setChecking(false);
      }).catch(() => setChecking(false));
    } else {
      setChecking(false);
    }
  }, []);

  const logout = () => {
    sessionStorage.removeItem("sg_uid");
    setUser(null);
    setShowAuth(false);
  };

  if (checking) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: T.bg, color: T.textDim }}>
      Memuat...
    </div>
  );

  if (user) return <Dashboard user={user} onLogout={logout} />;
  if (showAuth) return <AuthScreen onLogin={setUser} onBack={() => setShowAuth(false)} />;
  return <LandingPage onGetStarted={() => setShowAuth(true)} />;
}
