import { useState } from "react";
import { GRADES } from "../data/nutrition";
import { dateOf, fmtLong, mondayOf, parseISO, toISO } from "../lib/date";
import { exportBackup, importBackup, update, useAppState } from "../lib/store";
import { SETUP_SQL, getConfig, saveConfig, signIn, signOut, signUp, syncNow, useSync } from "../lib/sync";
import { Fold, Sheet, useToast } from "../components/ui";

export const APP_VERSION = "2.0.0";

export function SupabaseGuide() {
  const toast = useToast();
  return (
    <Fold title="Guide : créer ton projet Supabase (5 min, gratuit)">
      <ol className="clean">
        <li>Va sur <b>supabase.com</b>, « Start your project », connecte-toi avec ton compte GitHub.</li>
        <li><b>New project</b> : nom « projet-v8 », choisis un mot de passe de base de données (garde-le), région <b>Southeast Asia (Singapore)</b>, puis Create.</li>
        <li>Menu <b>SQL Editor</b> → New query → colle le script ci-dessous → <b>Run</b>.</li>
        <li>Menu <b>Project Settings → API</b> (ou « Data API » et « API Keys ») : copie la <b>Project URL</b> et la clé <b>anon public</b>.</li>
        <li>Colle-les ci-dessus, puis crée ton compte avec ton email et un mot de passe.</li>
        <li>Optionnel : <b>Authentication → Sign In / Providers → Email</b>, désactive « Confirm email » pour éviter le mail de confirmation.</li>
      </ol>
      <pre className="code">{SETUP_SQL}</pre>
      <button type="button" className="btn sm" style={{ justifySelf: "start" }} onClick={() => { navigator.clipboard?.writeText(SETUP_SQL).then(() => toast("Script copié"), () => toast("Sélectionne le script et copie-le")); }}>Copier le script</button>
      <p className="muted small">La clé « anon » est faite pour être utilisée dans une app : avec la sécurité par ligne activée par le script, chaque compte ne voit que ses propres données.</p>
    </Fold>
  );
}

function SyncPanel() {
  const sync = useSync();
  const toast = useToast();
  const cfg = getConfig();
  const [url, setUrl] = useState(cfg?.url ?? "");
  const [key, setKey] = useState(cfg?.key ?? "");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [editCfg, setEditCfg] = useState(!cfg);

  const run = async (fn: () => Promise<string | null>) => { setBusy(true); setMsg(""); const e = await fn(); setBusy(false); if (e) setMsg(e); else toast("Connecté, synchro active"); };
  const statusText: Record<string, string> = {
    off: "Désactivée : tes données restent sur cet appareil.", signedout: "Projet configuré, connecte-toi pour synchroniser.",
    syncing: "Synchronisation…", ok: `Synchronisé${sync.last ? " à " + new Date(sync.last).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : ""}.`,
    offline: "Hors ligne : la synchro reprendra au retour du réseau.", error: "Erreur de synchro.",
  };

  return (
    <section className="stack">
      <div className="row between"><h3>Synchro téléphone ↔ Mac</h3><span className={`chip ${sync.status === "ok" ? "ok" : sync.status === "error" ? "warn" : ""}`}>{sync.status === "ok" ? "Active" : sync.status === "off" ? "Désactivée" : sync.status === "signedout" ? "À connecter" : sync.status === "syncing" ? "En cours" : sync.status === "offline" ? "Hors ligne" : "Erreur"}</span></div>
      <p className="small">{statusText[sync.status]}{sync.email ? ` Compte : ${sync.email}.` : ""}</p>
      {sync.message && <div className="banner bad small">{sync.message}</div>}

      {editCfg ? (
        <div className="card stack">
          <label className="field">Project URL<input className="input" placeholder="https://xxxx.supabase.co" value={url} onChange={(e) => setUrl(e.target.value)} autoCapitalize="off" autoCorrect="off" spellCheck={false} /></label>
          <label className="field">Clé anon public<input className="input" placeholder="eyJhbGciOi…" value={key} onChange={(e) => setKey(e.target.value)} autoCapitalize="off" autoCorrect="off" spellCheck={false} /></label>
          <div className="row">
            <button type="button" className="btn pri" disabled={!/^https:\/\/.+/.test(url.trim()) || key.trim().length < 20} onClick={() => { saveConfig({ url: url.trim(), key: key.trim() }); setEditCfg(false); toast("Projet enregistré"); }}>Enregistrer</button>
            {cfg && <button type="button" className="btn ghost" onClick={() => setEditCfg(false)}>Annuler</button>}
          </div>
        </div>
      ) : sync.status === "signedout" ? (
        <form className="card stack" onSubmit={(e) => { e.preventDefault(); void run(() => signIn(email, pw)); }}>
          <label className="field">Email<input className="input" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
          <label className="field">Mot de passe (6 caractères minimum)<input className="input" type="password" autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} minLength={6} required /></label>
          {msg && <div className="banner small">{msg}</div>}
          <div className="row">
            <button type="submit" className="btn pri" disabled={busy}>Se connecter</button>
            <button type="button" className="btn" disabled={busy || !email || pw.length < 6} onClick={() => void run(() => signUp(email, pw))}>Créer mon compte</button>
          </div>
        </form>
      ) : sync.status !== "off" ? (
        <div className="row">
          <button type="button" className="btn" onClick={() => void syncNow()}>Synchroniser maintenant</button>
          <button type="button" className="btn ghost" onClick={() => void signOut()}>Se déconnecter</button>
        </div>
      ) : null}
      {!editCfg && <button type="button" className="btn sm ghost" style={{ justifySelf: "start" }} onClick={() => setEditCfg(true)}>{cfg ? "Changer de projet Supabase" : "Configurer Supabase"}</button>}
      {cfg && !editCfg && <button type="button" className="btn sm ghost danger" style={{ justifySelf: "start" }} onClick={() => { saveConfig(null); setUrl(""); setKey(""); setEditCfg(true); }}>Désactiver la synchro sur cet appareil</button>}
      <SupabaseGuide />
    </section>
  );
}

