import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { fmtTime } from "../lib/date";
import type { Countdown } from "../lib/feedback";

/** Static program copy contains <b> tags; it is ours, never user input. */
export const Html = ({ s, as: Tag = "span" }: { s: string; as?: any }) => <Tag dangerouslySetInnerHTML={{ __html: s }} />;

const paths: Record<string, string> = {
  today: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4",
  plan: "M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM3 9h18M8 2v4M16 2v4",
  projects: "M3 20l6-11 4 6 3-4 5 9zM9 9l1-2",
  library: "M4 4h6v16H4zM14 4l5 1-3 15-5-1z",
  food: "M3 11h18a9 9 0 0 1-18 0zM8 7c0-2 2-2 2-4M13 7c0-2 2-2 2-4",
  track: "M3 20h18M6 16l4-5 3 3 5-7",
  gear: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z",
  play: "M7 4l13 8-13 8z",
  check: "M5 12l5 5 9-11",
  x: "M6 6l12 12M18 6L6 18",
  plus: "M12 5v14M5 12h14",
  left: "M15 5l-7 7 7 7",
  right: "M9 5l7 7-7 7",
  timer: "M12 8v5l3 2M9 2h6M12 22a8 8 0 1 0 0-16 8 8 0 0 0 0 16z",
  cloud: "M7 18h10a4 4 0 0 0 .5-8A6 6 0 0 0 6 9a4.5 4.5 0 0 0 1 9z",
  flame: "M12 3c1 3 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5 0 2 1 3 2 3-1-3 0-6 1-8.5z",
  dumbbell: "M6 7v10M18 7v10M3 10v4M21 10v4M6 12h12",
  hand: "M8 13V5a1.5 1.5 0 0 1 3 0v6M11 11V4a1.5 1.5 0 0 1 3 0v7M14 11V5a1.5 1.5 0 0 1 3 0v8a7 7 0 0 1-7 7h-1a6 6 0 0 1-5-3l-2.5-4a1.5 1.5 0 0 1 2.5-1.6L8 15",
};
export const Icon = ({ name, size }: { name: keyof typeof paths | string; size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={size ? { verticalAlign: "-2px" } : undefined}><path d={paths[name] ?? ""} /></svg>
);

export function Sheet({ open, onClose, children, label }: { open: boolean; onClose: () => void; children: ReactNode; label: string }) {
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", k);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", k); document.body.style.overflow = prev; };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="sheet-bg" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label={label}>
        <div className="grab" />
        {children}
      </div>
    </div>
  );
}

export function Fold({ title, right, children, open }: { title: ReactNode; right?: ReactNode; children: ReactNode; open?: boolean }) {
  return (
    <details className="fold" open={open}>
      <summary><span>{title}</span>{right}</summary>
      <div className="inner">{children}</div>
    </details>
  );
}

/** Circular countdown display. */
export function Ring({ cd, size = 200, label, color = "var(--accent)" }: { cd: Countdown; size?: number; label?: string; color?: string }) {
  const r = 44, c = 2 * Math.PI * r;
  const frac = cd.total ? cd.left / cd.total : 0;
  return (
    <div className="ring" style={{ width: size, maxWidth: "100%" }}>
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--line)" strokeWidth="6" />
        <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - frac)} style={{ transition: "stroke-dashoffset .2s linear" }} />
      </svg>
      <div className="c">
        {label && <span className="lbl muted">{label}</span>}
        <span className="t" style={{ fontSize: size * 0.3 }}>{fmtTime(cd.left)}</span>
      </div>
    </div>
  );
}

/** Rest timer block with ring and controls, used across the guided session. */
export function RestTimer({ cd, seconds, label = "Repos" }: { cd: Countdown; seconds: number; label?: string }) {
  if (!cd.active) {
    return (
      <button className="btn full" type="button" onClick={() => cd.start(seconds)}>
        <Icon name="timer" /> Lancer le repos · {fmtTime(seconds)}
      </button>
    );
  }
  return (
    <div className="card stack" style={{ justifyItems: "center" }}>
      <Ring cd={cd} size={170} label={label} />
      <div className="row">
        <button className="btn sm" type="button" onClick={cd.toggle}>{cd.running ? "Pause" : "Reprendre"}</button>
        <button className="btn sm" type="button" onClick={() => cd.add(30)}>+30 s</button>
        <button className="btn sm" type="button" onClick={cd.stop}>Passer</button>
      </div>
    </div>
  );
}

/* ---------- Toast ---------- */
const ToastCtx = createContext<(msg: string) => void>(() => {});
export const useToast = () => useContext(ToastCtx);
export function ToastProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState<string | null>(null);
  const show = useCallback((m: string) => { setMsg(m); window.setTimeout(() => setMsg((x) => (x === m ? null : x)), 2600); }, []);
  return (
    <ToastCtx.Provider value={show}>
      {children}
      {msg && <div className="toast" role="status">{msg}</div>}
    </ToastCtx.Provider>
  );
}
