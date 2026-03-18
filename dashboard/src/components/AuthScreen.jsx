import { useState, useEffect } from "react";
import T from "../lib/theme";
import { api } from "../lib/api";
import { useLang } from "../lib/i18n";
import { Card, Btn, TextInput, PasswordInput } from "./ui";

export default function AuthScreen({ onLogin, onBack }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const { t } = useLang();

  useEffect(() => { requestAnimationFrame(() => setShow(true)); }, []);

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
    } catch (e) {
      setError(e.message || "Connection failed");
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: `radial-gradient(ellipse at 25% 15%, ${T.accentDim} 0%, ${T.bg} 55%)`,
    }}>
      <div style={{
        width: 400, maxWidth: "90vw",
        opacity: show ? 1 : 0,
        transform: show ? "translateY(0) scale(1)" : "translateY(20px) scale(0.97)",
        transition: "all 0.5s cubic-bezier(0.16,1,0.3,1)",
      }}>
        <button onClick={onBack} style={{
          background: "none", border: "none", color: T.textDim, cursor: "pointer",
          fontSize: 13, fontFamily: "inherit", marginBottom: 20, display: "block",
          transition: "color 0.15s",
        }}>{t("auth.back")}</button>

        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 44, fontWeight: 800, letterSpacing: -2 }}>
            Stream<span style={{ color: T.accent }}>Guard</span>
          </div>
          <div style={{ color: T.textDim, marginTop: 8, fontSize: 15 }}>
            {t("auth.tagline")}
          </div>
        </div>

        <Card>
          <div style={{ display: "flex", marginBottom: 24, borderRadius: 8, overflow: "hidden", border: `1px solid ${T.border}` }}>
            {[["login", t("auth.login")], ["register", t("auth.register")]].map(([m, label]) => (
              <button key={m} onClick={() => { setMode(m); setError(""); }} style={{
                flex: 1, padding: "10px 0", border: "none", fontSize: 14, fontWeight: 600,
                background: mode === m ? T.accent : "transparent",
                color: mode === m ? T.bg : T.textDim,
                cursor: "pointer", fontFamily: "inherit",
                transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
              }}>{label}</button>
            ))}
          </div>

          <div style={{
            overflow: "hidden",
            maxHeight: mode === "register" ? 80 : 0,
            opacity: mode === "register" ? 1 : 0,
            transition: "max-height 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.25s",
          }}>
            <TextInput label={t("auth.username")} value={username} onChange={e => setUsername(e.target.value)} placeholder={t("auth.usernamePh")} />
          </div>
          <TextInput label={t("auth.email")} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={t("auth.emailPh")} />
          <PasswordInput label={t("auth.password")} value={password} onChange={e => setPassword(e.target.value)} placeholder={t("auth.passwordPh")}
            onKeyDown={e => e.key === "Enter" && submit()} />

          {error && (
            <div style={{
              color: T.danger, fontSize: 13, marginBottom: 12, padding: "8px 12px",
              background: T.dangerDim, borderRadius: 6,
              animation: "sg-fade-up 0.3s cubic-bezier(0.16,1,0.3,1)",
            }}>{error}</div>
          )}

          <Btn onClick={submit} disabled={loading} style={{ width: "100%", marginTop: 8 }}>
            {loading ? "..." : mode === "register" ? t("auth.createAccount") : t("auth.signIn")}
          </Btn>
        </Card>
      </div>
    </div>
  );
}
