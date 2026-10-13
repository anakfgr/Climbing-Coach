import { useEffect, useMemo, useRef, useState } from "react";
import { TIMERS, WARM, coolKey, getDay } from "../data/program";
import { GYM_A, GYM_B, parseRest, parseSets } from "../data/exercises";
import { GRADES, STYLES } from "../data/nutrition";
import { fmtShort, fmtTime, sessionKey } from "../lib/date";
import { beepEnd, beepGo, unlockAudio, useCountdown, useWakeLock } from "../lib/feedback";
import { currentGrade, lastLoad, liveClimbs, now, uid, update, useAppState } from "../lib/store";
import type { Attempt, Block, Exercise, GymSet, Grade, HangSet, ResolvedDay, Style, WarmKey } from "../types";
import { ExerciseArt, Grip, HangPosture } from "../components/Illustrations";
import { Html, Icon, RestTimer, useToast } from "../components/ui";
import { BoardPlanCard } from "../components/BoardPlan";
import { boardPlan } from "../data/boards";
import { adaptFor, suggestGym, suggestHang, type Adapt } from "../lib/coach";

/* ---------- Steps ---------- */
type Step =
  | { kind: "intro"; title: string }
  | { kind: "warm"; title: string; warm: WarmKey }
  | { kind: "gym"; title: string; ex: Exercise }
  | { kind: "hang"; title: string; block: Block; bi: number }
  | { kind: "attempts"; title: string; block: Block; bi: number }
  | { kind: "list"; title: string; block: Block; bi: number }
  | { kind: "finish"; title: string };

function buildSteps(day: ResolvedDay): Step[] {
  const st: Step[] = [{ kind: "intro", title: "Aperçu" }];
  if (day.warm === "finger") st.push({ kind: "warm", title: WARM.climb.name, warm: "climb" }, { kind: "warm", title: WARM.finger.name, warm: "finger" });
  else if (day.warm) st.push({ kind: "warm", title: WARM[day.warm].name, warm: day.warm });
  if (day.gym) {
    const list = (day.gym === "A" ? GYM_A : GYM_B).filter((e) => e.sets[day.phase.id]);
    list.forEach((ex) => st.push({ kind: "gym", title: ex.name, ex }));
  }
  day.blocks.forEach((b, bi) => {
    if (b.kind === "hang" && b.hang) st.push({ kind: "hang", title: b.t, block: b, bi });
    else if (b.kind === "attempts") st.push({ kind: "attempts", title: b.t, block: b, bi });
    else st.push({ kind: "list", title: b.t, block: b, bi });
  });
  if (day.cool) { const k = coolKey(day); st.push({ kind: "warm", title: WARM[k].name, warm: k }); }
  st.push({ kind: "finish", title: "Bilan" });
  return st;
}

/* ---------- Draft (kept on the device so a session survives the app closing) ---------- */
interface Draft {
  key: string; step: number; startedAt: number;
  checks: Record<string, boolean>;
  hangs: Record<number, HangSet[]>;
  hangLoad: Record<number, string>;
  gym: Record<string, GymSet[]>;
  attempts: (Attempt & { b: number })[];
  touched: string[];
  current: Record<number, string>; // block index → climb id or "free"
  free: { grade: Grade; tries: number };
}
const DRAFT_KEY = "projetV8.draft";
export function readDraft(): Draft | null {
  try { return JSON.parse(localStorage.getItem(DRAFT_KEY) || "null"); } catch { return null; }
}
export const clearDraft = () => { try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ } };

