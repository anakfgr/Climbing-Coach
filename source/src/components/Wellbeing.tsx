import { useState } from "react";
import { CHECK_ROWS, PAIN_AREAS, PAIN_LEVELS, activePains, readiness, todayCheckin } from "../lib/coach";
import { fmtShort, mondayOf, parseISO, toISO, today } from "../lib/date";
import { now, uid, update, useAppState } from "../lib/store";
import type { Checkin, Pain, PainArea } from "../types";
import { Icon, Sheet, useToast } from "./ui";

/* ---------- Morning check ---------- */
export function CheckinCard() {
  const s = useAppState();
  const c = todayCheckin(s);
  const [editing, setEditing] = useState(false);
  const [v, setV] = useState<Pick<Checkin, "sleep" | "fingers" | "energy">>({ sleep: c?.sleep ?? 0, fingers: c?.fingers ?? 0, energy: c?.energy ?? 0 });
  const k = toISO(today());

  if (c && !editing) {
    const r = readiness(c);
    return (
      <div className={`banner ${r.level === 0 ? "info" : r.level === 2 ? "bad" : ""} stack`} style={{ gap: 4 }}>
        <div className="row between"><b>Check du matin : {r.title}</b><button type="button" className="btn sm ghost" onClick={() => setEditing(true)}>Modifier</button></div>
        <span className="small">{r.advice}</span>
        {c.fingers === 2 && <span className="small"><b>Doigts douloureux :</b> signale la gêne ci-dessous pour adapter les prochains jours.</span>}
      </div>
    );
  }
  return (
    <section className="card stack">
      <div className="row between"><h4>Check du matin</h4><span className="muted small">10 secondes</span></div>
      {CHECK_ROWS.map((row) => (
        <div className="stack" style={{ gap: 4 }} key={row.key}>
          <span className="field">{row.label}</span>
          <div className="seg">
            {row.opts.map((o, i) => (
              <button key={o} type="button" className={v[row.key] === i ? "on" : ""} onClick={() => setV((x) => ({ ...x, [row.key]: i }))}>{o}</button>
            ))}
          </div>
        </div>
      ))}
      <button type="button" className="btn pri" onClick={() => { update((d) => { d.checkins[k] = { ...v, u: now() } as Checkin; }); setEditing(false); }}>Valider</button>
    </section>
  );
}

/* ---------- Pains ---------- */
function PainSheet({ onClose }: { onClose: () => void }) {
  const toast = useToast();
  const [area, setArea] = useState<PainArea>("doigt");
  const [side, setSide] = useState<Pain["side"]>("droite");
  const [level, setLevel] = useState<1 | 2 | 3>(1);
  const [note, setNote] = useState("");
  const save = () => {
    const id = uid(), t = now();
    update((d) => { d.pains[id] = { id, area, side, level, note: note.trim(), at: t, u: t }; });
    toast("Gêne enregistrée : les séances s’adaptent");
    onClose();
  };
  return (
    <Sheet open onClose={onClose} label="Signaler une gêne">
      <div className="row between"><h3>Signaler une gêne</h3><button type="button" className="btn sm ghost" onClick={onClose}>Fermer</button></div>
      <div className="stack"><span className="field">Où ?</span>
        <div className="pick">{PAIN_AREAS.map((a) => <button key={a.id} type="button" className={area === a.id ? "on" : ""} onClick={() => setArea(a.id)}>{a.label}</button>)}</div>
      </div>
      <div className="stack"><span className="field">Côté</span>
        <div className="seg">{(["gauche", "droite", "les deux"] as const).map((x) => <button key={x} type="button" className={side === x ? "on" : ""} onClick={() => setSide(x)}>{x[0].toUpperCase() + x.slice(1)}</button>)}</div>
      </div>
      <div className="stack"><span className="field">Intensité</span>
        <div className="stack" style={{ gap: 6 }}>
          {([1, 2, 3] as const).map((l) => (
            <button key={l} type="button" className={`check ${level === l ? "on" : ""}`} onClick={() => setLevel(l)} aria-pressed={level === l}>
              <span className="box" /><span className="txt"><b>{PAIN_LEVELS[l]}</b><br /><span className="muted small">{l === 1 ? "Je la sens, elle ne m’empêche pas de grimper." : l === 2 ? "Elle limite certains mouvements ou dure jusqu’au lendemain." : "Douleur aiguë, craquement, gonflement ou perte de force."}</span></span>
            </button>
          ))}
        </div>
      </div>
      <label className="field">Note (doigt précis, mouvement en cause…)<input className="input" value={note} maxLength={200} onChange={(e) => setNote(e.target.value)} placeholder="ex. Annulaire droit, sur réglette en arqué" /></label>
      {level === 3 && <div className="banner bad small">Douleur vive ou « pop » : arrête de grimper et fais-toi examiner par un kiné ou un médecin avant de reprendre.</div>}
      <button type="button" className="btn pri lg full" onClick={save}>Enregistrer</button>
      <p className="muted small">L’app adapte les séances tant que la gêne n’est pas marquée « ça va mieux ». Elle ne remplace pas l’avis d’un professionnel.</p>
    </Sheet>
  );
}

