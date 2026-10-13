import { useSyncExternalStore } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getState, mergeStates, setOnLocalChange, setStateQuiet } from "./store";

/**
 * Optional cloud sync through the user's own free Supabase project.
 * The whole state is one JSON row per user (table user_state, row level security on).
 * Each record carries an update stamp, so pull → merge → push never loses a session logged on another device.
 */

const CFG_KEY = "projetV8.supabase";
export interface SyncConfig { url: string; key: string; }

/** Fill these two values to ship the app pre-configured (the anon key is public by design). */
const BUILT_IN: SyncConfig = { url: "", key: "" };

export type SyncStatus = "off" | "signedout" | "syncing" | "ok" | "offline" | "error";
interface SyncState { status: SyncStatus; email: string; last: number; message: string; }

let sync: SyncState = { status: "off", email: "", last: 0, message: "" };
const listeners = new Set<() => void>();
const set = (p: Partial<SyncState>) => { sync = { ...sync, ...p }; listeners.forEach((l) => l()); };
export const useSync = () => useSyncExternalStore((l) => { listeners.add(l); return () => { listeners.delete(l); }; }, () => sync);

export function getConfig(): SyncConfig | null {
  try {
    const c = JSON.parse(localStorage.getItem(CFG_KEY) || "null");
    if (c?.url && c?.key) return c;
  } catch { /* ignore */ }
  return BUILT_IN.url && BUILT_IN.key ? BUILT_IN : null;
}
export function saveConfig(c: SyncConfig | null) {
  try { c ? localStorage.setItem(CFG_KEY, JSON.stringify(c)) : localStorage.removeItem(CFG_KEY); } catch { /* ignore */ }
  client = null;
  void initSync();
}

let client: SupabaseClient | null = null;
async function getClient(): Promise<SupabaseClient | null> {
  const cfg = getConfig();
  if (!cfg) return null;
  if (client) return client;
  const { createClient } = await import("@supabase/supabase-js"); // loaded only when sync is set up
  client = createClient(cfg.url.trim().replace(/\/$/, ""), cfg.key.trim(), {
    auth: { persistSession: true, autoRefreshToken: true, storageKey: "projetV8.auth" },
  });
  return client;
}

let pushTimer: number | undefined;
let busy = false;

async function userId(c: SupabaseClient) {
  const { data } = await c.auth.getSession();
  return data.session?.user ?? null;
}

/** Pull the server copy, merge it with this device, push the result. */
export async function syncNow() {
  const c = await getClient();
  if (!c) return set({ status: "off" });
  const user = await userId(c);
  if (!user) return set({ status: "signedout", email: "" });
  if (!navigator.onLine) return set({ status: "offline", email: user.email ?? "" });
  if (busy) return;
  busy = true;
  set({ status: "syncing", email: user.email ?? "" });
  try {
    const { data, error } = await c.from("user_state").select("data").eq("user_id", user.id).maybeSingle();
    if (error) throw error;
    const merged = data?.data ? mergeStates(getState(), data.data) : getState();
    if (merged !== getState()) setStateQuiet(merged);
    const { error: upErr } = await c.from("user_state").upsert({ user_id: user.id, data: merged, updated_at: new Date().toISOString() });
    if (upErr) throw upErr;
    set({ status: "ok", last: Date.now(), message: "" });
  } catch (e: any) {
    const msg = String(e?.message || e);
    set({ status: navigator.onLine ? "error" : "offline", message: /relation|user_state/.test(msg) ? "Table user_state introuvable : lance le script SQL du guide." : msg });
  } finally {
    busy = false;
  }
}

function schedulePush() {
  window.clearTimeout(pushTimer);
  pushTimer = window.setTimeout(() => { void syncNow(); }, 1500);
}

export async function signIn(email: string, password: string): Promise<string | null> {
  const c = await getClient();
  if (!c) return "Configure d’abord ton projet Supabase.";
  const { error } = await c.auth.signInWithPassword({ email, password });
  if (error) return /Invalid login/i.test(error.message) ? "Email ou mot de passe incorrect." : /Email not confirmed/i.test(error.message) ? "Confirme d’abord ton email (lien reçu par mail), puis reconnecte-toi." : error.message;
  await syncNow();
  return null;
}
export async function signUp(email: string, password: string): Promise<string | null> {
  const c = await getClient();
  if (!c) return "Configure d’abord ton projet Supabase.";
  const { data, error } = await c.auth.signUp({ email, password });
  if (error) return error.message;
  if (!data.session) return "Compte créé. Clique sur le lien de confirmation reçu par email, puis connecte-toi ici.";
  await syncNow();
  return null;
}
export async function signOut() {
  const c = await getClient();
  await c?.auth.signOut();
  set({ status: "signedout", email: "" });
}

let started = false;
export async function initSync() {
  const c = await getClient();
  if (!c) { set({ status: "off" }); setOnLocalChange(null); return; }
  setOnLocalChange(schedulePush);
  if (!started) {
    started = true;
    document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") void syncNow(); });
    window.addEventListener("online", () => void syncNow());
  }
  await syncNow();
}

export const SETUP_SQL = `create table if not exists public.user_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.user_state enable row level security;
create policy "lire ses données" on public.user_state
  for select using (auth.uid() = user_id);
create policy "créer ses données" on public.user_state
  for insert with check (auth.uid() = user_id);
create policy "modifier ses données" on public.user_state
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);`;