export function SessionRunner({ week, dow, onClose }: { week: number; dow: number; onClose: () => void }) {
  const day = useMemo(() => getDay(week, dow), [week, dow]);
  const steps = useMemo(() => buildSteps(day), [day]);
  const key = sessionKey(week, dow);
  const [draft, setDraft] = useState<Draft>(() => {
    const d = readDraft();
    if (d && d.key === key) return d;
    return { key, step: 0, startedAt: now(), checks: {}, hangs: {}, hangLoad: {}, gym: {}, attempts: [], touched: [], current: {}, free: { grade: "V4", tries: 0 } };
  });
  const [confirmQuit, setConfirmQuit] = useState(false);
  const st = useAppState();
  const adapt = adaptFor(st, day);
  const bodyRef = useRef<HTMLDivElement>(null);
  useWakeLock(true);

  useEffect(() => { try { localStorage.setItem(DRAFT_KEY, JSON.stringify(draft)); } catch { /* ignore */ } }, [draft]);
  useEffect(() => { bodyRef.current?.scrollTo(0, 0); }, [draft.step]);
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  const patch = (fn: (d: Draft) => void) => setDraft((d) => { const n = structuredClone(d); fn(n); return n; });
  const go = (i: number) => { unlockAudio(); patch((d) => { d.step = Math.max(0, Math.min(steps.length - 1, i)); }); };
  const step = steps[Math.min(draft.step, steps.length - 1)];
  const mins = Math.round((now() - draft.startedAt) / 60000);

  return (
    <div className="runner" style={{ ["--ph" as any]: `var(--${day.phase.id})` }}>
      <header className="runner-head">
        <div className="row between">
          <button type="button" className="iconbtn" aria-label="Quitter la séance" onClick={() => setConfirmQuit(true)}><Icon name="x" /></button>
          <div style={{ textAlign: "center", minWidth: 0 }}>
            <div className="eyebrow">S{week} · {day.title}</div>
            <div className="small muted">Étape {draft.step + 1} / {steps.length} · {mins} min</div>
          </div>
          <span style={{ width: 36 }} />
        </div>
        <div className="segbar" aria-hidden="true">
          {steps.map((_, i) => <i key={i} className={i < draft.step ? "done" : i === draft.step ? "cur" : ""} />)}
        </div>
        {confirmQuit && (
          <div className="banner info stack">
            <span>Quitter la séance ? Ta progression est gardée : tu pourras reprendre depuis l’écran Aujourd’hui.</span>
            <div className="row">
              <button type="button" className="btn sm pri" onClick={onClose}>Reprendre plus tard</button>
              <button type="button" className="btn sm danger" onClick={() => { clearDraft(); onClose(); }}>Abandonner</button>
              <button type="button" className="btn sm ghost" onClick={() => setConfirmQuit(false)}>Continuer</button>
            </div>
          </div>
        )}
      </header>

      <div className="runner-body" ref={bodyRef}>
        <div className="inner" key={draft.step}>
          {step.kind !== "intro" && step.kind !== "finish" && <h2 className="step-title">{step.title}</h2>}
          {step.kind === "intro" && <Intro day={day} steps={steps} adapt={adapt} />}
          {step.kind === "warm" && <WarmStep warm={step.warm} draft={draft} patch={patch} sid={`w${draft.step}`} />}
          {step.kind === "gym" && <GymStep ex={step.ex} phase={day.phase.id} week={week} draft={draft} patch={patch} deload={day.banners.some((b) => b.includes("décharge"))} />}
          {step.kind === "hang" && (adapt.noHang
            ? <div className="banner bad stack"><b>Suspensions supprimées aujourd’hui</b><span className="small">{adapt.banners[0]}</span><span className="small">Passe à l’étape suivante.</span></div>
            : <HangStep block={adapt.hangDelta ? { ...step.block, hang: { ...step.block.hang!, sets: Math.max(1, step.block.hang!.sets + adapt.hangDelta) } } : step.block} bi={step.bi} week={week} draft={draft} patch={patch} />)}
          {step.kind === "attempts" && (adapt.noBoard && step.block.board === "auto" || adapt.noLimit) && <div className="banner bad small"><b>Adapté pour toi :</b> {adapt.noBoard && step.block.board === "auto" ? "pas de board aujourd’hui. Remplace par 6 à 8 blocs faciles en main ouverte (V3 max), sans forcer." : "pas d’effort limite aujourd’hui. Blocs 2 niveaux sous ton max, RPE 6 à 7."}</div>}
          {step.kind === "attempts" && <AttemptsStep block={step.block} bi={step.bi} week={week} draft={draft} patch={patch} />}
          {step.kind === "list" && <ListStep block={step.block} draft={draft} patch={patch} sid={`b${step.bi}`} />}
          {step.kind === "finish" && <Finish day={day} draft={draft} onSaved={onClose} />}
        </div>
      </div>

      {step.kind !== "finish" && (
        <footer className="runner-foot">
          <div className="inner">
            <button type="button" className="btn lg" disabled={draft.step === 0} onClick={() => go(draft.step - 1)}><Icon name="left" /> Retour</button>
            <button type="button" className="btn lg pri" onClick={() => go(draft.step + 1)}>
              {draft.step === 0 ? "C’est parti" : draft.step === steps.length - 2 ? "Bilan" : "Suivant"} <Icon name="right" />
            </button>
          </div>
        </footer>
      )}
    </div>
  );
}

