import { useState, useEffect, useCallback, useRef, createContext, useContext } from "react";
import T from "../lib/theme";

// ══════════════════════════════════════════
// GLOBAL STYLES & ANIMATIONS
// ══════════════════════════════════════════

const globalStyleId = "sg-global-styles";
if (typeof document !== "undefined" && !document.getElementById(globalStyleId)) {
  const style = document.createElement("style");
  style.id = globalStyleId;
  style.textContent = `
    @keyframes sg-spin { to { transform: rotate(360deg); } }
    @keyframes sg-toast-in {
      from { opacity: 0; transform: translateX(40px) scale(0.95); }
      to { opacity: 1; transform: translateX(0) scale(1); }
    }
    @keyframes sg-toast-out {
      from { opacity: 1; transform: translateX(0) scale(1); }
      to { opacity: 0; transform: translateX(40px) scale(0.95); }
    }
    @keyframes sg-fade-up {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes sg-fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes sg-scale-in {
      from { opacity: 0; transform: scale(0.92); }
      to { opacity: 1; transform: scale(1); }
    }
    @keyframes sg-slide-right {
      from { opacity: 0; transform: translateX(-16px); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes sg-pulse {
      0%, 100% { opacity: 0.4; }
      50% { opacity: 0.8; }
    }
    @keyframes sg-gradient-shift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    @keyframes sg-glow-pulse {
      0%, 100% { box-shadow: 0 0 20px rgba(34,211,238,0.05); }
      50% { box-shadow: 0 0 30px rgba(34,211,238,0.12); }
    }
    @keyframes sg-reveal {
      from { opacity: 0; transform: translateY(32px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes sg-badge-pop {
      0% { transform: scale(0.6); opacity: 0; }
      60% { transform: scale(1.1); }
      100% { transform: scale(1); opacity: 1; }
    }

    .sg-btn { transition: all 0.15s cubic-bezier(0.4,0,0.2,1) !important; }
    .sg-btn:hover:not(:disabled) { filter: brightness(1.15); transform: translateY(-1px); }
    .sg-btn:active:not(:disabled) { transform: translateY(0) scale(0.98); }
    .sg-btn-ghost:hover:not(:disabled) { background: ${T.surfaceHover} !important; }
    .sg-btn-outline:hover:not(:disabled) { background: ${T.accentDim} !important; }
    .sg-card { transition: all 0.25s cubic-bezier(0.4,0,0.2,1); }
    .sg-card:hover { border-color: ${T.border}aa; transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0,0,0,0.25), 0 0 40px rgba(34,211,238,0.04); }
    .sg-input:focus { border-color: ${T.accent} !important; box-shadow: 0 0 0 3px ${T.accentDim}; }
    .sg-input { transition: border-color 0.2s, box-shadow 0.2s !important; }
    .sg-nav-btn { transition: all 0.15s cubic-bezier(0.4,0,0.2,1) !important; }
    .sg-nav-btn:hover { background: ${T.surfaceHover} !important; }
    .sg-stagger { animation: sg-fade-up 0.5s cubic-bezier(0.16,1,0.3,1) both; }
  `;
  document.head.appendChild(style);
}

// ══════════════════════════════════════════
// ANIMATION HOOKS & WRAPPERS
// ══════════════════════════════════════════

/** Fade-up entrance for page content */
export function PageTransition({ children, pageKey }) {
  const [anim, setAnim] = useState(false);
  useEffect(() => {
    setAnim(false);
    const raf = requestAnimationFrame(() => setAnim(true));
    return () => cancelAnimationFrame(raf);
  }, [pageKey]);

  return (
    <div style={{
      opacity: anim ? 1 : 0,
      transform: anim ? "translateY(0)" : "translateY(12px)",
      transition: "opacity 0.35s cubic-bezier(0.16,1,0.3,1), transform 0.35s cubic-bezier(0.16,1,0.3,1)",
    }}>
      {children}
    </div>
  );
}

/** Stagger children entrance */
export function Stagger({ children, delay = 60 }) {
  const items = Array.isArray(children) ? children : [children];
  return items.map((child, i) => (
    <div key={child?.key || i} className="sg-stagger" style={{ animationDelay: `${i * delay}ms` }}>
      {child}
    </div>
  ));
}

/** Animate number counting up */
export function CountUp({ end, duration = 800, prefix = "", suffix = "" }) {
  const [value, setValue] = useState(0);
  const num = parseInt(end) || 0;
  const frameRef = useRef(null);

  useEffect(() => {
    if (num === 0) { setValue(0); return; }
    const start = performance.now();
    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * num));
      if (progress < 1) frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [num, duration]);

  return <>{prefix}{value}{suffix}</>;
}

