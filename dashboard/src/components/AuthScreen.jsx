import { useState } from "react";
import T from "../lib/theme";
import { api } from "../lib/api";
import { Card, Btn, TextInput } from "./ui";

export default function AuthScreen({ onLogin, onBack }) {
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