type StepProps = { draft: Draft; patch: (fn: (d: Draft) => void) => void };

/* ---------- Intro ---------- */
function Intro({ day, steps, adapt }: { day: ResolvedDay; steps: Step[]; adapt: Adapt }) {
  return (
    <>
      <div className="stack">
        <span className="chip ph" style={{ justifySelf: "start" }}>{day.phase.short} · {day.phase.name}</span>
        <h2 className="step-title" style={{ fontSize: 40 }}>{day.title}</h2>
        <div className="row">{day.dur && <span className="chip">{day.dur}</span>}{day.rpe && <span className="chip">RPE {day.rpe}</span>}</div>
      </div>
      {day.banners.map((b) => <div key={b} className="banner">{b}</div>)}
      {adapt.banners.map((b) => <div key={b} className={`banner ${adapt.tone === "bad" ? "bad" : ""}`}><b>Adapté pour toi :</b> {b}</div>)}
      {day.intro && <p>{day.intro}</p>}
      <div className="card stack">
        <h4>Au programme</h4>
        <ol className="clean">{steps.slice(1, -1).map((s, i) => <li key={i}>{s.title}</li>)}</ol>
      </div>
      <p className="muted small">L’écran reste allumé pendant la séance. Les minuteurs bipent sur les 3 dernières secondes : monte le son.</p>
    </>
  );
}

/* ---------- Checklists ---------- */
function Check({ on, onToggle, children }: { on: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <button type="button" className={`check ${on ? "on" : ""}`} onClick={onToggle} aria-pressed={on}>
      <span className="box" /><span className="txt">{children}</span>
    </button>
  );
}
function WarmStep({ warm, draft, patch, sid }: StepProps & { warm: WarmKey; sid: string }) {
  const p = WARM[warm];
  const cd = useCountdown(beepEnd);
  return (
    <>
      <p className="muted">{p.dur}</p>
      {warm === "finger" && <div className="illus" style={{ maxWidth: 260 }}><Grip kind="half" /></div>}
      <div className="stack">
        {p.steps.map(([t, d], i) => (
          <Check key={i} on={!!draft.checks[`${sid}:${i}`]} onToggle={() => patch((x) => { x.checks[`${sid}:${i}`] = !x.checks[`${sid}:${i}`]; })}>
            <b>{t}.</b> {d}
          </Check>
        ))}
      </div>
      {p.timer && <RestTimer cd={cd} seconds={TIMERS[p.timer].rest} label="Repos" />}
      {p.example && (
        <details className="fold"><summary>Exemple de montée en grade</summary><div className="inner"><ol className="clean">{p.example.map((e) => <li key={e}>{e}</li>)}</ol></div></details>
      )}
    </>
  );
}
function ListStep({ block, draft, patch, sid }: StepProps & { block: Block; sid: string }) {
  const cd = useCountdown(beepEnd);
  const rest = block.timer ? TIMERS[block.timer].rest : 0;
  return (
    <>
      {block.d && <p className="muted">{block.d}</p>}
      <div className="stack">
        {block.items.map((it, i) => (
          <Check key={i} on={!!draft.checks[`${sid}:${i}`]} onToggle={() => patch((x) => { x.checks[`${sid}:${i}`] = !x.checks[`${sid}:${i}`]; })}>
            <Html s={it} />
          </Check>
        ))}
      </div>
      {rest > 0 && <RestTimer cd={cd} seconds={rest} />}
    </>
  );
}

