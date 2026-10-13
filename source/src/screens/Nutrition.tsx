import { useState } from "react";
import { HAWKER, MARKET, RECOVERY, SAMPLE_DAY, SUPPLEMENTS, TARGETS } from "../data/nutrition";
import { useAppState } from "../lib/store";
import { ProteinTracker } from "../components/widgets";
import { Html } from "../components/ui";

export function Nutrition() {
  const s = useAppState();
  const [k, setK] = useState<keyof typeof TARGETS>("hard");
  const t = TARGETS[k];
  const kP = t.pg * 4, kC = t.cg * 4, kF = t.fg * 9, kt = kP + kC + kF;
  const w = Number(String(s.profile.weight).replace(",", ".")) || 59;

  return (
    <div className="view">
      <div><div className="eyebrow">{w} kg · objectif protéines {Math.round(w * 1.9)} à {Math.round(w * 2.2)} g</div><h2>Nutrition</h2></div>
      <section className="card stack">
        <p><b>Ne perds pas de poids.</b> À 8-10 % de masse grasse, tu es déjà assez léger pour grimper du V8. Manger trop peu bloque la force des doigts et mène aux blessures : les tendons ont besoin d’énergie et de protéines pour s’adapter.</p>
        <p className="muted small">Pèse-toi une fois par semaine, le matin à jeun. Sous {Math.round(w - 1)} kg : ajoute environ 300 kcal par jour (une poignée de noix + une banane, ou un bol de riz en plus).</p>
      </section>

      <section className="card stack">
        <div className="seg">{(Object.keys(TARGETS) as (keyof typeof TARGETS)[]).map((x) => <button key={x} type="button" className={x === k ? "on" : ""} onClick={() => setK(x)}>{TARGETS[x].name}</button>)}</div>
        <p className="muted small">{t.when}</p>
        <div className="macros">
          {[["kcal", "~" + t.kcal.toLocaleString("fr-FR")], ["Protéines", t.p + " g"], ["Glucides", t.c + " g"], ["Lipides", t.f + " g"]].map(([l, v]) => (
            <div className="macro" key={l}><div className="v num">{v}</div><div className="l">{l}</div></div>
          ))}
        </div>
        <div className="bar" style={{ height: 14 }} aria-hidden="true">
          <i style={{ width: `${(kP / kt) * 100}%`, background: "var(--accent)" }} />
          <i style={{ width: `${(kC / kt) * 100}%`, background: "var(--p2b)" }} />
          <i style={{ width: `${(kF / kt) * 100}%`, background: "var(--p1)" }} />
        </div>
        <div className="row muted small">
          <span><span className="dot" style={{ background: "var(--accent)" }} /> Protéines {Math.round((kP / kt) * 100)} %</span>
          <span><span className="dot" style={{ background: "var(--p2b)" }} /> Glucides {Math.round((kC / kt) * 100)} %</span>
          <span><span className="dot" style={{ background: "var(--p1)" }} /> Lipides {Math.round((kF / kt) * 100)} %</span>
        </div>
        <p className="muted small">Les protéines restent constantes, les glucides suivent la charge. Répartis les protéines sur 4 à 5 repas de 25 à 35 g.</p>
      </section>

      <section className="card stack"><h3>Compteur de protéines</h3><ProteinTracker /><p className="muted small">Touche un aliment pour l’ajouter, touche-le dans la liste pour le retirer. Remis à zéro chaque jour.</p></section>

      <section className="card stack">
        <div className="row between"><h3>Journée type · séance le soir</h3><span className="chip num">~140 g protéines</span></div>
        <div className="timeline">{SAMPLE_DAY.map(([h, d, p]) => <div className="tl" key={h + d}><span className="h">{h}</span><span>{d}</span><span className="p">{p && `${p} g`}</span></div>)}</div>
      </section>

      <section className="card stack">
        <h3>Jour de salle ou de repos</h3>
        <ul className="clean">
          <li>Supprime la collation d’avant-grimpe, garde le shake après la salle.</li>
          <li>Moitié de riz au dîner, plus de légumes et un œuf ou du tofu en plus.</li>
          <li>Séance le matin ? Gros petit-déjeuner glucidique 90 min avant, shake + vrai repas après.</li>
        </ul>
      </section>

      <div className="two">
        <section className="card stack"><h3>Hawker</h3><ul className="clean">{HAWKER.map((x) => <li key={x}>{x}</li>)}</ul></section>
        <section className="card stack"><h3>Supermarché</h3><ul className="clean">{MARKET.map((x) => <li key={x}>{x}</li>)}</ul></section>
      </div>

      <section className="card stack">
        <h3>Compléments (tous optionnels)</h3>
        <div className="tbl"><table><thead><tr><th>Complément</th><th>Dose</th><th>Pourquoi</th></tr></thead>
          <tbody>{SUPPLEMENTS.map(([n, d, w]) => <tr key={n}><td>{n}</td><td className="n">{d}</td><td>{w}</td></tr>)}</tbody></table></div>
      </section>

      <section className="card stack"><h3>Récupération</h3><ul className="clean">{RECOVERY.map((r) => <li key={r}><Html s={r} /></li>)}</ul></section>
    </div>
  );
}
