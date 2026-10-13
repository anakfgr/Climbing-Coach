import { useState } from "react";
import { DELOAD, coolKey, TIMERS, TYPE_LABEL, WARM, getDay } from "../data/program";
import { GYM_A, GYM_B } from "../data/exercises";
import { dateOf, fmtShort, sessionKey, today } from "../lib/date";
import { lastLoad, liveSession, update, useAppState } from "../lib/store";
import type { WarmKey } from "../types";
import { Fold, Html, Icon } from "./ui";

export function WarmFold({ k, open }: { k: WarmKey; open?: boolean }) {
  const p = WARM[k];
  return (
    <Fold open={open} title={<>{p.name} <span className="muted" style={{ fontWeight: 400 }}>· {p.dur}</span></>}>
      <ol className="clean">{p.steps.map(([t, d]) => <li key={t}><b>{t}.</b> {d}</li>)}</ol>
    </Fold>
  );
}

export function GymTable({ which, phase, week, goto }: { which: "A" | "B"; phase: string; week: number; goto?: (id: string) => void }) {
  const s = useAppState();
  const list = (which === "A" ? GYM_A : GYM_B).filter((e) => e.sets[phase as keyof typeof e.sets]);
  const deload = DELOAD.includes(week);
  const load = (id: string, kg?: number) => {
    const last = lastLoad(s, id);
    if (last) return `${last} kg`;
    if (id === "pull") return phase === "p1" ? "PdC" : "+2,5 à 7,5 kg";
    if (id === "hammer") return "0,5-1 kg";
    return kg != null ? `${String(kg).replace(".", ",")} kg` : "PdC";
  };
  return (
    <div className="tbl">
      <table>
        <thead><tr><th>Exercice</th><th>Séries × reps</th><th>Charge</th><th>Repos</th></tr></thead>
        <tbody>
          {list.map((e) => (
            <tr key={e.id}>
              <td>{goto ? <button type="button" className="btn ghost sm" style={{ padding: 0, textDecoration: "underline", textUnderlineOffset: 3 }} onClick={() => goto(e.id)}>{e.name}</button> : e.name}</td>
              <td className="n">{deload ? "2 séries, charge S-1" : e.sets[phase as keyof typeof e.sets]}</td>
              <td className="n">{load(e.id, e.startKg)}</td>
              <td className="n">{e.rest}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export const LOAD_NOTE = "Charge = ta dernière charge notée, sinon la charge de départ conseillée (PdC = poids du corps).";

/** Log a session without running it: forgotten, done offline, or an older one. */
export function QuickDone({ week, dow, rest }: { week: number; dow: number; rest?: boolean }) {
  const s = useAppState();
  const [open, setOpen] = useState(false);
  const [rpe, setRpe] = useState(rest ? 3 : 7);
  const [note, setNote] = useState("");
  const [mins, setMins] = useState("");
  const key = sessionKey(week, dow);
  const planned = dateOf(s.profile.start, week, dow);
  const past = planned < today();
  if (!open) {
    return (
      <button type="button" className="btn full" onClick={() => setOpen(true)}>
        <Icon name="check" /> {past ? "Noter comme faite (séance passée)" : "Marquer comme faite sans la lancer"}
      </button>
    );
  }
  const save = () => {
    const now = Date.now();
    // A past session is dated on its planned day (midday) so the history stays in order.
    const at = past ? new Date(planned.getFullYear(), planned.getMonth(), planned.getDate(), 12).getTime() : now;
    update((d) => { d.sessions[key] = { key, at, rpe, note: note.trim(), mins: Number(mins) || undefined, u: now }; });
    try { const dr = JSON.parse(localStorage.getItem("projetV8.draft") || "null"); if (dr?.key === key) localStorage.removeItem("projetV8.draft"); } catch { /* ignore */ }
  };
  return (
    <div className="card stack">
      <div className="row between"><h4>Noter la séance</h4><span className="chip">{fmtShort(planned)}</span></div>
      <label className="field">Effort ressenti (RPE) · <b className="num" style={{ color: "var(--ink)", fontSize: 17 }}>{rpe}</b>
        <input type="range" min={1} max={10} value={rpe} onChange={(e) => setRpe(Number(e.target.value))} />
      </label>
      <div className="row" style={{ alignItems: "end" }}>
        <label className="field" style={{ width: 110 }}>Durée (min)<input className="input num" inputMode="numeric" value={mins} onChange={(e) => setMins(e.target.value.replace(/\D/g, ""))} placeholder="90" /></label>
        <label className="field" style={{ flex: 1, minWidth: 160 }}>Note (optionnel)<input className="input" value={note} maxLength={300} onChange={(e) => setNote(e.target.value)} placeholder="ex. Faite sans l’app, doigts OK" /></label>
      </div>
      <div className="row">
        <button type="button" className="btn pri" onClick={save}><Icon name="check" /> Enregistrer</button>
        <button type="button" className="btn ghost" onClick={() => setOpen(false)}>Annuler</button>
      </div>
      <p className="muted small">Pour noter aussi tes charges ou tes essais, lance plutôt la séance guidée.</p>
    </div>
  );
}

/** Full read-only description of one day, with a start button for the guided session. */
export function DayCard({ week, dow, onStart, onGotoExercise }: { week: number; dow: number; onStart?: () => void; onGotoExercise?: (id: string) => void }) {
  const s = useAppState();
  const day = getDay(week, dow);
  const key = sessionKey(week, dow);
  const done = liveSession(s, key);
  const ph = day.phase;
  const warm: WarmKey[] = day.warm === "finger" ? ["climb", "finger"] : day.warm ? [day.warm] : [];

  return (
    <article className="day" style={{ ["--ph" as any]: `var(--${ph.id})` }}>
      <div className="day-head">
        <div className="eyebrow">Semaine {week} · {fmtShort(dateOf(s.profile.start, week, dow))} · {ph.short} {ph.name}</div>
        <h3>{day.title}</h3>
        <div className="row">
          <span className="chip ph">{TYPE_LABEL[day.type]}</span>
          {day.dur && <span className="chip">{day.dur}</span>}
          {day.rpe && <span className="chip">RPE {day.rpe}</span>}
          {done && <span className="chip ok">Faite · RPE {done.rpe}</span>}
        </div>
      </div>
      <div className="day-body">
        {day.banners.map((b) => <div key={b} className="banner">{b}</div>)}
        {day.intro && <p>{day.intro}</p>}
        {warm.map((k) => <WarmFold key={k} k={k} open={day.type === "rest"} />)}
        {day.gym && (
          <section className="block">
            <div className="bh"><h4>Séance {day.gym}</h4><span className="muted small">{day.gym === "A" ? "Tirage + haut du corps" : "Pousser, gainage, jambes"}</span></div>
            <GymTable which={day.gym} phase={ph.id} week={week} goto={onGotoExercise} />
            <p className="muted small">{LOAD_NOTE}</p>
          </section>
        )}
        {day.blocks.map((b, i) => (
          <section className="block" key={i}>
            <div className="bh"><h4>{b.t}</h4><span className="muted small">{b.d}</span></div>
            <ul className="clean">{b.items.map((it) => <li key={it}><Html s={it} /></li>)}</ul>
            {b.timer && <span className="muted small"><Icon name="timer" size={13} /> {TIMERS[b.timer].name}</span>}
          </section>
        ))}
        {day.cool && <WarmFold k={coolKey(day)} />}

        {done ? (
          <div className="row between" style={{ borderTop: "1px dashed var(--line)", paddingTop: 12 }}>
            <span className="small">Faite le {fmtShort(new Date(done.at))}{done.mins ? ` · ${done.mins} min` : ""} · RPE <b className="num">{done.rpe}</b>{done.note ? <span className="muted"> · {done.note}</span> : null}</span>
            <button type="button" className="btn sm ghost" onClick={() => update((d) => { d.sessions[key] = { ...d.sessions[key], del: true, u: Date.now() }; })}>Annuler</button>
          </div>
        ) : (
          <div className="stack">
            {onStart && (
              <button type="button" className="btn pri lg full" onClick={onStart}>
                <Icon name="play" /> {day.type === "rest" ? "Faire la mobilité guidée" : "Démarrer la séance guidée"}
              </button>
            )}
            <QuickDone week={week} dow={dow} rest={day.type === "rest"} />
          </div>
        )}
      </div>
    </article>
  );
}
