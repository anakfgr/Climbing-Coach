import { useCallback, useEffect, useRef, useState } from "react";

/* ---------- Sound (unlocked by the first tap) ---------- */
let ctx: AudioContext | null = null;
export function unlockAudio() {
  try {
    if (!ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    void ctx.resume?.();
  } catch { /* no audio */ }
}
export function beep(freq = 880, dur = 0.12, vol = 0.25) {
  try {
    if (!ctx) return;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.value = freq;
    o.connect(g); g.connect(ctx.destination);
    g.gain.setValueAtTime(vol, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    o.start(); o.stop(ctx.currentTime + dur);
  } catch { /* ignore */ }
  try { navigator.vibrate?.(dur > 0.3 ? 250 : 60); } catch { /* ignore */ }
}
export const beepGo = () => beep(1200, 0.4, 0.3);
export const beepTick = () => beep(820, 0.1);
export const beepEnd = () => { beep(1000, 0.18); window.setTimeout(() => beep(1320, 0.4), 220); };

/* ---------- Keep the screen on during a session ---------- */
export function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    let lock: any = null;
    const get = async () => { try { lock = await (navigator as any).wakeLock?.request("screen"); } catch { /* refused */ } };
    void get();
    const onVis = () => { if (document.visibilityState === "visible") void get(); };
    document.addEventListener("visibilitychange", onVis);
    return () => { document.removeEventListener("visibilitychange", onVis); try { lock?.release(); } catch { /* ignore */ } };
  }, [active]);
}

/* ---------- Countdown ---------- */
export interface Countdown {
  left: number; total: number; running: boolean; active: boolean;
  start: (sec: number) => void; toggle: () => void; stop: () => void; add: (sec: number) => void;
}
/** Wall-clock countdown (survives the phone sleeping), with ticks on the last 3 s. */
export function useCountdown(onDone?: () => void, tick = true): Countdown {
  const [end, setEnd] = useState(0);
  const [paused, setPaused] = useState<number | null>(null);
  const [total, setTotal] = useState(0);
  const [, force] = useState(0);
  const lastTick = useRef(-1);
  const done = useRef(onDone);
  done.current = onDone;

  const running = end > 0 && paused === null;
  const left = paused !== null ? paused : end > 0 ? Math.max(0, (end - Date.now()) / 1000) : 0;

  useEffect(() => {
    if (!running) return;
    const iv = window.setInterval(() => {
      const l = (end - Date.now()) / 1000;
      const whole = Math.ceil(l);
      if (tick && whole <= 3 && whole > 0 && whole !== lastTick.current) { lastTick.current = whole; beepTick(); }
      if (l <= 0) { setEnd(0); lastTick.current = -1; done.current?.(); }
      else force((x) => x + 1);
    }, 150);
    return () => window.clearInterval(iv);
  }, [running, end, tick]);

  const start = useCallback((sec: number) => { unlockAudio(); lastTick.current = -1; setTotal(sec); setPaused(null); setEnd(Date.now() + sec * 1000); }, []);
  const stop = useCallback(() => { setEnd(0); setPaused(null); }, []);
  const toggle = useCallback(() => {
    unlockAudio();
    setPaused((p) => {
      if (p === null) return Math.max(0, (end - Date.now()) / 1000);
      setEnd(Date.now() + p * 1000);
      return null;
    });
  }, [end]);
  const add = useCallback((sec: number) => {
    setTotal((t) => t + sec);
    if (paused !== null) setPaused((p) => (p ?? 0) + sec);
    else setEnd((e) => (e ? e + sec * 1000 : e));
  }, [paused]);

  return { left, total, running, active: end > 0 || paused !== null, start, toggle, stop, add };
}
