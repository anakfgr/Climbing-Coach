import { useSyncExternalStore } from "react";
import type { AppState, Climb, Grade, Rec, SessionLog } from "../types";
import { mondayOf, setCycle, toISO, today } from "./date";

const KEY = "projetV8.v2";
const V1_KEY = "projetV8.state";

export const now = () => Date.now();
export const uid = () => now().toString(36) + Math.random().toString(36).slice(2, 7);

export function blankState(): AppState {
  return {
    v: 2,
    onboarded: false,
    profile: { start: toISO(mondayOf(today())), weight: "59", grade: "V4", u: 0 },
    sessions: {},
    climbs: {},
    tests: {},
    protein: {},
    pains: {},
    checkins: {},
    runs: {},
  };
}

/** Bring a v1 save (single-file app) into the v2 shape so nothing logged so far is lost. */
function migrateV1(raw: any): AppState {
  const s = blankState();
  const t = now();
  if (raw.start) s.profile.start = raw.start;
  if (raw.tests?.bw?.[0]) s.profile.weight = String(raw.tests.bw[0]);
  if (raw.tests?.send?.[0]) s.profile.grade = raw.tests.send[0] as Grade;
  s.profile.u = t;
  for (const [k, v] of Object.entries<any>(raw.done ?? {})) {
    s.sessions[k] = { key: k, at: v.at ?? t, rpe: v.rpe ?? 7, note: v.note ?? "", u: v.at ?? t };
  }
  for (const [id, byWeek] of Object.entries<any>(raw.tests ?? {})) {
    for (const [w, v] of Object.entries<any>(byWeek)) if (v !== "" && v != null) s.tests[`${id}:${w}`] = { v: String(v), u: t };
  }
  for (const [d, items] of Object.entries<any>(raw.protein ?? {})) s.protein[d] = { items, u: t };
  s.onboarded = true;
  return s;
}

function load(): AppState {
  try {
    const v2 = localStorage.getItem(KEY);
    if (v2) {
      const parsed = JSON.parse(v2);
      if (parsed?.v === 2) { const b = blankState(); return { ...b, ...parsed, pains: parsed.pains ?? {}, checkins: parsed.checkins ?? {}, runs: parsed.runs ?? {} }; }
    }
    const v1 = localStorage.getItem(V1_KEY);
    if (v1) {
      const parsed = JSON.parse(v1);
      if (parsed?.v === 1) return migrateV1(parsed);
    }
  } catch { /* storage blocked or corrupt: start fresh */ }
  return blankState();
}

let state: AppState = load();
setCycle(state.profile.cycle ?? 1);
const listeners = new Set<() => void>();
let onLocalChange: (() => void) | null = null;

function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* quota or private mode */ }
}
function emit() { listeners.forEach((l) => l()); }

export const getState = () => state;
export const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };
export const useAppState = () => useSyncExternalStore(subscribe, getState);

/** Mutate a copy of the state. Remember to stamp `u` on every record you touch. */
export function update(fn: (draft: AppState) => void) {
  const draft = structuredClone(state);
  fn(draft);
  state = draft;
  setCycle(state.profile.cycle ?? 1);
  persist();
  emit();
  onLocalChange?.();
}

/** Replace state without triggering an upload (used after a merge from the server). */
export function setStateQuiet(next: AppState) {
  state = next;
  setCycle(state.profile.cycle ?? 1);
  persist();
  emit();
}
export const setOnLocalChange = (fn: (() => void) | null) => { onLocalChange = fn; };

/* ---------- Merge: newest record wins, key by key ---------- */
function mergeMap<T extends Rec>(a: Record<string, T> = {}, b: Record<string, T> = {}) {
  const out: Record<string, T> = { ...a };
  for (const [k, v] of Object.entries(b)) if (!out[k] || (v.u ?? 0) > (out[k].u ?? 0)) out[k] = v;
  return out;
}
export function mergeStates(a: AppState, b: Partial<AppState>): AppState {
  return {
    v: 2,
    onboarded: a.onboarded || !!b.onboarded,
    profile: b.profile && (b.profile.u ?? 0) > (a.profile.u ?? 0) ? b.profile : a.profile,
    sessions: mergeMap(a.sessions, b.sessions),
    climbs: mergeMap(a.climbs, b.climbs),
    tests: mergeMap(a.tests, b.tests),
    protein: mergeMap(a.protein, b.protein),
    pains: mergeMap(a.pains, b.pains),
    checkins: mergeMap(a.checkins, b.checkins),
    runs: mergeMap(a.runs, b.runs),
  };
}

/* ---------- Selectors ---------- */
export const liveSession = (s: AppState, key: string): SessionLog | undefined => {
  const x = s.sessions[key];
  return x && !x.del ? x : undefined;
};
export const liveSessions = (s: AppState) => Object.values(s.sessions).filter((x) => !x.del);
export const liveClimbs = (s: AppState): Climb[] => Object.values(s.climbs).filter((c) => !c.del);
export const testValue = (s: AppState, id: string, week: number) => {
  const c = s.tests[`${id}:${week}`];
  return c && !c.del ? c.v : "";
};
export function currentGrade(s: AppState): Grade {
  const order = ["V2", "V3", "V4", "V5", "V6", "V7", "V8", "V9"];
  let best = s.profile.grade;
  for (const c of liveClimbs(s)) if (c.status === "enchaine" && order.indexOf(c.grade) > order.indexOf(best)) best = c.grade;
  for (const w of [0, 4, 8, 12, 16]) {
    const v = testValue(s, "send", w) as Grade;
    if (v && order.indexOf(v) > order.indexOf(best)) best = v;
  }
  return best;
}

/** Last load used for a hang or gym exercise, newest session first. */
export function lastLoad(s: AppState, what: "hang" | string): string {
  const sessions = liveSessions(s).sort((a, b) => b.at - a.at);
  for (const x of sessions) {
    if (what === "hang" && x.hangs?.length) {
      const ok = x.hangs.filter((h) => h.ok);
      return String((ok.length ? ok : x.hangs)[0].load);
    }
    const sets = x.gym?.[what];
    if (sets?.length) {
      const done = sets.filter((g) => g.done && g.load !== "");
      if (done.length) return done[0].load;
    }
  }
  return "";
}

/** Plain-text backup for moving data between devices without an account. */
export const exportBackup = () => JSON.stringify(state);
export function importBackup(text: string): boolean {
  try {
    const parsed = JSON.parse(text.trim());
    if (parsed?.v === 2) { update((d) => Object.assign(d, mergeStates(d, parsed))); return true; }
    if (parsed?.v === 1) { update((d) => Object.assign(d, mergeStates(d, migrateV1(parsed)))); return true; }
  } catch { /* fall through */ }
  return false;
}
