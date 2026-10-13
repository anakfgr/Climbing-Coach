export type PhaseId = "p1" | "p2a" | "p2b" | "p3";
export type DayType = "climb" | "gym" | "rest" | "test";
export type WarmKey = "climb" | "finger" | "gym" | "cool" | "mobility" | "express";
export type TimerKey = "max" | "heavy" | "maint" | "prep" | "fwarm" | "limit" | "r3" | "r5" | "r44";
export type Grade = "V2" | "V3" | "V4" | "V5" | "V6" | "V7" | "V8" | "V9";
export type Style = "dalle" | "reglettes" | "devers" | "compression" | "dynamique" | "board";

export interface Phase {
  id: PhaseId;
  short: string;
  name: string;
  weeks: number[];
  goal: string;
}

export interface HangSpec { sets: number; work: number; rest: number; grip: string; }

export interface Block {
  t: string;
  d?: string;
  items: string[];
  weeks?: number[];
  timer?: TimerKey;
  /** How the guided session runs this block. Defaults to a checklist. */
  kind?: "hang" | "attempts" | "list";
  hang?: HangSpec;
  /** Rest between attempts, seconds (attempts blocks). */
  rest?: number;
}

export interface Day {
  dow: number;
  type: DayType;
  title: string;
  dur: string;
  rpe?: string;
  warm?: WarmKey | null;
  cool?: boolean;
  gym?: "A" | "B";
  intro?: string;
  blocks?: Block[];
  weeks?: number[];
}

export interface ResolvedDay extends Day {
  week: number;
  phase: Phase;
  blocks: Block[];
  banners: string[];
}

export interface WarmProtocol {
  name: string;
  dur: string;
  steps: [string, string][];
  example?: string[];
  timer?: TimerKey;
}

export interface Exercise {
  id: string;
  name: string;
  rest: string;
  muscles: string;
  why: string;
  sets: Record<PhaseId, string | null>;
  how: string[];
  errors: string[];
  progress: string;
  /** Suggested first load for a 59 kg climber; startKg pre-fills the guided session. */
  start: string;
  startKg?: number;
  regress: string;
}

export interface TimerPreset { name: string; sets: number; work: number; rest: number; }

/* ---------- Stored state ---------- */

/** Every stored record carries `u` (last update, ms) so two devices can be merged record by record. */
export interface Rec { u: number; del?: boolean; }

export interface HangSet { load: number; ok: boolean; }
export interface GymSet { reps: string; load: string; done: boolean; }
export interface Attempt { climbId?: string; grade: Grade; result: "chute" | "crux" | "top"; at: number; }

export interface SessionLog extends Rec {
  key: string;
  at: number;
  rpe: number;
  note: string;
  mins?: number;
  hangs?: HangSet[];
  gym?: Record<string, GymSet[]>;
  attempts?: Attempt[];
}

export interface Climb extends Rec {
  id: string;
  name: string;
  grade: Grade;
  style: Style;
  color: string;
  status: "projet" | "enchaine";
  flash: boolean;
  attempts: number;
  sessions: number;
  created: number;
  sentAt?: number;
  notes: string;
}

export interface Profile extends Rec { start: string; weight: string; grade: Grade; }
export interface TestCell extends Rec { v: string; }
export interface ProteinDay extends Rec { items: [string, number][]; }

export interface AppState {
  v: 2;
  onboarded: boolean;
  profile: Profile;
  sessions: Record<string, SessionLog>;
  climbs: Record<string, Climb>;
  /** key = `${testId}:${week}` */
  tests: Record<string, TestCell>;
  protein: Record<string, ProteinDay>;
}
