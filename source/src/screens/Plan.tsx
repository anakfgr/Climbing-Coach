import { useState } from "react";
import { COACH_RULES, DELOAD, DOW, FONT, PHASES, RPE_SCALE, RUNNING, SINGAPORE, WARNING_SIGNS, WEEK_NOTE, getDay, isTraining, phaseOf } from "../data/program";
import { dateOf, fmtShort, planIndex, sessionKey, weekDay } from "../lib/date";
import { liveSession, useAppState } from "../lib/store";
import { DayCard } from "../components/DayCard";
import { Fold, Html } from "../components/ui";

export function Plan({ onStart, onGo }: { onStart: (w: number, d: number) => void; onGo: (tab: string, anchor?: string) => void }) {
  const s = useAppState();
  const cw = Math.min(16, Math.max(1, weekDay(planIndex(s.profile.start)).week));
  const [sel, setSel] = useState(cw);
  const ph = phaseOf(sel);
  const doneOf = (w: number) => { let n = 0, t = 0; for (let d = 0; d < 7; d++) if (isTraining(getDay(w, d))) { t++; if (liveSession(s, sessionKey(w, d))) n++; } return [n, t]; };

  return (
    <div className="view">
      <div><div className="eyebrow">16 semaines · 3 phases</div><h2>Le plan</h2></div>
      <section className="card stack">
        <div className="weeks">
          {Array.from({ length: 16 }, (_, i) => {
            const w = i + 1, p = phaseOf(w), [n, t] = doneOf(w);
            return (
              <button key={w} type="button" aria-label={`Semaine ${w}`} aria-pressed={w === sel}
                className={[w === sel && "sel", w === cw && "cur", DELOAD.includes(w) && "deload"].filter(Boolean).join(" ")}
                style={{ ["--ph" as any]: `var(--${p.id})` }} onClick={() => setSel(w)}>
                {w}<i><b style={{ width: `${t ? (n / t) * 100 : 0}%` }} /></i>
              </button>
            );
          })}
        </div>
        <div className="phase-legend">{PHASES.map((p) => <div key={p.id} style={{ ["--ph" as any]: `var(--${p.id})` }}>{p.short} · {p.name}</div>)}</div>
        <p className="muted small">Cadre noir = semaine en cours · hachuré = décharge · trait = séances faites.</p>
      </section>

      <section className="stack" style={{ ["--ph" as any]: `var(--${ph.id})` }}>
        <div className="row between">
          <h3>Semaine {sel} <span className="muted" style={{ fontWeight: 600, fontSize: 18 }}>· {fmtShort(dateOf(s.profile.start, sel, 0))} au {fmtShort(dateOf(s.profile.start, sel, 6))}</span></h3>
          <span className="chip ph">{ph.short} · {ph.name}</span>
        </div>
        <p className="muted">{ph.goal}</p>
        <div className="banner info"><b>Cette semaine :</b> {WEEK_NOTE[sel]}</div>
        {DOW.map((name, d) => {
          const day = getDay(sel, d);
          const done = liveSession(s, sessionKey(sel, d));
          return (
            <details className="fold dayrow" key={d} style={{ ["--ph" as any]: `var(--${ph.id})` }}>
              <summary>
                <span className="l"><span className="dw">{name.slice(0, 3)}</span><span className="dot" style={{ background: day.type === "rest" ? "var(--line)" : "var(--ph)" }} /><span>{day.title}</span></span>
                <span className="row" style={{ flex: "none", gap: 6 }}>{done && <span className="chip ok">Faite</span>}<span className="muted small">{day.dur}</span></span>
              </summary>
              <div className="inner"><DayCard week={sel} dow={d} onStart={() => onStart(sel, d)} onGotoExercise={(id) => onGo("library", "ex-" + id)} /></div>
            </details>
          );
        })}
      </section>

      <section className="stack">
        <h3>Règles du coach</h3>
        <Fold open title="Les 6 règles non négociables">
          <ol className="clean">{COACH_RULES.map(([a, b]) => <li key={a}><b>{a}</b> {b}</li>)}</ol>
        </Fold>
        <Fold title="Échelle d’effort (RPE)">
          <div className="tbl"><table><thead><tr><th>RPE</th><th>Sensation</th><th>Pour</th></tr></thead>
            <tbody>{RPE_SCALE.map((r) => <tr key={r[0]}><td className="n">{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td></tr>)}</tbody></table></div>
        </Fold>
        <Fold title="Signaux d’alerte : stop et repos"><ul className="clean">{WARNING_SIGNS.map((w) => <li key={w}>{w}</li>)}</ul></Fold>
        <Fold title="Course à pied et ultra"><ul className="clean">{RUNNING.map((r) => <li key={r}><Html s={r} /></li>)}</ul></Fold>
        <Fold title="Grimper à Singapour"><ul className="clean">{SINGAPORE.map((r) => <li key={r}>{r}</li>)}</ul></Fold>
        <Fold title="Correspondance V / Fontainebleau">
          <div className="tbl"><table><thead><tr><th>V</th>{Object.keys(FONT).map((k) => <th key={k}>{k}</th>)}</tr></thead>
            <tbody><tr><td><b>Font</b></td>{Object.values(FONT).map((v) => <td key={v} className="n">{v}</td>)}</tr></tbody></table></div>
          <p className="muted small">Correspondance approximative. Le board se cote en général 1 à 2 niveaux plus dur.</p>
        </Fold>
        <Fold title="Après la semaine 16">
          <p>Refais le cycle à partir de la Phase 2A (semaines 5 à 16 = un bloc de 12 semaines) avec des charges plus lourdes. Tous les deux cycles, une semaine complète sans grimper pour laisser les tendons s’adapter. Deux à trois cycles : le chemin réaliste vers le V8.</p>
        </Fold>
      </section>
    </div>
  );
}
