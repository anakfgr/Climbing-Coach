import { useState } from "react";
import { adaptFor, startNewCycle } from "../lib/coach";
import { CheckinCard, PainPanel, RunSheet, weekRunMinutes } from "../components/Wellbeing";
import { useToast } from "../components/ui";
import { DOW, DOW_SHORT, PHASES, TYPE_LABEL, WEEK_NOTE, getDay, isTraining } from "../data/program";
import { TARGETS } from "../data/nutrition";
import { currentCycle, dateOf, fmtLong, fmtShort, parseISO, parseKey, planIndex, sessionKey, toISO, today, weekDay } from "../lib/date";
import { currentGrade, liveSession, liveSessions, useAppState } from "../lib/store";
import { boardLabel } from "../data/boards";
import { DayCard, QuickDone } from "../components/DayCard";
import { ProteinTracker } from "../components/widgets";
import { Icon } from "../components/ui";
import { readDraft } from "./SessionRunner";

const totalFrom = (fw: number) => { let n = 0; for (let w = fw; w <= 16; w++) for (let d = 0; d < 7; d++) if (isTraining(getDay(w, d))) n++; return n; };

export function Today({ onStart, onGo }: { onStart: (w: number, d: number) => void; onGo: (tab: string, anchor?: string) => void }) {
  const s = useAppState();
  const toast = useToast();
  const [runOpen, setRunOpen] = useState(false);
  const fw = s.profile.firstWeek ?? 1;
  const cycle = s.profile.cycle ?? 1;
  const minIdx = (fw - 1) * 7;
  const i0 = planIndex(s.profile.start);
  const [offset, setOffset] = useState(0);
  const idx = Math.max(minIdx, Math.min(111, i0 + offset));
  const { week, dow } = weekDay(idx);
  const cur = weekDay(Math.max(minIdx, Math.min(111, i0)));
  const phase = getDay(cur.week, 0).phase;
  const day = getDay(week, dow);
  const key = sessionKey(week, dow);
  const done = liveSession(s, key);
  const draft = readDraft();
  const resumable = draft && draft.key === key && !done;

  const doneCount = liveSessions(s).filter((x) => { const k = parseKey(x.key); return k && k.cycle === currentCycle() && k.week >= fw && isTraining(getDay(k.week, k.dow)); }).length;
  let due = 0;
  for (let k = minIdx; k < Math.min(112, Math.max(minIdx, i0)); k++) { const wd = weekDay(k); if (isTraining(getDay(wd.week, wd.dow))) due++; }
  const reg = due ? Math.min(100, Math.round((doneCount / due) * 100)) : null;
  const pct = Math.max(0, Math.min(100, ((i0 + 1) / 112) * 100));
  const todayISO = toISO(today());
  const longRunToday = Object.values(s.runs ?? {}).some((r) => !r.del && r.date === todayISO && r.mins >= 60);
  const target = TARGETS[longRunToday && offset === 0 ? "run" : day.type === "climb" || day.type === "test" ? "hard" : "light"];
  const adapt = adaptFor(s, day);
  const runMins = weekRunMinutes(s.runs ?? {});
  const lastRuns = Object.values(s.runs ?? {}).filter((r) => !r.del).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);

  return (
    <div className="view">
      <section className="stack" style={{ ["--ph" as any]: `var(--${phase.id})` }}>
        <div className="eyebrow">{fmtLong(new Date())}</div>
        <h2 className="hero" style={{ fontSize: 40 }}>Semaine {i0 < minIdx ? fw : Math.min(16, cur.week)} <span className="muted" style={{ fontWeight: 600 }}>/ 16</span></h2>
        <div className="row"><span className="chip ph">{phase.short} · {phase.name}</span>{cycle > 1 && <span className="chip">Cycle {cycle}</span>}{i0 < minIdx && <span className="chip warn">{cycle > 1 ? `Le cycle ${cycle} commence lundi` : "Le plan commence lundi"}</span>}</div>
        <div className="bar" aria-label={`Plan accompli à ${Math.round(pct)} %`}>
          {PHASES.map((p) => <i key={p.id} style={{ width: `${Math.max(0, Math.min(25, pct - ((p.weeks[0] - 1) / 16) * 100))}%`, background: `var(--${p.id})` }} />)}
        </div>
        <div className="stats">
          <div className="stat"><div className="v num">{doneCount}<span className="muted" style={{ fontSize: 16 }}> / {totalFrom(fw)}</span></div><div className="l">séances faites</div></div>
          <div className="stat"><div className="v num">{reg === null ? "–" : `${reg} %`}</div><div className="l">régularité</div></div>
          <div className="stat"><div className="v num">{Math.max(0, 112 - Math.max(0, i0))}</div><div className="l">jours restants</div></div>
        </div>
      </section>

      {i0 > 111 && offset === 0 ? (
        <div className="card stack">
          <h3>Cycle {cycle} terminé</h3>
          <p>Bravo. Fais les tests de la semaine 16 si ce n’est pas fait, puis repars sur un bloc de 12 semaines depuis la Phase 2A (force), avec tes charges actuelles comme base. Ton historique, tes projets et tes graphiques sont conservés.</p>
          <p className="muted small">Tous les deux cycles, prends d’abord une semaine complète sans grimper.</p>
          <button type="button" className="btn pri lg full" onClick={() => { const d = startNewCycle(); toast(`Cycle ${cycle + 1} : semaine 5 le ${fmtShort(parseISO(d))}`); setOffset(0); }}>Lancer le cycle {cycle + 1}</button>
        </div>
      ) : (
        <>
          {offset === 0 && i0 >= minIdx && isTraining(day) && !done && <CheckinCard />}
          <section className="session-hero" style={{ ["--ph" as any]: `var(--${day.phase.id})` }}>
            <div className="top-band">
              <div className="row between">
                <span className="eyebrow">{offset === 0 ? "Aujourd’hui" : DOW[dow]} · S{week}</span>
                <span className="chip ph">{TYPE_LABEL[day.type]}</span>
              </div>
              <h3>{day.title}</h3>
              <div className="row">{day.dur && <span className="chip">{day.dur}</span>}{day.rpe && <span className="chip">RPE {day.rpe}</span>}{done && <span className="chip ok">Faite · RPE {done.rpe}</span>}</div>
              {day.banners.map((b) => <div key={b} className="banner">{b}</div>)}
              {adapt.banners.map((b) => <div key={b} className={`banner ${adapt.tone === "bad" ? "bad" : ""} small`}><b>Adapté pour toi :</b> {b}</div>)}
            </div>
            {day.type !== "rest" && (
              <div className="outline">
                {day.warm && <div><span>Échauffement</span><span className="muted">20-25 min</span></div>}
                {day.gym && <div><span>Séance {day.gym}</span><span className="muted">{day.dur}</span></div>}
                {day.blocks.map((b, i) => { const bl = boardLabel(b, week, currentGrade(s)); return <div key={i}><span>{b.t}{bl && <span className="muted small" style={{ display: "block" }}>{bl}</span>}</span><span className="muted">{b.d?.split("·")[0]}</span></div>; })}
              </div>
            )}
            <div className="actions">
              {!done && (
                <button type="button" className="btn pri lg full" onClick={() => onStart(week, dow)}>
                  <Icon name="play" /> {resumable ? "Reprendre la séance" : day.type === "rest" ? "Faire la mobilité" : "Démarrer la séance"}
                </button>
              )}
              {!done && <QuickDone key={`${week}-${dow}`} week={week} dow={dow} rest={day.type === "rest"} />}
            </div>
          </section>

          <section className="stack">
            <div className="row between">
              <h4>Semaine {week}</h4>
              <div className="row">
                <button type="button" className="btn sm" aria-label="Semaine précédente" onClick={() => setOffset(Math.max(minIdx - i0, offset - 7))}><Icon name="left" /></button>
                <button type="button" className="btn sm" onClick={() => setOffset(0)}>Aujourd’hui</button>
                <button type="button" className="btn sm" aria-label="Semaine suivante" onClick={() => setOffset(offset + 7)}><Icon name="right" /></button>
              </div>
            </div>
            <div className="strip">
              {Array.from({ length: 7 }, (_, k) => {
                const d = getDay(week, k);
                const di = (week - 1) * 7 + k;
                const cls = [di === idx && "sel", di === i0 && "today", liveSession(s, sessionKey(week, k)) && "done", d.type === "rest" && "rest"].filter(Boolean).join(" ");
                return (
                  <button key={k} type="button" className={cls} onClick={() => setOffset(di - i0)} aria-label={`${DOW[k]} : ${d.title}`}>
                    <span className="d">{DOW_SHORT[k]} {dateOf(s.profile.start, week, k).getDate()}</span>
                    <span className="t">{d.type === "climb" ? "Bloc" : d.type === "gym" ? "Salle" : d.type === "test" ? "Test" : "Repos"}</span>
                    <span className="s" />
                  </button>
                );
              })}
            </div>
            {WEEK_NOTE[week] && <div className="banner info"><b>Cette semaine :</b> {WEEK_NOTE[week]}</div>}
          </section>

          <PainPanel />

          <section className="card stack">
            <div className="row between">
              <h4>Course à pied</h4>
              <button type="button" className="btn sm" onClick={() => setRunOpen(true)}><Icon name="plus" /> Noter une sortie</button>
            </div>
            <p className="small"><b className="num">{runMins} min</b> cette semaine{runMins > 240 ? " · grosse semaine : garde tes sorties faciles et loin du lundi" : ""}.</p>
            {lastRuns.length > 0 && <p className="muted small">{lastRuns.map((r) => `${fmtShort(parseISO(r.date))} : ${r.mins} min${r.km ? `, ${String(r.km).replace(".", ",")} km` : ""}${r.dplus ? `, ${r.dplus} m D+` : ""}`).join(" · ")}</p>}
            {runOpen && <RunSheet onClose={() => setRunOpen(false)} />}
          </section>

          <details className="fold">
            <summary>Détail complet de la séance</summary>
            <div className="inner" style={{ padding: 0 }}>
              <DayCard week={week} dow={dow} onGotoExercise={(id) => onGo("library", "ex-" + id)} />
            </div>
          </details>

          <section className="card stack">
            <div className="row between"><h4>Assiette du jour</h4><span className="chip">{target.name} · ~{target.kcal.toLocaleString("fr-FR")} kcal</span></div>
            <ProteinTracker compact />
            <button type="button" className="btn sm" style={{ justifySelf: "start" }} onClick={() => onGo("food")}>Plan alimentaire complet</button>
          </section>
        </>
      )}
    </div>
  );
}