/* ---------- Hangboard ---------- */
type HangPhase = "idle" | "ready" | "work" | "rest" | "done";
function HangStep({ block, bi, week, draft, patch }: StepProps & { block: Block; bi: number; week: number }) {
  const s = useAppState();
  const spec = block.hang!;
  const sets = draft.hangs[bi] ?? [];
  const sugg = suggestHang(s, week);
  const load = draft.hangLoad[bi] ?? (sugg?.load ?? (lastLoad(s, "hang") || "0"));
  const [phase, setPhase] = useState<HangPhase>(sets.length >= spec.sets ? "done" : "idle");
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  const finishSet = () => {
    const n = (draft.hangs[bi]?.length ?? 0) + 1;
    patch((d) => { (d.hangs[bi] ??= []).push({ load: Number(String(load).replace(",", ".")) || 0, ok: true }); });
    if (n >= spec.sets) { setPhase("done"); beepEnd(); }
    else { setPhase("rest"); cd.start(spec.rest); }
  };
  const cd = useCountdown(() => {
    const p = phaseRef.current;
    if (p === "ready") { setPhase("work"); beepGo(); cd.start(spec.work); }
    else if (p === "work") finishSet();
    else if (p === "rest") { setPhase("ready"); cd.start(5); }
  });
  const begin = () => { unlockAudio(); setPhase("ready"); cd.start(5); };
  const current = Math.min(sets.length + 1, spec.sets);
  const label = { idle: "Prêt", ready: "Prépare-toi", work: "Suspends", rest: "Repos", done: "Terminé" }[phase];

  return (
    <>
      <p className="muted">{spec.grip} · {spec.sets} × {spec.work} s · repos {fmtTime(spec.rest)}</p>
      <div className="hang-stage" data-phase={phase} aria-live="polite">
        <span className="ph">{label}</span>
        <span className="big">{phase === "idle" ? `${spec.work}` : phase === "done" ? "✓" : fmtTime(cd.left)}</span>
        <span className="small" style={{ opacity: 0.85 }}>{phase === "done" ? `${sets.filter((x) => x.ok).length} / ${spec.sets} séries tenues` : `Série ${current} / ${spec.sets}`}</span>
      </div>
      <div className="row">
        {phase === "idle" && <button type="button" className="btn pri lg full" onClick={begin}><Icon name="play" /> Lancer la série {current}</button>}
        {(phase === "ready" || phase === "work" || phase === "rest") && (
          <>
            <button type="button" className="btn lg" style={{ flex: 1 }} onClick={cd.toggle}>{cd.running ? "Pause" : "Reprendre"}</button>
            {phase === "rest" && <button type="button" className="btn lg" onClick={() => { setPhase("ready"); cd.start(5); }}>Passer le repos</button>}
            <button type="button" className="btn lg ghost" onClick={() => { cd.stop(); setPhase(sets.length >= spec.sets ? "done" : "idle"); }}>Stop</button>
          </>
        )}
        {phase === "done" && <button type="button" className="btn full" onClick={() => { patch((d) => { d.hangs[bi] = []; }); setPhase("idle"); }}>Recommencer le bloc</button>}
      </div>
      {sugg && <p className="small"><b>Charge conseillée : {sugg.load} kg.</b> <span className="muted">{sugg.reason}</span></p>}
      <label className="field">Charge ajoutée (kg, négatif si assisté)
        <input className="input num" inputMode="decimal" value={load} onChange={(e) => { const v = e.target.value; patch((d) => { d.hangLoad[bi] = v; }); }} />
      </label>
      {sets.length > 0 && (
        <div className="card stack">
          <h4>Séries</h4>
          {sets.map((x, i) => (
            <div className="row between" key={i}>
              <span className="num">Série {i + 1} · {x.load > 0 ? "+" : ""}{x.load} kg</span>
              <button type="button" className={`btn sm ${x.ok ? "" : "danger"}`} onClick={() => patch((d) => { d.hangs[bi][i].ok = !d.hangs[bi][i].ok; })}>{x.ok ? "Tenue" : "Lâchée"}</button>
            </div>
          ))}
          <p className="muted small">Touche une série pour la passer en « lâchée » si tu n’as pas tenu les {spec.work} s.</p>
        </div>
      )}
      <div className="two">
        <div className="illus narrow"><HangPosture /></div>
        <ul className="clean small">{block.items.slice(1).map((it) => <li key={it}><Html s={it} /></li>)}</ul>
      </div>
    </>
  );
}

