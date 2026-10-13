import { DOW, getDay } from "../data/program";
import { TESTS, TEST_COLS } from "../data/nutrition";
import { exById } from "../data/exercises";
import { fmtShort, parseKey } from "../lib/date";
import { liveClimbs, liveSessions, testValue, update, useAppState } from "../lib/store";
import { LineChart } from "../components/widgets";
import { PAIN_AREAS, PAIN_LEVELS } from "../lib/coach";
import { mondayOf, parseISO, today } from "../lib/date";

export function Progress() {
  const s = useAppState();
  const sessions = liveSessions(s).sort((a, b) => a.at - b.at);

  const hangPts = sessions.filter((x) => x.hangs?.some((h) => h.ok)).map((x) => ({ x: `S${parseKey(x.key)?.week ?? ""}`, y: Math.max(...x.hangs!.filter((h) => h.ok).map((h) => h.load)) }));
  const pullPts = sessions.filter((x) => x.gym?.pull?.some((g) => g.load !== "")).map((x) => ({ x: `S${parseKey(x.key)?.week ?? ""}`, y: Math.max(...x.gym!.pull.map((g) => Number(String(g.load).replace(",", ".")) || 0)) }));
  const testPts = (id: string) => TEST_COLS.map((w) => ({ x: `S${w}`, y: Number(String(testValue(s, id, w)).replace(",", ".")) })).filter((p) => testValue(s, id, Number(p.x.slice(1))) !== "" && !Number.isNaN(p.y));

  const tops = sessions.reduce((a, x) => a + (x.attempts?.filter((t) => t.result === "top").length ?? 0), 0);
  const rpes = sessions.map((x) => x.rpe).filter(Boolean);
  const avgRpe = rpes.length ? (rpes.reduce((a, b) => a + b, 0) / rpes.length).toFixed(1) : "–";
  const minutes = sessions.reduce((a, x) => a + (x.mins ?? 0), 0);

  const setTest = (id: string, w: number, v: string) => update((d) => { d.tests[`${id}:${w}`] = { v: v.trim(), u: Date.now(), del: v.trim() === "" ? true : undefined }; });

  return (
    <div className="view">
      <div><div className="eyebrow">Charges, tests et historique</div><h2>Suivi</h2></div>
      <div className="stats">
        <div className="stat"><div className="v num">{sessions.length}</div><div className="l">séances · {Math.round(minutes / 60)} h</div></div>
        <div className="stat"><div className="v num">{avgRpe}</div><div className="l">RPE moyen</div></div>
        <div className="stat"><div className="v num">{tops + liveClimbs(s).filter((c) => c.status === "enchaine" && !sessions.some((x) => x.attempts?.some((a) => a.climbId === c.id))).length}</div><div className="l">blocs enchaînés</div></div>
      </div>

      <section className="charts">
        <div className="card chart stack">
          <h4>Suspensions 20 mm</h4>
          <span className="muted small">Charge max tenue par séance, kg ajoutés</span>
          <LineChart points={hangPts} band={[18, 28]} unit="kg" empty="Les séances doigts guidées s’affichent ici" />
        </div>
        <div className="card chart stack">
          <h4>Tractions lestées</h4>
          <span className="muted small">Charge max par séance, kg ajoutés</span>
          <LineChart points={pullPts} unit="kg" empty="Les séances Salle A guidées s’affichent ici" />
        </div>
        <div className="card chart stack">
          <h4>Poids de corps</h4>
          <span className="muted small">Aux tests, kg · bande = 58 à 61 kg</span>
          <LineChart points={testPts("bw")} band={[58, 61]} />
        </div>
        <div className="card chart stack">
          <h4>Test suspension max</h4>
          <span className="muted small">10 s sur 20 mm · bande = repère V7-V8</span>
          <LineChart points={testPts("hang")} band={[18, 28]} unit="kg" />
        </div>
      </section>

      <RunsAndPains />

      <section className="card stack">
        <h3>Tests de référence</h3>
        <p className="muted small">Samedi des semaines 4, 8, 12 et 16. Repères = moyennes approximatives au niveau V7-V8 ; un chiffre qui stagne deux tests de suite devient la priorité du bloc suivant.</p>
        <div className="tbl tests">
          <table>
            <thead><tr><th>Test</th>{TEST_COLS.map((w) => <th key={w}>S{w}</th>)}<th>Repère</th></tr></thead>
            <tbody>
              {TESTS.map((t) => (
                <tr key={t.id}>
                  <td>{t.name}{t.unit && <span className="muted small"> ({t.unit})</span>}</td>
                  {TEST_COLS.map((w) => (
                    <td key={w}>
                      {t.type === "sel" ? (
                        <select aria-label={`${t.name} S${w}`} value={testValue(s, t.id, w)} onChange={(e) => setTest(t.id, w, e.target.value)}>
                          {t.opts!.map((o) => <option key={o} value={o}>{o || "–"}</option>)}
                        </select>
                      ) : (
                        <input aria-label={`${t.name} S${w}`} inputMode="decimal" value={testValue(s, t.id, w)} onChange={(e) => setTest(t.id, w, e.target.value)} />
                      )}
                    </td>
                  ))}
                  <td className="muted small">{t.ref}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card stack">
        <div className="row between"><h3>Historique</h3><span className="chip">{sessions.length}</span></div>
        {sessions.length === 0 && <p className="muted">Aucune séance enregistrée. Lance la séance du jour depuis Aujourd’hui : elle arrivera ici avec tes charges et tes essais.</p>}
        <div>
          {[...sessions].reverse().slice(0, 60).map((x) => {
            const k = parseKey(x.key);
            const day = k ? getDay(k.week, k.dow) : null;
            const ok = x.hangs?.filter((h) => h.ok) ?? [];
            return (
              <details className="fold" key={x.key} style={{ marginBottom: 6 }}>
                <summary>
                  <span className="row" style={{ gap: 10, flexWrap: "nowrap", minWidth: 0 }}>
                    <span className="num muted small" style={{ flex: "none" }}>{k && k.cycle > 1 ? `C${k.cycle} ` : ""}S{k?.week} {k ? DOW[k.dow].slice(0, 3) : ""}</span>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{day?.title}</span>
                  </span>
                  <span className="chip" style={{ flex: "none" }}>RPE {x.rpe}</span>
                </summary>
                <div className="inner small">
                  <span className="muted">{fmtShort(new Date(x.at))}{x.mins ? ` · ${x.mins} min` : ""}</span>
                  {x.note && <p>{x.note}</p>}
                  {x.hangs?.length ? <p>Suspensions : {ok.length}/{x.hangs.length} tenues, jusqu’à {Math.max(...x.hangs.map((h) => h.load))} kg</p> : null}
                  {x.gym && Object.entries(x.gym).map(([id, sets]) => <p key={id}>{exById(id)?.name ?? id} : {sets.map((g) => `${g.reps}${g.load ? ` × ${g.load} kg` : ""}`).join(" · ")}</p>)}
                  {x.attempts?.length ? <p>Essais : {x.attempts.length} · tops : {x.attempts.filter((a) => a.result === "top").length}</p> : null}
                </div>
              </details>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function RunsAndPains() {
  const s = useAppState();
  const runs = Object.values(s.runs ?? {}).filter((r) => !r.del);
  // Running minutes per week over the last 8 weeks.
  const mon = mondayOf(today());
  const weeks = Array.from({ length: 8 }, (_, i) => { const d = new Date(mon); d.setDate(d.getDate() - (7 - i) * 7); return d; });
  const pts = weeks.map((w) => {
    const end = new Date(w); end.setDate(end.getDate() + 7);
    const mins = runs.filter((r) => { const d = parseISO(r.date); return d >= w && d < end; }).reduce((a, r) => a + r.mins, 0);
    return { x: fmtShort(w).replace(".", ""), y: mins };
  });
  const pains = Object.values(s.pains ?? {}).filter((p) => !p.del).sort((a, b) => b.at - a.at);
  return (
    <section className="charts">
      <div className="card chart stack">
        <h4>Course à pied</h4>
        <span className="muted small">Minutes par semaine, 8 dernières semaines</span>
        <LineChart points={runs.length ? pts : []} unit="min" empty="Note tes sorties depuis Aujourd’hui" />
      </div>
      <div className="card stack">
        <h4>Douleurs</h4>
        {pains.length === 0 ? <p className="muted small">Aucune gêne signalée.</p> : (
          <div className="stack" style={{ gap: 6 }}>
            {pains.slice(0, 8).map((p) => (
              <div key={p.id} className="row between small" style={{ borderBottom: "1px solid var(--line)", paddingBottom: 6 }}>
                <span><b>{PAIN_AREAS.find((a) => a.id === p.area)?.label} {p.side}</b> · {PAIN_LEVELS[p.level].toLowerCase()}{p.note ? ` · ${p.note}` : ""}</span>
                <span className="muted">{fmtShort(new Date(p.at))}{p.resolvedAt ? ` → ${fmtShort(new Date(p.resolvedAt))}` : " · en cours"}</span>
              </div>
            ))}
          </div>
        )}
        <p className="muted small">Une gêne qui revient au même endroit : parles-en à un kiné avant qu’elle ne devienne une blessure.</p>
      </div>
    </section>
  );
}
