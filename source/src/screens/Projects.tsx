import { useState } from "react";
import { GRADES, HOLD_COLORS, STYLES } from "../data/nutrition";
import { FONT } from "../data/program";
import { fmtShort } from "../lib/date";
import { currentGrade, liveClimbs, now, uid, update, useAppState } from "../lib/store";
import type { Climb, Grade } from "../types";
import { Icon, Sheet, useToast } from "../components/ui";

const styleLabel = (id: string) => STYLES.find((s) => s.id === id)?.label ?? id;
const colorHex = (id: string) => HOLD_COLORS.find((c) => c.id === id)?.hex;

function Pyramid({ climbs, best }: { climbs: Climb[]; best: Grade }) {
  const gi = GRADES.indexOf(best);
  const goal = GRADES[Math.min(GRADES.length - 1, gi + 1)];
  const goalIdx = GRADES.indexOf(goal);
  const rows = [0, 1, 2, 3].map((k) => GRADES[goalIdx - k]).filter(Boolean) as Grade[];
  const target = (k: number) => 2 ** k;
  const count = (g: Grade) => climbs.filter((c) => c.status === "enchaine" && c.grade === g).length;
  const missing = rows.map((g, k) => Math.max(0, target(k) - count(g))).reduce((a, b) => a + b, 0);
  return (
    <section className="card stack">
      <div className="row between"><h3>Pyramide vers le {goal}</h3><span className="chip">{goal} ≈ {FONT[goal]}</span></div>
      <p className="muted small">Pour tenir un niveau, il faut une base solide en dessous : 1 bloc au niveau visé, 2 juste en dessous, 4 puis 8. Le pointillé est la cible, la barre ce que tu as enchaîné.</p>
      <div className="pyramid">
        {rows.map((g, k) => {
          const c = count(g), t = target(k), max = 8;
          return (
            <div className="pyr-row" key={g}>
              <span className="lab">{g}</span>
              <div className="pyr-track">
                <div className="pyr-target" style={{ width: `${(t / max) * 100}%` }} />
                <div className={`pyr-fill ${c >= t ? "full" : ""}`} style={{ width: `${(Math.min(c, max) / max) * 100}%` }} />
              </div>
              <span className="cnt">{c} / {t}</span>
            </div>
          );
        })}
      </div>
      <p className="small">{missing === 0 ? `Base complète : tu es prêt à attaquer des ${goal}.` : `Encore ${missing} enchaînement${missing > 1 ? "s" : ""} pour compléter la base.`}</p>
    </section>
  );
}

const blank = (status: Climb["status"]): Climb => ({ id: "", name: "", grade: "V5", style: "reglettes", color: "", status, flash: false, attempts: 0, sessions: 0, created: 0, notes: "", u: 0 });

function ClimbSheet({ climb, onClose }: { climb: Climb | null; onClose: () => void }) {
  const toast = useToast();
  const [c, setC] = useState<Climb>(climb ?? blank("projet"));
  const [confirmDel, setConfirmDel] = useState(false);
  const isNew = !c.id;
  const set = (p: Partial<Climb>) => setC((x) => ({ ...x, ...p }));
  const save = () => {
    const t = now();
    const id = c.id || uid();
    update((d) => {
      d.climbs[id] = { ...c, id, name: c.name.trim() || `${c.status === "projet" ? "Projet" : "Bloc"} ${c.grade}`, created: c.created || t, sentAt: c.status === "enchaine" ? c.sentAt ?? t : undefined, u: t };
    });
    toast(isNew ? (c.status === "projet" ? "Projet ajouté" : "Enchaînement ajouté") : "Modifications enregistrées");
    onClose();
  };
  return (
    <Sheet open onClose={onClose} label="Bloc">
      <div className="row between"><h3>{isNew ? (c.status === "projet" ? "Nouveau projet" : "Nouvel enchaînement") : "Modifier"}</h3><button type="button" className="btn sm ghost" onClick={onClose}>Fermer</button></div>
      <div className="seg">
        <button type="button" className={c.status === "projet" ? "on" : ""} onClick={() => set({ status: "projet" })}>Projet en cours</button>
        <button type="button" className={c.status === "enchaine" ? "on" : ""} onClick={() => set({ status: "enchaine" })}>Enchaîné</button>
      </div>
      <label className="field">Nom<input className="input" value={c.name} placeholder="ex. Le jaune du dévers" onChange={(e) => set({ name: e.target.value })} /></label>
      <div className="stack"><span className="field">Niveau</span>
        <div className="pick grades">{GRADES.map((g) => <button key={g} type="button" className={c.grade === g ? "on" : ""} onClick={() => set({ grade: g })}>{g}</button>)}</div>
      </div>
      <div className="stack"><span className="field">Style</span>
        <div className="pick">{STYLES.map((x) => <button key={x.id} type="button" className={c.style === x.id ? "on" : ""} onClick={() => set({ style: x.id })}>{x.label}</button>)}</div>
      </div>
      <div className="stack"><span className="field">Couleur des prises</span>
        <div className="row">{HOLD_COLORS.map((h) => <button key={h.id} type="button" aria-label={h.label} aria-pressed={c.color === h.id} className={`swatch ${c.color === h.id ? "on" : ""}`} style={{ background: h.hex }} onClick={() => set({ color: c.color === h.id ? "" : h.id })} />)}</div>
      </div>
      <div className="row between">
        <span className="field" style={{ margin: 0 }}>Essais au total</span>
        <div className="row">
          <button type="button" className="btn sm" aria-label="Un essai de moins" onClick={() => set({ attempts: Math.max(0, c.attempts - 1) })}>−</button>
          <span className="num" style={{ minWidth: 28, textAlign: "center", fontSize: 18 }}>{c.attempts}</span>
          <button type="button" className="btn sm" aria-label="Un essai de plus" onClick={() => set({ attempts: c.attempts + 1 })}>+</button>
        </div>
      </div>
      {c.status === "enchaine" && (
        <button type="button" className={`check ${c.flash ? "on" : ""}`} onClick={() => set({ flash: !c.flash })} aria-pressed={c.flash}><span className="box" /><span className="txt">Flash (enchaîné au premier essai)</span></button>
      )}
      <label className="field">Notes (méthode, crux, pieds…)<textarea className="input" value={c.notes} onChange={(e) => set({ notes: e.target.value })} /></label>
      <button type="button" className="btn pri lg full" onClick={save}>Enregistrer</button>
      {!isNew && (confirmDel ? (
        <div className="banner bad row between"><span>Supprimer ce bloc du carnet ?</span><span className="row"><button type="button" className="btn sm danger" onClick={() => { update((d) => { d.climbs[c.id] = { ...d.climbs[c.id], del: true, u: now() }; }); toast("Bloc supprimé"); onClose(); }}>Supprimer</button><button type="button" className="btn sm ghost" onClick={() => setConfirmDel(false)}>Annuler</button></span></div>
      ) : <button type="button" className="btn ghost danger" onClick={() => setConfirmDel(true)}>Supprimer</button>)}
    </Sheet>
  );
}

