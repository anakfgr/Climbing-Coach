import { useState } from "react";
import { GRADES } from "../data/nutrition";
import { FONT } from "../data/program";
import { fmtLong, mondayOf, parseISO, toISO, today } from "../lib/date";
import { update, useAppState } from "../lib/store";
import { Icon } from "../components/ui";

const FEATURES: [string, string, string][] = [
  ["play", "Séances guidées", "Échauffement, suspensions chronométrées, essais et séries notés en direct."],
  ["projects", "Carnet de projets", "Tes blocs, tes essais, tes croix et ta pyramide vers le niveau suivant."],
  ["dumbbell", "Bibliothèque", "Chaque exercice de salle illustré, les prises, les échauffements."],
  ["cloud", "Partout", "Fonctionne hors ligne, synchro optionnelle entre téléphone et Mac."],
];

export function Onboarding({ onOpenSettings }: { onOpenSettings: () => void }) {
  const s = useAppState();
  const [step, setStep] = useState(0);
  const thisMonday = toISO(mondayOf(today()));
  const nextMonday = (() => { const d = mondayOf(today()); d.setDate(d.getDate() + 7); return toISO(d); })();
  const [start, setStart] = useState(s.profile.start);
  const [weight, setWeight] = useState(s.profile.weight);
  const [grade, setGrade] = useState(s.profile.grade);

  const finish = (openSync: boolean) => {
    update((d) => { d.profile = { ...d.profile, start, weight, grade, u: Date.now() }; d.onboarded = true; });
    if (openSync) onOpenSettings();
  };

  return (
    <div className="onb">
      <div className="wrap">
        <div className="dots" aria-hidden="true">{[0, 1, 2].map((i) => <i key={i} className={i <= step ? "on" : ""} />)}</div>

        {step === 0 && (
          <>
            <h1>Projet <b>V8</b></h1>
            <p style={{ fontSize: 17 }}>16 semaines pour passer de V4 à V7, puis viser le V8. Un plan jour par jour, et un coach dans la poche pendant chaque séance.</p>
            <div className="stack gap16">
              {FEATURES.map(([ic, t, d]) => (
                <div className="feature" key={t}><span className="ic"><Icon name={ic} /></span><div><b>{t}</b><p className="muted small">{d}</p></div></div>
              ))}
            </div>
            <button type="button" className="btn pri lg full" onClick={() => setStep(1)}>Commencer</button>
          </>
        )}

        {step === 1 && (
          <>
            <h2>Ton point de départ</h2>
            <div className="stack">
              <span className="field">Début du plan</span>
              <div className="seg">
                <button type="button" className={start === thisMonday ? "on" : ""} onClick={() => setStart(thisMonday)}>Cette semaine</button>
                <button type="button" className={start === nextMonday ? "on" : ""} onClick={() => setStart(nextMonday)}>Lundi prochain</button>
              </div>
              <input className="input" type="date" aria-label="Autre date de début" value={start} onChange={(e) => { if (e.target.value) setStart(toISO(mondayOf(parseISO(e.target.value)))); }} />
              <p className="muted small">Semaine 1 : à partir du {fmtLong(parseISO(start))}.</p>
            </div>
            <label className="field">Poids (kg)<input className="input num" inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} /></label>
            <div className="stack">
              <span className="field">Niveau que tu enchaînes aujourd’hui</span>
              <div className="pick grades">{GRADES.slice(1, 7).map((g) => <button key={g} type="button" className={grade === g ? "on" : ""} onClick={() => setGrade(g)}>{g}</button>)}</div>
              <p className="muted small">{grade} ≈ {FONT[grade]} en cotation Font.</p>
            </div>
            <div className="row"><button type="button" className="btn lg" onClick={() => setStep(0)}>Retour</button><button type="button" className="btn pri lg" style={{ flex: 1 }} onClick={() => setStep(2)}>Continuer</button></div>
          </>
        )}

        {step === 2 && (
          <>
            <h2>Téléphone et Mac</h2>
            <p>Tes séances sont enregistrées sur cet appareil et l’app marche sans réseau. Pour retrouver les mêmes données sur ton téléphone et ton Mac, active la synchro avec un projet Supabase gratuit (5 minutes, guide pas à pas).</p>
            <button type="button" className="btn pri lg full" onClick={() => finish(true)}><Icon name="cloud" /> Configurer la synchro</button>
            <button type="button" className="btn lg full" onClick={() => finish(false)}>Plus tard</button>
            <p className="muted small">Tu pourras l’activer à tout moment depuis la roue dentée en haut à droite.</p>
          </>
        )}
      </div>
    </div>
  );
}