/* ---------- Attempts on projects / limit boulders ---------- */
function AttemptsStep({ block, bi, week, draft, patch }: StepProps & { block: Block; bi: number; week: number }) {
  const s = useAppState();
  const toast = useToast();
  const plan = block.board === "auto" ? boardPlan(week, currentGrade(s)) : null;
  // On a board day, only that board's projects; otherwise only gym projects.
  const projects = liveClimbs(s).filter((c) => c.status === "projet" && (plan ? c.board === plan.board.id : !c.board)).sort((a, b) => b.u - a.u);
  const current = draft.current[bi] ?? (projects[0]?.id ?? "free");
  const climb = current !== "free" ? s.climbs[current] : undefined;
  const mine = draft.attempts.filter((a) => a.b === bi);
  const forTarget = mine.filter((a) => (current === "free" ? !a.climbId : a.climbId === current));
  const rest = block.rest ?? 240;
  const cd = useCountdown(beepEnd);
  const [creating, setCreating] = useState(false);
  const [nGrade, setNGrade] = useState<Grade>(plan?.low ?? "V5");
  const [nStyle, setNStyle] = useState<Style>("reglettes");
  const [nName, setNName] = useState("");

  const log = (result: Attempt["result"]) => {
    unlockAudio();
    const at = now();
    if (climb) {
      const firstToday = !draft.touched.includes(climb.id);
      const isFlash = climb.attempts === 0 && result === "top";
      update((d) => {
        const c = d.climbs[climb.id];
        c.attempts += 1;
        if (firstToday) c.sessions += 1;
        if (result === "top") { c.status = "enchaine"; c.sentAt = at; c.flash = isFlash; }
        c.u = at;
      });
      patch((d) => { d.attempts.push({ climbId: climb.id, grade: climb.grade, result, at, b: bi }); if (firstToday) d.touched.push(climb.id); });
      if (result === "top") { toast(isFlash ? `Flash ! ${climb.name} ${climb.grade}` : `Enchaîné : ${climb.name} ${climb.grade}`); beepEnd(); return; }
    } else {
      const g = draft.free.grade;
      patch((d) => { d.attempts.push({ grade: g, result, at, b: bi }); d.free.tries += 1; });
      if (result === "top") {
        const id = uid();
        update((d) => { d.climbs[id] = { id, name: `${plan ? plan.board.name : "Bloc"} ${g} du ${fmtShort(new Date(at))}`, grade: g, style: plan ? "board" : "reglettes", board: plan?.board.id, angle: plan?.angle, color: "", status: "enchaine", flash: draft.free.tries === 0, attempts: draft.free.tries + 1, sessions: 1, created: at, sentAt: at, notes: "", u: at }; });
        patch((d) => { d.free.tries = 0; });
        toast(draft.free.tries === 0 ? `Flash en ${g} ajouté au carnet` : `${g} enchaîné, ajouté au carnet`);
        beepEnd();
        return;
      }
    }
    cd.start(rest);
  };

  const create = () => {
    const id = uid(), t = now();
    update((d) => { d.climbs[id] = { id, name: nName.trim() || `${plan ? plan.board.name : "Projet"} ${nGrade}`, grade: nGrade, style: plan ? "board" : nStyle, board: plan?.board.id, angle: plan?.angle, color: "", status: "projet", flash: false, attempts: 0, sessions: 0, created: t, notes: "", u: t }; });
    patch((d) => { d.current[bi] = id; });
    setCreating(false); setNName("");
  };

  return (
    <>
      <p className="muted">{block.d} · repos {fmtTime(rest)} entre les essais</p>
      <ul className="clean small">{block.items.map((it) => <li key={it}><Html s={it} /></li>)}</ul>
      {block.board && <BoardPlanCard block={block} week={week} />}

      <div className="card stack">
        <h4>Sur quoi tu grimpes ?</h4>
        <div className="pick">
          {projects.map((p) => (
            <button key={p.id} type="button" className={current === p.id ? "on" : ""} onClick={() => patch((d) => { d.current[bi] = p.id; })}>{p.grade} · {p.name}</button>
          ))}
          <button type="button" className={current === "free" ? "on" : ""} onClick={() => patch((d) => { d.current[bi] = "free"; })}>Bloc libre</button>
          <button type="button" onClick={() => setCreating((x) => !x)}>{plan ? `+ Bloc ${plan.board.name}` : "+ Nouveau projet"}</button>
        </div>
        {creating && (
          <div className="stack" style={{ borderTop: "1px solid var(--line)", paddingTop: 10 }}>
            <label className="field">{plan ? "Nom du bloc dans l’app (pour le retrouver)" : "Nom (ex. « le jaune du dévers »)"}<input className="input" value={nName} onChange={(e) => setNName(e.target.value)} /></label>
            <div className="pick grades">{GRADES.slice(1).map((g) => <button key={g} type="button" className={nGrade === g ? "on" : ""} onClick={() => setNGrade(g)}>{g}</button>)}</div>
            {!plan && <div className="pick">{STYLES.map((x) => <button key={x.id} type="button" className={nStyle === x.id ? "on" : ""} onClick={() => setNStyle(x.id)}>{x.label}</button>)}</div>}
            <button type="button" className="btn pri" onClick={create}>Créer et grimper</button>
          </div>
        )}
        {current === "free" && (
          <div className="stack">
            <span className="small muted">Niveau du bloc</span>
            <div className="pick grades">{GRADES.slice(1, 7).map((g) => <button key={g} type="button" className={draft.free.grade === g ? "on" : ""} onClick={() => patch((d) => { d.free.grade = g; d.free.tries = 0; })}>{g}</button>)}</div>
            <button type="button" className="btn sm ghost" style={{ justifySelf: "start" }} onClick={() => patch((d) => { d.free.tries = 0; })}>Nouveau bloc (remet le compteur à zéro)</button>
          </div>
        )}
        {climb && <p className="small muted">{climb.attempts} essai{climb.attempts > 1 ? "s" : ""} au total sur ce projet, {climb.sessions} séance{climb.sessions > 1 ? "s" : ""}.</p>}
      </div>

      <div className="result-btns">
        <button type="button" onClick={() => log("chute")}>Chute<small>avant le crux</small></button>
        <button type="button" onClick={() => log("crux")}>Crux passé<small>chute après</small></button>
        <button type="button" className="top" onClick={() => log("top")}>Top !<small>enchaîné</small></button>
      </div>

      <RestTimer cd={cd} seconds={rest} />
      {forTarget.length > 0 && (
        <div className="stack">
          <span className="small muted">Essais de cette séance ({forTarget.length})</span>
          <div className="att-list">{forTarget.map((a, i) => <span key={i} className={`att ${a.result}`} title={a.result}>{a.result === "top" ? "T" : a.result === "crux" ? "C" : i + 1}</span>)}</div>
          {forTarget.length >= 2 && forTarget.slice(-2).every((a) => a.result === "chute") && mine.length >= 4 && <div className="banner">Deux chutes d’affilée sans progrès : si le prochain essai n’est pas meilleur, passe au bloc suivant.</div>}
        </div>
      )}
    </>
  );
}

