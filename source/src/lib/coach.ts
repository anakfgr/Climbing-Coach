import type { AppState, Checkin, Exercise, Pain, PainArea, ResolvedDay } from "../types";
import { DELOAD } from "../data/program";
import { parseSets } from "../data/exercises";
import { dateOf, mondayOf, parseISO, toISO, today } from "./date";
import { liveSessions, update } from "./store";

/* ---------- Vocabulary ---------- */
export const PAIN_AREAS: { id: PainArea; label: string }[] = [
  { id: "doigt", label: "Doigt" }, { id: "coude", label: "Coude" }, { id: "epaule", label: "Épaule" },
  { id: "poignet", label: "Poignet" }, { id: "autre", label: "Autre" },
];
export const PAIN_LEVELS: Record<1 | 2 | 3, string> = { 1: "Gêne légère", 2: "Douleur", 3: "Douleur vive ou « pop »" };
export const CHECK_ROWS: { key: keyof Pick<Checkin, "sleep" | "fingers" | "energy">; label: string; opts: [string, string, string] }[] = [
  { key: "sleep", label: "Sommeil", opts: ["Bon", "Moyen", "Mauvais"] },
  { key: "fingers", label: "Doigts", opts: ["Frais", "Raides", "Douloureux"] },
  { key: "energy", label: "Énergie", opts: ["Haute", "Moyenne", "Basse"] },
];

export const activePains = (s: AppState): Pain[] => Object.values(s.pains ?? {}).filter((p) => !p.del && !p.resolvedAt).sort((a, b) => b.at - a.at);
export const todayCheckin = (s: AppState): Checkin | undefined => { const c = s.checkins?.[toISO(today())]; return c && !c.del ? c : undefined; };

export function readiness(c: Checkin): { level: 0 | 1 | 2; title: string; advice: string } {
  const score = c.sleep + c.fingers + c.energy;
  if (score >= 4 || c.fingers === 2) return { level: 2, title: "Journée de récupération", advice: "Remplace la séance par 20 min de mobilité et 30 min de grimpe très facile en main ouverte, ou prends un vrai repos. Ce n’est pas une séance perdue : c’est la séance qui t’évite la blessure." };
  if (score >= 2) return { level: 1, title: "Version allégée", advice: "Une série de suspensions en moins, 3 essais par bloc au lieu de 4 à 6, et vise un RPE d’un cran en dessous de la cible." };
  return { level: 0, title: "Feu vert", advice: "Séance comme prévue." };
}

/* ---------- How a day changes for pains, today's check-in and yesterday's run ---------- */
export interface Adapt { banners: string[]; tone: "warn" | "bad"; hangDelta: number; noHang: boolean; noBoard: boolean; noLimit: boolean; }

const PAIN_RULES: Record<PainArea, Record<1 | 2 | 3, { text: string; noHang?: boolean; noBoard?: boolean; noLimit?: boolean; hangDelta?: number }>> = {
  doigt: {
    1: { text: "Gêne au doigt : semi-arqué et main ouverte uniquement, jamais d’arqué. Suspensions avec une série en moins et 5 kg de moins. Pas de MoonBoard.", hangDelta: -1 },
    2: { text: "Douleur au doigt : pas de suspensions, pas de board, pas de bloc limite. Grimpe facile en main ouverte (V3 max) ou fais la mobilité.", noHang: true, noBoard: true, noLimit: true },
    3: { text: "Douleur vive ou « pop » au doigt : arrête la grimpe 1 à 2 semaines et consulte un kiné. Garde la salle sans grip (jambes, gainage) et la course.", noHang: true, noBoard: true, noLimit: true },
  },
  coude: {
    1: { text: "Gêne au coude : pas de board ni de campus. Garde les curls inversés et le marteau, tractions avec 20 % de charge en moins.", noBoard: true },
    2: { text: "Douleur au coude : pas de board, pas de campus, pas de bloc limite en dévers. Tractions remplacées par du tirage léger. Kiné si ça dure plus d’une semaine.", noBoard: true, noLimit: true },
    3: { text: "Douleur vive au coude : stop grimpe et tirage, consulte un kiné ou un médecin.", noHang: true, noBoard: true, noLimit: true },
  },
  epaule: {
    1: { text: "Gêne à l’épaule : évite gastons, inversées et jetés. Face pulls en plus, dips et développé à moitié charge." },
    2: { text: "Douleur à l’épaule : pas de dynamique, pas de dips ni de développé. Kiné si ça dure.", noLimit: true },
    3: { text: "Douleur vive à l’épaule : stop grimpe et poussées au-dessus de la tête, consulte un kiné ou un médecin.", noHang: true, noBoard: true, noLimit: true },
  },
  poignet: {
    1: { text: "Gêne au poignet : évite les pinces larges et les plats. Curls inversés très légers seulement." },
    2: { text: "Douleur au poignet : pas de suspensions ni de board, grimpe facile sur bonnes prises.", noHang: true, noBoard: true },
    3: { text: "Douleur vive au poignet : stop grimpe, consulte un kiné ou un médecin.", noHang: true, noBoard: true, noLimit: true },
  },
  autre: {
    1: { text: "Gêne signalée : si elle augmente pendant l’effort, arrête l’exercice." },
    2: { text: "Douleur signalée : retire tout ce qui la réveille, et garde le reste de la séance facile.", noLimit: true },
    3: { text: "Douleur vive signalée : pas d’entraînement dur, consulte un professionnel de santé.", noHang: true, noBoard: true, noLimit: true },
  },
};

