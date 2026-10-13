import { useEffect, useState } from "react";
import { PHASES, TIMERS, WARM, phaseOf } from "../data/program";
import { GYM_A, GYM_B, GYM_DO, GYM_DONT, GYM_PHASE_NOTE } from "../data/exercises";
import { planIndex, weekDay } from "../lib/date";
import { useAppState } from "../lib/store";
import type { Exercise, PhaseId, WarmKey } from "../types";
import { ExerciseArt, FrontLeverStrip, GRIPS, Grip, HangPosture } from "../components/Illustrations";
import { Icon } from "../components/ui";

type Seg = "warm" | "gym" | "grips";

function ExerciseCard({ ex, ph }: { ex: Exercise; ph: PhaseId }) {
  return (
    <section className="card ex-card" id={`ex-${ex.id}`}>
      <div className="ex-top">
        <div className="illus"><ExerciseArt id={ex.id} /></div>
        <div className="stack" style={{ gap: 6 }}>
          <h3>{ex.name}</h3>
          <span className="big">{ex.sets[ph] ?? "Pas dans cette phase"}</span>
          <div className="row"><span className="chip">Repos {ex.rest}</span></div>
        </div>
      </div>
      <p className="small muted">{ex.muscles}</p>
      <p><b>Pour la grimpe :</b> {ex.why}</p>
      <div className="banner info small"><b>Charge de départ :</b> {ex.start}</div>
      {ex.id === "fl" && <div className="illus" style={{ aspectRatio: "400 / 112" }}><FrontLeverStrip /></div>}
      <div className="ex-cols">
        <div><h5>Exécution</h5><ol>{ex.how.map((x) => <li key={x}>{x}</li>)}</ol></div>
        <div className="stack" style={{ gap: 8 }}>
          <div><h5>Erreurs fréquentes</h5><ul className="list-no">{ex.errors.map((x) => <li key={x}>{x}</li>)}</ul></div>
          <div><h5>Progresser</h5><p className="small">{ex.progress}</p></div>
          <div><h5>Trop dur ?</h5><p className="small">{ex.regress}</p></div>
        </div>
      </div>
      <div className="phasegrid">
        {PHASES.map((p) => <div key={p.id} className={p.id === ph ? "cur" : ""} style={{ ["--ph" as any]: `var(--${p.id})` }}><b>{p.short}</b>{ex.sets[p.id] ?? "–"}</div>)}
      </div>
    </section>
  );
}

function WarmCard({ k, extra }: { k: WarmKey; extra?: string }) {
  const p = WARM[k];
  return (
    <section className="card stack">
      <div className="row between"><h3>{p.name}</h3><span className="chip">{p.dur}</span></div>
      {extra && <p className="muted small">{extra}</p>}
      <ol className="clean">{p.steps.map(([t, d]) => <li key={t}><b>{t}.</b> {d}</li>)}</ol>
      {p.example && <details className="fold"><summary>Exemple concret de montée en grade</summary><div className="inner"><ol className="clean">{p.example.map((e) => <li key={e}>{e}</li>)}</ol></div></details>}
      {p.timer && <p className="small muted"><Icon name="timer" size={13} /> Minuteur intégré à la séance guidée : {TIMERS[p.timer].name}</p>}
    </section>
  );
}

