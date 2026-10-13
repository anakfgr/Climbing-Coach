import { useEffect, useState } from "react";
import { currentGrade, useAppState } from "./lib/store";
import { initSync, useSync } from "./lib/sync";
import { FONT } from "./data/program";
import { Icon, ToastProvider } from "./components/ui";
import { Today } from "./screens/Today";
import { Plan } from "./screens/Plan";
import { Projects } from "./screens/Projects";
import { Library } from "./screens/Library";
import { Nutrition } from "./screens/Nutrition";
import { Progress } from "./screens/Progress";
import { Settings } from "./screens/Settings";
import { Onboarding } from "./screens/Onboarding";
import { SessionRunner } from "./screens/SessionRunner";

const TABS = [
  { id: "today", label: "Aujourd’hui", icon: "today" },
  { id: "plan", label: "Plan", icon: "plan" },
  { id: "projects", label: "Projets", icon: "projects" },
  { id: "library", label: "Biblio", icon: "library" },
  { id: "food", label: "Nutrition", icon: "food" },
  { id: "track", label: "Suivi", icon: "track" },
] as const;
type Tab = (typeof TABS)[number]["id"];

const readHash = (): Tab => {
  const h = location.hash.slice(1);
  return (TABS.some((t) => t.id === h) ? h : "today") as Tab;
};

function Shell({ settings, setSettings }: { settings: boolean; setSettings: (v: boolean) => void }) {
  const s = useAppState();
  const sync = useSync();
  const [tab, setTab] = useState<Tab>(readHash);
  const [anchor, setAnchor] = useState<string | undefined>();
  const [session, setSession] = useState<{ w: number; d: number } | null>(null);
  const [updateReady, setUpdateReady] = useState(false);
  useEffect(() => {
    const on = () => setUpdateReady(true);
    window.addEventListener("app-update", on);
    return () => window.removeEventListener("app-update", on);
  }, []);

  useEffect(() => { void initSync(); }, []);
  useEffect(() => {
    const on = () => setTab(readHash());
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);

  const go = (t: string, a?: string) => {
    setAnchor(a);
    setTab(t as Tab);
    history.replaceState(null, "", "#" + t);
    if (!a) window.scrollTo(0, 0);
  };
  const start = (w: number, d: number) => setSession({ w, d });

  const grade = currentGrade(s);
  const ladder = ["V4", "V5", "V6", "V7", "V8"];
  const pip = sync.status === "ok" ? "var(--accent)" : sync.status === "error" ? "var(--danger)" : sync.status === "signedout" ? "var(--warn)" : null;

  return (
    <>
      <header className="top">
        <div className="wrap">
          <div className="brand">Projet <b>V8</b></div>
          <div className="ladder" aria-label={`Niveau actuel ${grade}, objectif V8`}>
            {ladder.map((g) => <span key={g} title={`${g} ≈ ${FONT[g]}`} className={g === grade ? "on" : g === "V8" ? "goal" : ""}>{g}</span>)}
          </div>
          <button type="button" className="iconbtn" aria-label="Réglages et synchro" onClick={() => setSettings(true)}>
            <Icon name="gear" />{pip && <span className="pip" style={{ background: pip }} />}
          </button>
        </div>
      </header>

      {updateReady && !session && (
        <div className="wrap" style={{ paddingTop: 12 }}>
          <div className="banner info row between">
            <span>Nouvelle version de l’app disponible.</span>
            <button type="button" className="btn sm pri" onClick={() => location.reload()}>Mettre à jour</button>
          </div>
        </div>
      )}
      <main className="wrap">
        {tab === "today" && <Today onStart={start} onGo={go} />}
        {tab === "plan" && <Plan onStart={start} onGo={go} />}
        {tab === "projects" && <Projects />}
        {tab === "library" && <Library anchor={anchor} />}
        {tab === "food" && <Nutrition />}
        {tab === "track" && <Progress />}
      </main>

      <nav className="tabs" aria-label="Sections">
        <div className="wrap">
          {TABS.map((t) => (
            <button key={t.id} type="button" className={tab === t.id ? "on" : ""} aria-current={tab === t.id ? "page" : undefined} onClick={() => go(t.id)}>
              <Icon name={t.icon} />{t.label}
            </button>
          ))}
        </div>
      </nav>

      <Settings open={settings} onClose={() => setSettings(false)} />
      {session && <SessionRunner week={session.w} dow={session.d} onClose={() => setSession(null)} />}
    </>
  );
}

export default function App() {
  const s = useAppState();
  const [settings, setSettings] = useState(false);
  return (
    <ToastProvider>
      {s.onboarded ? <Shell settings={settings} setSettings={setSettings} /> : (
        <>
          <Onboarding onOpenSettings={() => setSettings(true)} />
          <Settings open={settings} onClose={() => setSettings(false)} />
        </>
      )}
    </ToastProvider>
  );
}
