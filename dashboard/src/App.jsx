import { useState, useEffect } from "react";
import T from "./lib/theme";
import { api } from "./lib/api";
import { ToastProvider, Spinner } from "./components/ui";
import { LangProvider, useLang } from "./lib/i18n";
import LandingPage from "./components/LandingPage";
import AuthScreen from "./components/AuthScreen";
import Dashboard from "./Dashboard";

function AppContent() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const { t } = useLang();

  useEffect(() => {
    const uid = sessionStorage.getItem("sg_uid");
    if (uid) {
      api("/api/me").then(d => {
        if (d.user) setUser(d.user);
        setChecking(false);
      }).catch(() => {
        sessionStorage.removeItem("sg_uid");
        setChecking(false);
      });
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
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: T.bg, color: T.textDim, gap: 12 }}>
      <Spinner size={28} />
      <span>{t("common.loading")}</span>
    </div>
  );

  if (user) return <Dashboard user={user} onLogout={logout} />;
  if (showAuth) return <AuthScreen onLogin={setUser} onBack={() => setShowAuth(false)} />;
  return <LandingPage onGetStarted={() => setShowAuth(true)} />;
}

export default function App() {
  return (
    <LangProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </LangProvider>
  );
}
