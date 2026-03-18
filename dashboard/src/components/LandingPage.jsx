import T from "../lib/theme";
import { Badge, Card, Btn } from "./ui";

export default function LandingPage({ onGetStarted }) {
  return (
    <div style={{ background: T.bg, color: T.text, minHeight: "100vh" }}>
      <style>{`
        @media (max-width: 768px) {
          .sg-hero h1 { font-size: 32px !important; }
          .sg-hero p { font-size: 15px !important; }
          .sg-hero-btns { flex-direction: column !important; }
          .sg-grid-3 { grid-template-columns: 1fr !important; }
          .sg-grid-2 { grid-template-columns: 1fr !important; }
          .sg-section { padding: 40px 20px !important; }
          .sg-landing-nav { padding: 16px 20px !important; }
        }
      `}</style>

      <nav className="sg-landing-nav" style={{
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

      <section className="sg-section sg-hero" style={{
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
        <div className="sg-hero-btns" style={{ display: "flex", gap: 12, justifyContent: "center" }}>
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

      <section className="sg-section" style={{ padding: "60px 40px", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12, letterSpacing: -1 }}>Masalahnya</h2>
          <p style={{ color: T.textDim, fontSize: 16, maxWidth: 600, margin: "0 auto" }}>
            Promotor judi online memanfaatkan donasi sebagai media iklan murah di stream kamu
          </p>
        </div>
        <div className="sg-grid-3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
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

      <section className="sg-section" style={{ padding: "60px 40px", background: `linear-gradient(180deg, transparent 0%, ${T.accentDim} 50%, transparent 100%)` }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12, letterSpacing: -1 }}>Solusinya</h2>
            <p style={{ color: T.textDim, fontSize: 16, maxWidth: 600, margin: "0 auto" }}>
              StreamGuard pakai NLP untuk deteksi spam yang lolos filter biasa
            </p>
          </div>
          <div className="sg-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
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

      <section id="how-it-works" className="sg-section" style={{ padding: "60px 40px", maxWidth: 900, margin: "0 auto" }}>
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

      <section className="sg-section" style={{ padding: "60px 40px", maxWidth: 700, margin: "0 auto" }}>
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
                gap: 12,
              }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: T.text, marginBottom: 2, wordBreak: "break-word" }}>"{item.msg}"</div>
                  <div style={{ fontSize: 11, color: T.danger }}>{item.reason}</div>
                </div>
                <Badge color="danger">BLOCKED</Badge>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="sg-section" style={{ padding: "60px 40px", maxWidth: 700, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, letterSpacing: -1 }}>Harga</h2>
        </div>
        <div className="sg-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
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

      <section className="sg-section" style={{
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

      <footer className="sg-landing-nav" style={{
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