export function Library({ anchor }: { anchor?: string }) {
  const s = useAppState();
  const cur = phaseOf(Math.min(16, Math.max(1, weekDay(planIndex(s.profile.start)).week))).id;
  const [seg, setSeg] = useState<Seg>(anchor?.startsWith("ex-") ? "gym" : "warm");
  const [ph, setPh] = useState<PhaseId>(cur);
  useEffect(() => {
    if (!anchor) return;
    if (anchor.startsWith("ex-")) setSeg("gym");
    const t = window.setTimeout(() => document.getElementById(anchor)?.scrollIntoView({ block: "start", behavior: "smooth" }), 60);
    return () => window.clearTimeout(t);
  }, [anchor]);

  return (
    <div className="view">
      <div><div className="eyebrow">Tout ce qu’il faut savoir faire</div><h2>Bibliothèque</h2></div>
      <div className="seg" role="tablist">
        <button type="button" role="tab" aria-selected={seg === "warm"} className={seg === "warm" ? "on" : ""} onClick={() => setSeg("warm")}>Échauffements</button>
        <button type="button" role="tab" aria-selected={seg === "gym"} className={seg === "gym" ? "on" : ""} onClick={() => setSeg("gym")}>Salle</button>
        <button type="button" role="tab" aria-selected={seg === "grips"} className={seg === "grips" ? "on" : ""} onClick={() => setSeg("grips")}>Prises & poutre</button>
      </div>

      {seg === "warm" && (
        <>
          <p className="muted">Ne saute jamais l’échauffement : des doigts froids sur des petites prises, c’est la cause numéro un des blessures de poulies.</p>
          <WarmCard k="climb" />
          <WarmCard k="finger" extra="Lundi en Phases 2A, 2B et 3, et le samedi des tests. Le pourcentage se règle avec les pieds." />
          <WarmCard k="express" />
          <WarmCard k="gym" />
          <WarmCard k="cool" extra="Après la grimpe, à la salle d’escalade." />
          <WarmCard k="coolGym" extra="Après les séances Salle A et B, sans mur d’escalade." />
          <WarmCard k="mobility" extra="Mercredi et dimanche, ou tout soir où tu as 20 min devant une série." />
        </>
      )}

      {seg === "gym" && (
        <>
          <section className="card stack">
            <h3>Oui à la salle, mais en grimpeur</h3>
            <p>Peu de répétitions (3 à 8) avec de longs repos : de la force sans masse inutile. Le travail antagoniste (pousser, extenseurs du poignet, stabilisateurs d’épaule) garde coudes et épaules en bonne santé sous la charge des suspensions.</p>
            <div className="two">
              <div><h4 style={{ marginBottom: 6 }}>À faire</h4><ul className="clean list-do">{GYM_DO.map((x) => <li key={x}>{x}</li>)}</ul></div>
              <div><h4 style={{ marginBottom: 6 }}>À éviter</h4><ul className="clean list-no">{GYM_DONT.map((x) => <li key={x}>{x}</li>)}</ul></div>
            </div>
            <p className="small muted"><b>Choisir la charge :</b> chaque exercice indique une charge de départ pour ton gabarit. Vise RPE 7 à 8 : 2 à 3 répétitions en réserve. 4 reps ou plus en réserve → +2,5 kg la séance suivante ; dernière rep très lente ou ratée → garde ou baisse de 10 %.</p>
          </section>
          <div className="seg" aria-label="Phase">{PHASES.map((p) => <button key={p.id} type="button" className={p.id === ph ? "on" : ""} onClick={() => setPh(p.id)}>{p.short}</button>)}</div>
          <div className="banner info">{GYM_PHASE_NOTE[ph]} Décharge (S8, S12, S16) : 2 séries de tout à la charge de la semaine précédente.</div>
          <div><div className="eyebrow">Mardi</div><h3>Séance A · tirage et haut du corps</h3></div>
          {GYM_A.map((e) => <ExerciseCard key={e.id} ex={e} ph={ph} />)}
          <div><div className="eyebrow">Vendredi</div><h3>Séance B · pousser, gainage, jambes</h3></div>
          {GYM_B.map((e) => <ExerciseCard key={e.id} ex={e} ph={ph} />)}
        </>
      )}

      {seg === "grips" && (
        <>
          <section className="card stack">
            <h3>Les trois prises</h3>
            <div className="grips">
              {GRIPS.map((g) => (
                <div key={g.kind} className="stack">
                  <div className="illus" style={{ aspectRatio: "200 / 140" }}><Grip kind={g.kind} /></div>
                  <div className="row"><b>{g.name}</b><span className={`chip ${g.tone}`}>{g.tone === "ok" ? "Entraînement" : "Projets seulement"}</span></div>
                  <p className="small">{g.use}</p>
                </div>
              ))}
            </div>
          </section>
          <section className="card stack">
            <h3>Bien se suspendre</h3>
            <div className="two">
              <div className="illus"><HangPosture /></div>
              <ul className="clean">
                <li><b>Réglette 20 mm</b>, semi-arqué, pouce libre.</li>
                <li><b>Épaules engagées</b> : tire les épaules loin des oreilles avant de décoller les pieds.</li>
                <li><b>Coudes souples</b>, jamais verrouillés.</li>
                <li><b>Corps immobile</b> : pas de balancier, jambes légèrement en avant.</li>
                <li><b>Charge</b> : baudrier + disque pour ajouter, poulie avec contrepoids pour retirer.</li>
                <li><b>Stop immédiat</b> à la moindre douleur vive dans un doigt.</li>
              </ul>
            </div>
          </section>
          <section className="card stack">
            <h3>Les protocoles du plan</h3>
            <div className="tbl"><table><thead><tr><th>Protocole</th><th>Séries</th><th>Effort</th><th>Repos</th><th>Quand</th></tr></thead>
              <tbody>
                <tr><td>Prépa doigts</td><td className="n">5</td><td className="n">10 s</td><td className="n">2:00</td><td>Phase 1, S3, pieds assistés</td></tr>
                <tr><td>Suspensions max</td><td className="n">6</td><td className="n">10 s</td><td className="n">3:00</td><td>Phase 2A, lundi</td></tr>
                <tr><td>Suspensions lourdes</td><td className="n">6</td><td className="n">7 s</td><td className="n">3:00</td><td>Phase 2B, lundi</td></tr>
                <tr><td>Maintenance</td><td className="n">4</td><td className="n">7 s</td><td className="n">3:00</td><td>Phase 3, lundi</td></tr>
              </tbody></table></div>
          </section>
        </>
      )}
    </div>
  );
}