function Backup() {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  return (
    <section className="stack">
      <h3>Sauvegarde manuelle</h3>
      <p className="muted small">Sans synchro : copie ta sauvegarde, envoie-la toi (AirDrop, Notes), colle-la dans Importer sur l’autre appareil. Les deux versions sont fusionnées, rien n’est écrasé.</p>
      <div className="row">
        <button type="button" className="btn" onClick={() => { const t = exportBackup(); navigator.clipboard?.writeText(t).then(() => toast("Sauvegarde copiée"), () => { setOpen(true); setText(t); }); }}>Copier ma sauvegarde</button>
        <button type="button" className="btn" onClick={() => { setOpen(true); setText(""); }}>Importer</button>
      </div>
      {open && (
        <div className="stack">
          <textarea className="input num" rows={4} value={text} onChange={(e) => setText(e.target.value)} placeholder="Colle ta sauvegarde ici" style={{ fontSize: 12 }} />
          <button type="button" className="btn pri" disabled={!text.trim()} onClick={() => { if (importBackup(text)) { toast("Données importées et fusionnées"); setOpen(false); } else toast("Ce texte n’est pas une sauvegarde Projet V8"); }}>Fusionner avec mes données</button>
        </div>
      )}
    </section>
  );
}

export function Settings({ open, onClose }: { open: boolean; onClose: () => void }) {
  const s = useAppState();
  const p = s.profile;
  const setP = (patch: Partial<typeof p>) => update((d) => { d.profile = { ...d.profile, ...patch, u: Date.now() }; });
  return (
    <Sheet open={open} onClose={onClose} label="Réglages">
      <div className="row between"><h3>Réglages</h3><button type="button" className="btn sm ghost" onClick={onClose}>Fermer</button></div>
      <section className="stack">
        <h4>Profil</h4>
        <label className="field">Début du plan (un lundi)
          <input className="input" type="date" value={p.start} onChange={(e) => { if (/^\d{4}-\d{2}-\d{2}$/.test(e.target.value)) setP({ start: toISO(mondayOf(parseISO(e.target.value))) }); }} />
        </label>
        <p className="muted small">Semaine 1 commence le {fmtLong(parseISO(p.start))}, fin le {fmtLong(dateOf(p.start, 16, 6))}. Une autre date est ramenée au lundi de sa semaine.</p>
        <label className="field">Poids (kg)<input className="input num" inputMode="decimal" value={p.weight} onChange={(e) => setP({ weight: e.target.value })} /></label>
        <div className="stack"><span className="field">Niveau de départ</span>
          <div className="pick grades">{GRADES.slice(1, 7).map((g) => <button key={g} type="button" className={p.grade === g ? "on" : ""} onClick={() => setP({ grade: g })}>{g}</button>)}</div>
        </div>
      </section>
      <hr style={{ border: 0, borderTop: "1px solid var(--line)", width: "100%" }} />
      <SyncPanel />
      <hr style={{ border: 0, borderTop: "1px solid var(--line)", width: "100%" }} />
      <Backup />
      <p className="muted small">Projet V8 · version {APP_VERSION}</p>
    </Sheet>
  );
}