/* ---------- Gym exercise ---------- */
function GymStep({ ex, phase, week, draft, patch, deload }: StepProps & { ex: Exercise; phase: string; week: number; deload: boolean }) {
  const s = useAppState();
  const spec = ex.sets[phase as keyof typeof ex.sets];
  const parsed = parseSets(spec);
  const nSets = deload ? 2 : parsed.sets;
  const sugg = suggestGym(s, ex, phase, week);
  const prev = sugg?.load ?? (lastLoad(s, ex.id) || (ex.startKg != null ? String(ex.startKg) : ""));
  const hasHistory = !!lastLoad(s, ex.id);
  const rows: GymSet[] = draft.gym[ex.id] ?? Array.from({ length: nSets }, () => ({ reps: parsed.reps, load: prev, done: false }));
  const cd = useCountdown(beepEnd);
  const rest = parseRest(ex.rest);
  const write = (i: number, p: Partial<GymSet>) => patch((d) => {
    const r = d.gym[ex.id] ?? rows.map((x) => ({ ...x }));
    r[i] = { ...r[i], ...p };
    d.gym[ex.id] = r;
  });

  return (
    <>
      <div className="ex-top">
        <div className="illus"><ExerciseArt id={ex.id} /></div>
        <div className="stack" style={{ gap: 4 }}>
          <span className="big num" style={{ color: "var(--accent)" }}>{deload ? "2 séries, charge de la semaine passée" : spec}</span>
          <span className="small muted">Repos {ex.rest}{hasHistory ? ` · dernière charge ${lastLoad(s, ex.id)} kg` : ""}</span>
          {sugg && <span className="small"><b>Conseillé : {sugg.load} kg.</b> <span className="muted">{sugg.reason}</span></span>}
          {!hasHistory && <span className="small"><b>Départ conseillé :</b> {ex.start}</span>}
        </div>
      </div>
      <ol className="clean small">{ex.how.map((h) => <li key={h}>{h}</li>)}</ol>
      <div className="card stack">
        <div className="setrow small muted"><span>#</span><span>Reps</span><span>Charge (kg)</span><span /></div>
        {rows.map((r, i) => (
          <div className="setrow" key={i}>
            <span className="n">{i + 1}</span>
            <input className="input num" inputMode="numeric" aria-label={`Répétitions série ${i + 1}`} value={r.reps} onChange={(e) => write(i, { reps: e.target.value })} />
            <input className="input num" inputMode="decimal" aria-label={`Charge série ${i + 1}`} placeholder="PdC" value={r.load} onChange={(e) => write(i, { load: e.target.value })} />
            <button type="button" className={`setbtn ${r.done ? "on" : ""}`} aria-label={`Série ${i + 1} faite`} aria-pressed={r.done}
              onClick={() => { const on = !r.done; write(i, { done: on }); if (on && i < rows.length - 1) cd.start(rest); }}>
              <Icon name="check" />
            </button>
          </div>
        ))}
        <button type="button" className="btn sm ghost" style={{ justifySelf: "start" }} onClick={() => patch((d) => { d.gym[ex.id] = [...rows, { ...rows[rows.length - 1], done: false }]; })}>+ Ajouter une série</button>
      </div>
      <p className="small muted"><b>Ajuster :</b> 4 reps ou plus en réserve à la dernière série → +2,5 kg (ou haltère suivant) la prochaine fois. Dernière rep très lente ou ratée → garde ou baisse de 10 %.</p>
      <RestTimer cd={cd} seconds={rest} />
      <details className="fold"><summary>Erreurs à éviter</summary><div className="inner"><ul className="clean list-no">{ex.errors.map((e) => <li key={e}>{e}</li>)}</ul><p className="small"><b>Trop dur ?</b> {ex.regress}</p></div></details>
    </>
  );
}

