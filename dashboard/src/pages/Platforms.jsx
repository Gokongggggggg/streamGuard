import T from "../lib/theme";
import { Badge, Card, CopyField } from "../components/ui";
import { useLang } from "../lib/i18n";

const platforms = [
  { id: "saweria", name: "Saweria", status: "active", color: "#F7A41C", desc: "Indonesia's #1 donation platform", icon: "S" },
  { id: "trakteer", name: "Trakteer", status: "active", color: "#E91E63", desc: "Dukung kreator favoritmu", icon: "T" },
  { id: "sociabuzz", name: "Sociabuzz", status: "coming", color: "#7C3AED", desc: "Monetize your social presence", icon: "S" },
  { id: "streamlabs", name: "Streamlabs", status: "coming", color: "#80F5D2", desc: "Global streaming toolkit", icon: "S" },
];

export default function PagePlatforms({ user, baseUrl }) {
  const { t } = useLang();

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>{t("platforms.title")}</h2>
      <p style={{ color: T.textDim, marginBottom: 24, fontSize: 14 }}>{t("platforms.desc")}</p>

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
                {p.status === "active" ? t("platforms.active") : t("platforms.soon")}
              </Badge>
            </div>
          </Card>
        ))}
      </div>

      <Card glow="#E91E6333" style={{ marginTop: 16, marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: "#E91E63" }}>{t("platforms.trakteerGuide")}</h3>
        <CopyField label="1. Webhook URL" value={`${baseUrl}/webhook/trakteer/${user.webhook_token}`} />
        <CopyField label="2. Overlay URL" value={`${baseUrl}/overlay?token=${user.overlay_token}`} />

        <div style={{
          padding: 16, borderRadius: 8, background: "rgba(233,30,99,0.06)",
          border: "1px solid rgba(233,30,99,0.15)", marginTop: 16,
        }}>
          <div style={{ fontSize: 13, color: "#E91E63", fontWeight: 600, marginBottom: 10 }}>{t("platforms.steps")}</div>
          <div style={{ fontSize: 13, color: T.textDim, lineHeight: 2 }}>
            1. Buka <b style={{ color: T.text }}>trakteer.id</b> → Login<br />
            2. Buka <b style={{ color: T.text }}>Integrasi</b> → <b style={{ color: T.text }}>Webhook</b><br />
            3. Paste <b style={{ color: T.text }}>Webhook URL</b> di atas → Simpan<br />
            4. Klik <b style={{ color: T.text }}>Send Webhook Test</b> untuk verifikasi<br />
            5. Aktifkan toggle webhook
          </div>
        </div>
      </Card>

      <Card glow="#F7A41C33">
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: "#F7A41C" }}>
          {t("platforms.saweriaGuide")}
        </h3>

        <CopyField label="1. Webhook URL" value={`${baseUrl}/webhook/saweria/${user.webhook_token}`} />
        <CopyField label="2. Overlay URL" value={`${baseUrl}/overlay?token=${user.overlay_token}`} />

        <div style={{
          padding: 16, borderRadius: 8, background: "rgba(247,164,28,0.06)",
          border: "1px solid rgba(247,164,28,0.15)", marginTop: 16,
        }}>
          <div style={{ fontSize: 13, color: "#F7A41C", fontWeight: 600, marginBottom: 10 }}>{t("platforms.stepByStep")}</div>
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