export function Projects() {
  const s = useAppState();
  const [tab, setTab] = useState<"projet" | "enchaine">("projet");
  const [edit, setEdit] = useState<Climb | null | undefined>(undefined);
  const all = liveClimbs(s);
  const list = all.filter((c) => c.status === tab).sort((a, b) => (tab === "projet" ? b.u - a.u : (b.sentAt ?? 0) - (a.sentAt ?? 0)));
  const best = currentGrade(s);
  const nProj = all.filter((c) => c.status === "projet").length;
  const nSent = all.length - nProj;
  const flashes = all.filter((c) => c.status === "enchaine" && c.flash).length;

  return (
    <div className="view">
      <div className="row between">
        <div><div className="eyebrow">Carnet de blocs</div><h2>Projets</h2></div>
        <div className="row">
          <button type="button" className="btn" onClick={() => setEdit({ ...blank("enchaine") })}><Icon name="check" /> Enchaînement</button>
          <button type="button" className="btn pri" onClick={() => setEdit(null)}><Icon name="plus" /> Projet</button>
        </div>
      </div>

      <div className="stats">
        <div className="stat"><div className="v">{best}</div><div className="l">meilleur niveau · {FONT[best]}</div></div>
        <div className="stat"><div className="v num">{nSent}</div><div className="l">enchaînés</div></div>
        <div className="stat"><div className="v num">{flashes}</div><div className="l">flashs</div></div>
      </div>

      <Pyramid climbs={all} best={best} />

      <div className="seg">
        <button type="button" className={tab === "projet" ? "on" : ""} onClick={() => setTab("projet")}>En cours ({nProj})</button>
        <button type="button" className={tab === "enchaine" ? "on" : ""} onClick={() => setTab("enchaine")}>Enchaînés ({nSent})</button>
      </div>

      <div className="stack">
        {list.length === 0 && (
          <div className="card stack">
            <p>{tab === "projet" ? "Aucun projet en cours. Ajoute le bloc que tu travailles, ou crée-le directement pendant une séance guidée." : "Aucun enchaînement pour l’instant. Les tops notés en séance guidée arrivent ici automatiquement."}</p>
          </div>
        )}
        {list.map((c) => (
          <button key={c.id} type="button" className="climb" onClick={() => setEdit(c)}>
            <span className="g">{c.grade.replace("V", "")}<span className="tag" style={{ background: colorHex(c.color) ?? "transparent", borderColor: colorHex(c.color) ? "var(--surface)" : "transparent" }} /></span>
            <div>
              <div className="nm">{c.name}</div>
              <div className="meta">{c.grade} · {styleLabel(c.style)} · {c.attempts} essai{c.attempts > 1 ? "s" : ""}{c.sessions ? ` · ${c.sessions} séance${c.sessions > 1 ? "s" : ""}` : ""}</div>
            </div>
            {c.status === "enchaine" ? <span className={`chip ${c.flash ? "warn" : "ok"}`}>{c.flash ? "Flash" : fmtShort(new Date(c.sentAt ?? c.u))}</span> : <span className="muted"><Icon name="right" size={18} /></span>}
          </button>
        ))}
      </div>
      {edit !== undefined && <ClimbSheet climb={edit} onClose={() => setEdit(undefined)} />}
    </div>
  );
}