export function adaptFor(s: AppState, day: ResolvedDay): Adapt {
  const a: Adapt = { banners: [], tone: "warn", hangDelta: 0, noHang: false, noBoard: false, noLimit: false };
  if (day.type === "rest") return a;
  for (const p of activePains(s)) {
    const r = PAIN_RULES[p.area][p.level];
    a.banners.push(r.text);
    a.noHang ||= !!r.noHang; a.noBoard ||= !!r.noBoard; a.noLimit ||= !!r.noLimit;
    a.hangDelta = Math.min(a.hangDelta, r.hangDelta ?? 0);
    if (p.level >= 2) a.tone = "bad";
  }
  const date = dateOf(s.profile.start, day.week, day.dow);
  const isToday = toISO(date) === toISO(today());
  const c = todayCheckin(s);
  if (isToday && c) {
    const r = readiness(c);
    if (r.level === 1) { a.banners.push(`Check du matin : ${r.title.toLowerCase()}. ${r.advice}`); a.hangDelta = Math.min(a.hangDelta, -1); }
    if (r.level === 2) { a.banners.push(`Check du matin : ${r.title.toLowerCase()}. ${r.advice}`); a.noHang = true; a.noBoard = true; a.noLimit = true; a.tone = "bad"; }
  }
  // A long run the day before a finger session costs some finger freshness.
  if (day.blocks.some((b) => b.kind === "hang")) {
    const eve = new Date(date); eve.setDate(eve.getDate() - 1);
    const long = Object.values(s.runs ?? {}).find((r) => !r.del && r.date === toISO(eve) && r.mins >= 60);
    if (long) a.banners.push(`Sortie longue la veille (${long.mins} min) : commence les suspensions 2,5 kg plus léger et remonte si les premières séries sont faciles.`);
  }
  return a;
}

/* ---------- Load suggestions from the last logged sessions ---------- */
export interface Suggestion { load: string; reason: string; }
const fmtKg = (n: number) => String(Math.round(n * 10) / 10).replace(".", ",");
const num = (x: string) => Number(String(x).replace(",", "."));

export function suggestHang(s: AppState, week: number): Suggestion | null {
  const last = liveSessions(s).filter((x) => x.hangs?.length).sort((a, b) => b.at - a.at)[0];
  if (!last?.hangs) return null;
  const loads = last.hangs.map((h) => h.load);
  const base = Math.max(...loads);
  const fails = last.hangs.filter((h) => !h.ok).length;
  if (DELOAD.includes(week)) return { load: fmtKg(base - 2.5), reason: `Semaine de décharge : 2,5 kg de moins que la dernière fois (${fmtKg(base)} kg).` };
  if (fails >= 2) return { load: fmtKg(base - 2.5), reason: `${fails} séries lâchées la dernière fois : 2,5 kg de moins.` };
  if (fails === 0 && last.rpe <= 8) return { load: fmtKg(base + 2.5), reason: `Toutes les séries tenues la dernière fois (RPE ${last.rpe}) : +2,5 kg.` };
  return { load: fmtKg(base), reason: "Même charge que la dernière fois : stabilise-la avant d’ajouter du poids." };
}

const INCREMENT: Record<string, number> = { rwc: 0.5, hammer: 0, ohp: 1, row: 2, bss: 2, cossack: 2.5 };
export function suggestGym(s: AppState, ex: Exercise, phase: string, week: number): Suggestion | null {
  const last = liveSessions(s).filter((x) => x.gym?.[ex.id]?.some((g) => g.done && g.load !== "")).sort((a, b) => b.at - a.at)[0];
  const sets = last?.gym?.[ex.id]?.filter((g) => g.done && g.load !== "");
  if (!last || !sets?.length) return null;
  const base = Math.max(...sets.map((g) => num(g.load) || 0));
  const target = Number(parseSets(ex.sets[phase as keyof typeof ex.sets]).reps.split("-")[0]) || 0;
  const hit = sets.every((g) => !target || (num(g.reps) || 0) >= target);
  const inc = INCREMENT[ex.id] ?? 2.5;
  if (DELOAD.includes(week)) return { load: fmtKg(base), reason: "Semaine de décharge : même charge, 2 séries." };
  if (hit && last.rpe <= 8 && inc > 0) return { load: fmtKg(base + inc), reason: `Toutes les reps faites la dernière fois (RPE ${last.rpe}) : +${fmtKg(inc)} kg.` };
  if (!hit) return { load: fmtKg(base), reason: "Reps manquées la dernière fois : même charge." };
  return { load: fmtKg(base), reason: "Même charge que la dernière fois." };
}

/* ---------- New cycle ---------- */
/** Restart at week 5 (Phase 2A) next Monday (or today if it is Monday), keeping all history. */
export function startNewCycle() {
  const t = today();
  const mon = mondayOf(t);
  if (toISO(mon) !== toISO(t)) mon.setDate(mon.getDate() + 7);
  const start = new Date(mon); start.setDate(start.getDate() - 28);
  update((d) => { d.profile = { ...d.profile, cycle: (d.profile.cycle ?? 1) + 1, firstWeek: 5, start: toISO(start), u: Date.now() }; });
  return toISO(mon);
}
export const cycleStartLabel = (s: AppState) => {
  const fw = s.profile.firstWeek ?? 1;
  const d = parseISO(s.profile.start); d.setDate(d.getDate() + (fw - 1) * 7);
  return d;
};
