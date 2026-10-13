export const DAY_MS = 864e5;

export function parseISO(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}
export function toISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export function today(): Date {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate());
}
export function mondayOf(d: Date): Date {
  const r = new Date(d);
  r.setDate(r.getDate() - ((r.getDay() + 6) % 7));
  return r;
}
/** Day index in the plan (0 = week 1 Monday). */
export function planIndex(start: string, d: Date = today()): number {
  return Math.round((d.getTime() - parseISO(start).getTime()) / DAY_MS);
}
export function weekDay(idx: number) {
  return { week: Math.floor(idx / 7) + 1, dow: ((idx % 7) + 7) % 7 };
}
export function dateOf(start: string, week: number, dow: number): Date {
  const d = parseISO(start);
  d.setDate(d.getDate() + (week - 1) * 7 + dow);
  return d;
}
export const fmtLong = (d: Date) => d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
export const fmtShort = (d: Date) => d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
export const fmtTime = (s: number) => {
  s = Math.max(0, Math.ceil(s));
  return s >= 60 ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}` : String(s);
};
export const sessionKey = (week: number, dow: number) => `w${week}d${dow}`;
export function parseKey(k: string) {
  const m = k.match(/^w(\d+)d(\d)$/);
  return m ? { week: Number(m[1]), dow: Number(m[2]) } : null;
}
