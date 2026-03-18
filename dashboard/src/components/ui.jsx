import { useState, useEffect, useCallback, createContext, useContext } from "react";
import T from "../lib/theme";

// ══════════════════════════════════════════
// GLOBAL HOVER & FOCUS STYLES
// ══════════════════════════════════════════

const globalStyleId = "sg-global-styles";
if (typeof document !== "undefined" && !document.getElementById(globalStyleId)) {
  const style = document.createElement("style");
  style.id = globalStyleId;
  style.textContent = `
    @keyframes sg-spin { to { transform: rotate(360deg); } }
    @keyframes sg-toast-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .sg-btn { transition: all 0.15s !important; }
    .sg-btn:hover:not(:disabled) { filter: brightness(1.15); transform: translateY(-1px); }
    .sg-btn:active:not(:disabled) { transform: translateY(0); }
    .sg-btn-ghost:hover:not(:disabled) { background: ${T.surfaceHover} !important; }
    .sg-btn-outline:hover:not(:disabled) { background: ${T.accentDim} !important; }
    .sg-card { transition: border-color 0.15s, box-shadow 0.15s; }
    .sg-card:hover { border-color: ${T.border}88; }
    .sg-input:focus { border-color: ${T.accent} !important; box-shadow: 0 0 0 2px ${T.accentDim}; }
    .sg-nav-btn { transition: all 0.12s !important; }
    .sg-nav-btn:hover { background: ${T.surfaceHover} !important; }
  `;
  document.head.appendChild(style);
}

// ══════════════════════════════════════════
// COMPONENTS
// ══════════════════════════════════════════

export function Badge({ children, color = "accent" }) {
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

export function Card({ children, style, glow }) {
  return (
    <div className="sg-card" style={{
      background: T.surface, border: `1px solid ${glow || T.border}`,
      borderRadius: 12, padding: 24,
      ...(glow ? { boxShadow: `0 0 20px ${glow}15` } : {}),
      ...style,
    }}>{children}</div>
  );
}

export function Btn({ children, onClick, v = "primary", disabled, style }) {
  const vars = {
    primary: { bg: T.accent, fg: T.bg },
    danger: { bg: T.danger, fg: "#fff" },
    ghost: { bg: "transparent", fg: T.textDim },
    outline: { bg: "transparent", fg: T.accent },
  };
  const s = vars[v];
  const className = `sg-btn ${v === "ghost" ? "sg-btn-ghost" : v === "outline" ? "sg-btn-outline" : ""}`;
  return (
    <button disabled={disabled} onClick={onClick} className={className} style={{
      padding: "10px 20px", borderRadius: 8,
      border: v === "outline" ? `1px solid ${T.accent}44` : "none",
      background: disabled ? T.textMuted : s.bg, color: disabled ? T.textDim : s.fg,
      fontWeight: 600, fontSize: 14, cursor: disabled ? "not-allowed" : "pointer",
      fontFamily: "inherit", ...style,
    }}>{children}</button>
  );
}

export function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={{ display: "block", marginBottom: 6, fontSize: 13, color: T.textDim, fontWeight: 500 }}>{label}</label>}
      {children}
    </div>
  );
}

export function TextInput({ label, ...props }) {
  return (
    <Field label={label}>
      <input {...props} className={`sg-input ${props.className || ""}`} style={{
        width: "100%", padding: "10px 14px", borderRadius: 8,
        border: `1px solid ${T.border}`, background: T.bg, color: T.text,
        fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box",
        transition: "border-color 0.15s, box-shadow 0.15s",
        ...props.style,
      }} />
    </Field>
  );
}

export function PasswordInput({ label, ...props }) {
  const [show, setShow] = useState(false);
  return (
    <Field label={label}>
      <div style={{ position: "relative" }}>
        <input {...props} type={show ? "text" : "password"} className={`sg-input ${props.className || ""}`} style={{
          width: "100%", padding: "10px 14px", paddingRight: 44, borderRadius: 8,
          border: `1px solid ${T.border}`, background: T.bg, color: T.text,
          fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box",
          transition: "border-color 0.15s, box-shadow 0.15s",
          ...props.style,
        }} />
        <button type="button" onClick={() => setShow(!show)} style={{
          position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
          background: "none", border: "none", color: T.textMuted, cursor: "pointer",
          fontSize: 13, fontFamily: "inherit", padding: "4px 6px",
        }}>{show ? "Hide" : "Show"}</button>
      </div>
    </Field>
  );
}