/** Scroll-triggered reveal (for landing page) */
export function ScrollReveal({ children, delay = 0 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(32px)",
      transition: `opacity 0.6s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
    }}>
      {children}
    </div>
  );
}

// ══════════════════════════════════════════
// COMPONENTS
// ══════════════════════════════════════════

export function Badge({ children, color = "accent", animate = false }) {
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
      ...(animate ? { animation: "sg-badge-pop 0.3s cubic-bezier(0.34,1.56,0.64,1) both" } : {}),
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
        <Btn onClick={copy} v="outline" style={{
          flexShrink: 0, fontSize: 12, padding: "8px 14px",
          ...(copied ? { background: T.successDim, borderColor: T.success + "44", color: T.success } : {}),
        }}>
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
      <div style={{ fontSize: 32, fontWeight: 700, color, letterSpacing: -1 }}>
        <CountUp end={value} />
      </div>
      <div style={{ fontSize: 12, color: T.textDim, marginTop: 4, letterSpacing: 0.5, textTransform: "uppercase" }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

export function Toggle({ on, onToggle }) {
  return (
    <button onClick={onToggle} style={{
      width: 48, height: 26, borderRadius: 13, border: "none", cursor: "pointer",
      background: on ? T.accent : T.textMuted, position: "relative",
      transition: "background 0.3s cubic-bezier(0.4,0,0.2,1)",
      boxShadow: on ? `0 0 12px ${T.accent}44` : "none",
    }}>
      <div style={{
        width: 20, height: 20, borderRadius: 10, background: "#fff",
        position: "absolute", top: 3, left: on ? 25 : 3,
        transition: "left 0.3s cubic-bezier(0.34,1.56,0.64,1)",
        boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
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

/** Skeleton loading placeholder */
export function Skeleton({ width = "100%", height = 16, radius = 6, style: s }) {
  return (
    <div style={{
      width, height, borderRadius: radius,
      background: `linear-gradient(90deg, ${T.surface} 25%, ${T.surfaceHover} 50%, ${T.surface} 75%)`,
      backgroundSize: "200% 100%",
      animation: "sg-gradient-shift 1.5s ease infinite",
      ...s,
    }} />
  );
}

/** Skeleton card for loading states */
export function SkeletonCard() {
  return (
    <div style={{
      background: T.surface, border: `1px solid ${T.border}`,
      borderRadius: 12, padding: 24,
    }}>
      <Skeleton width="40%" height={14} style={{ marginBottom: 12 }} />
      <Skeleton width="80%" height={12} style={{ marginBottom: 8 }} />
      <Skeleton width="60%" height={12} />
    </div>
  );
}

export function LoadingState({ message = "Loading..." }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "24px 0" }}>
      {[1, 2, 3].map(i => (
        <SkeletonCard key={i} />
      ))}
      <div style={{ textAlign: "center", color: T.textMuted, fontSize: 13, marginTop: 8 }}>{message}</div>
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
        }} />
    </div>
  );
}

export function EmptyState({ icon = "📭", title, description, action, onAction }) {
  return (
    <Card style={{ textAlign: "center", padding: 48 }}>
      <div style={{ fontSize: 36, marginBottom: 8, animation: "sg-scale-in 0.4s cubic-bezier(0.16,1,0.3,1) both" }}>{icon}</div>
      <div style={{ color: T.textDim, fontSize: 15, marginBottom: 4 }}>{title}</div>
      {description && <div style={{ color: T.textMuted, fontSize: 13, marginBottom: action ? 16 : 0 }}>{description}</div>}
      {action && onAction && <Btn onClick={onAction} v="outline" style={{ fontSize: 13 }}>{action}</Btn>}
    </Card>
  );
}

// ══════════════════════════════════════════
// TOAST SYSTEM (with exit animation)
// ══════════════════════════════════════════

const ToastContext = createContext(null);

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, exiting: false }]);
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 300);
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
              boxShadow: `0 4px 20px rgba(0,0,0,0.3), 0 0 15px ${colors.border}15`,
              animation: t.exiting ? "sg-toast-out 0.3s cubic-bezier(0.4,0,1,1) forwards" : "sg-toast-in 0.4s cubic-bezier(0.16,1,0.3,1)",
              minWidth: 200, maxWidth: 360,
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <span style={{ fontSize: 15 }}>
                {t.type === "success" ? "✓" : t.type === "error" ? "✕" : "ℹ"}
              </span>
              {t.message}
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