/* ---------- Finish ---------- */
function Finish({ day, draft, onSaved }: { day: ResolvedDay; draft: Draft; onSaved: () => void }) {
  const toast = useToast();
  const [rpe, setRpe] = useState(day.type === "rest" ? 3 : 7);
  const [note, setNote] = useState("");
  const mins = Math.max(1, Math.round((now() - draft.startedAt) / 60000));
  const hangs = Object.values(draft.hangs).flat();
  const gymDone = Object.values(draft.gym).flat().filter((g) => g.done).length;
  const tops = draft.attempts.filter((a) => a.result === "top").length;

  const save = () => {
    const at = now();
    const gym: Record<string, GymSet[]> = {};
    for (const [k, v] of Object.entries(draft.gym)) { const done = v.filter((x) => x.done); if (done.length) gym[k] = done; }
    update((d) => {
      d.sessions[draft.key] = {
        key: draft.key, at, rpe, note: note.trim(), mins, u: at,
        hangs: hangs.length ? hangs : undefined,
        gym: Object.keys(gym).length ? gym : undefined,
        attempts: draft.attempts.length ? draft.attempts.map(({ b: _b, ...a }) => a) : undefined,
      };
    });
    clearDraft();
    toast("Séance enregistrée");
    onSaved();
  };

  return (
    <>
      <h2 className="step-title">Bilan</h2>
      <div className="stats">
        <div className="stat"><div className="v num">{mins}</div><div className="l">minutes</div></div>
        <div className="stat"><div className="v num">{hangs.length ? hangs.filter((h) => h.ok).length + "/" + hangs.length : gymDone || draft.attempts.length}</div><div className="l">{hangs.length ? "suspensions tenues" : gymDone ? "séries faites" : "essais"}</div></div>
        <div className="stat"><div className="v num">{tops}</div><div className="l">tops</div></div>
      </div>
      <label className="field">Effort ressenti (RPE) · <b className="num" style={{ color: "var(--ink)", fontSize: 18 }}>{rpe}</b>
        <input type="range" min={1} max={10} value={rpe} onChange={(e) => setRpe(Number(e.target.value))} />
      </label>
      {day.rpe && <p className="small muted">Cible du jour : RPE {day.rpe}. {rpe >= 9 && day.rpe.startsWith("6") ? "Plus dur que prévu : allège la prochaine séance." : ""}</p>}
      <label className="field">Note (doigts, sensations, crux…)
        <textarea className="input" value={note} maxLength={300} onChange={(e) => setNote(e.target.value)} placeholder="ex. Crux du projet V6 enchaîné, petite gêne annulaire droit" />
      </label>
      <button type="button" className="btn pri lg full" onClick={save}><Icon name="check" /> Enregistrer la séance</button>
    </>
  );
}