export function CopyField({ label, value }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Field label={label}>
      <div style={{ display: "flex", gap: 8, minWidth: 0 }}>
        <div style={{
          flex: 1, minWidth: 0, padding: "10px 14px", borderRadius: 8, border: `1px solid ${T.border}`,
          background: T.bg, color: T.accent, fontSize: 12, fontFamily: "'DM Mono', monospace",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>{value}</div>
        <Btn onClick={copy} v="outline" style={{ flexShrink: 0, fontSize: 12, padding: "8px 14px" }}>
          {copied ? "✓ Copied" : "Copy"}
        </Btn>
      </div>
    </Field>
  );
}

export function Stat({ label, value, color = T.accent, sub }) {
  return (
    <div style={{
      padding: 20, borderRadius: 10, border: `1px solid ${T.border}`,
      background: T.surface, textAlign: "center", flex: 1, minWidth: 0,
    }}>
      <div style={{ fontSize: 32, fontWeight: 700, color, letterSpacing: -1 }}>{value}</div>
      <div style={{ fontSize: 12, color: T.textDim, marginTop: 4, letterSpacing: 0.5, textTransform: "uppercase" }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

export function Toggle({ on, onToggle }) {
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

export function Spinner({ size = 20, color = T.accent }) {
  return (
    <div style={{
      width: size, height: size, border: `2px solid ${T.border}`,
      borderTop: `2px solid ${color}`, borderRadius: "50%",
      animation: "sg-spin 0.6s linear infinite", display: "inline-block",
    }} />
  );
}

export function LoadingState({ message = "Loading..." }) {
  return (
    <div style={{ textAlign: "center", padding: 48, color: T.textDim }}>
      <Spinner size={28} />
      <div style={{ marginTop: 12, fontSize: 14 }}>{message}</div>
    </div>
  );
}

export function SearchInput({ value, onChange, placeholder = "Search..." }) {
  return (
    <div style={{ position: "relative" }}>
      <span style={{
        position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
        color: T.textMuted, fontSize: 14, pointerEvents: "none",
      }}>&#x2315;</span>
      <input value={value} onChange={onChange} placeholder={placeholder}
        className="sg-input"
        style={{
          width: "100%", padding: "9px 14px 9px 32px", borderRadius: 8,
          border: `1px solid ${T.border}`, background: T.bg, color: T.text,
          fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box",
          transition: "border-color 0.15s, box-shadow 0.15s",
        }} />
    </div>
  );
}

export function EmptyState({ icon = "📭", title, description, action, onAction }) {
  return (
    <Card style={{ textAlign: "center", padding: 48 }}>
      <div style={{ fontSize: 36, marginBottom: 8 }}>{icon}</div>
      <div style={{ color: T.textDim, fontSize: 15, marginBottom: 4 }}>{title}</div>
      {description && <div style={{ color: T.textMuted, fontSize: 13, marginBottom: action ? 16 : 0 }}>{description}</div>}
      {action && onAction && <Btn onClick={onAction} v="outline" style={{ fontSize: 13 }}>{action}</Btn>}
    </Card>
  );
}

// ══════════════════════════════════════════
// TOAST SYSTEM
// ══════════════════════════════════════════

const ToastContext = createContext(null);

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div style={{
        position: "fixed", bottom: 24, right: 24, zIndex: 9999,
        display: "flex", flexDirection: "column", gap: 8,
      }}>
        {toasts.map(t => {
          const colors = {
            success: { bg: T.successDim, border: T.success, text: T.success },
            error: { bg: T.dangerDim, border: T.danger, text: T.danger },
            info: { bg: T.accentDim, border: T.accent, text: T.accent },
          }[t.type];
          return (
            <div key={t.id} style={{
              padding: "12px 20px", borderRadius: 10,
              background: colors.bg, border: `1px solid ${colors.border}33`,
              color: colors.text, fontSize: 13, fontWeight: 500,
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
              animation: "sg-toast-in 0.3s ease-out",
              minWidth: 200, maxWidth: 360,
            }}>
              {t.message}
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