export function PainPanel() {
  const s = useAppState();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const pains = activePains(s);
  const label = (p: Pain) => `${PAIN_AREAS.find((a) => a.id === p.area)?.label} ${p.side === "les deux" ? "des deux côtés" : p.side}`;
  return (
    <section className="card stack">
      <div className="row between">
        <h4>Douleurs</h4>
        <button type="button" className="btn sm" onClick={() => setOpen(true)}><Icon name="plus" /> Signaler une gêne</button>
      </div>
      {pains.length === 0 ? <p className="muted small">Rien à signaler. Au moindre doute sur un doigt ou un coude, note-le : les séances s’adaptent toutes seules.</p> : (
        <div className="stack" style={{ gap: 6 }}>
          {pains.map((p) => (
            <div key={p.id} className={`banner ${p.level >= 2 ? "bad" : ""} row between`}>
              <span className="small"><b>{label(p)}</b> · {PAIN_LEVELS[p.level].toLowerCase()} depuis le {fmtShort(new Date(p.at))}{p.note ? ` · ${p.note}` : ""}</span>
              <button type="button" className="btn sm" onClick={() => { update((d) => { d.pains[p.id] = { ...d.pains[p.id], resolvedAt: now(), u: now() }; }); toast("Super, séances normales à nouveau"); }}>Ça va mieux</button>
            </div>
          ))}
        </div>
      )}
      {open && <PainSheet onClose={() => setOpen(false)} />}
    </section>
  );
}

/* ---------- Running ---------- */
export function RunSheet({ onClose }: { onClose: () => void }) {
  const toast = useToast();
  const [date, setDate] = useState(toISO(today()));
  const [mins, setMins] = useState("");
  const [km, setKm] = useState("");
  const [dplus, setDplus] = useState("");
  const [rpe, setRpe] = useState(4);
  const [note, setNote] = useState("");
  const n = (x: string) => Number(x.replace(",", ".")) || undefined;
  const save = () => {
    const id = uid(), t = now();
    update((d) => { d.runs[id] = { id, date, mins: Number(mins) || 0, km: n(km), dplus: n(dplus), rpe, note: note.trim(), u: t }; });
    toast("Sortie enregistrée");
    onClose();
  };
  return (
    <Sheet open onClose={onClose} label="Noter une sortie">
      <div className="row between"><h3>Noter une sortie</h3><button type="button" className="btn sm ghost" onClick={onClose}>Fermer</button></div>
      <label className="field">Date<input className="input" type="date" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} /></label>
      <div className="row" style={{ alignItems: "end" }}>
        <label className="field" style={{ flex: 1, minWidth: 90 }}>Durée (min)<input className="input num" inputMode="numeric" value={mins} onChange={(e) => setMins(e.target.value.replace(/\D/g, ""))} placeholder="60" /></label>
        <label className="field" style={{ flex: 1, minWidth: 90 }}>Distance (km)<input className="input num" inputMode="decimal" value={km} onChange={(e) => setKm(e.target.value)} placeholder="10" /></label>
        <label className="field" style={{ flex: 1, minWidth: 90 }}>D+ (m)<input className="input num" inputMode="numeric" value={dplus} onChange={(e) => setDplus(e.target.value.replace(/\D/g, ""))} placeholder="150" /></label>
      </div>
      <label className="field">Effort (RPE) · <b className="num" style={{ color: "var(--ink)", fontSize: 17 }}>{rpe}</b><input type="range" min={1} max={10} value={rpe} onChange={(e) => setRpe(Number(e.target.value))} /></label>
      <label className="field">Note<input className="input" value={note} maxLength={200} onChange={(e) => setNote(e.target.value)} placeholder="ex. MacRitchie, chaud et humide" /></label>
      {rpe >= 7 && <div className="banner small">Sortie dure : pendant le cycle, garde la course en endurance facile (RPE 3 à 5) pour protéger tes séances de grimpe.</div>}
      <button type="button" className="btn pri lg full" disabled={!Number(mins)} onClick={save}>Enregistrer</button>
    </Sheet>
  );
}

/** Running minutes for the current week (Monday to Sunday). */
export function weekRunMinutes(runs: Record<string, { date: string; mins: number; del?: boolean }>, ref = today()) {
  const mon = mondayOf(ref), sun = new Date(mon); sun.setDate(sun.getDate() + 6);
  return Object.values(runs).filter((r) => !r.del && parseISO(r.date) >= mon && parseISO(r.date) <= sun).reduce((a, r) => a + r.mins, 0);
}
