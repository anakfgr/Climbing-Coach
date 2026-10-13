import type { AppState } from "../types";
import { getDay, WARM } from "../data/program";
import { boardLabel } from "../data/boards";
import { currentGrade } from "./store";
import { dateOf, sessionKey, today } from "./date";

export interface CalendarOptions { climbTime: string; gymTime: string; includeRest: boolean; }

/** "2 h à 2 h 30" → 150, "90 min" → 90, "60 à 75 min" → 75. Uses the longest duration mentioned. */
export function durationMinutes(dur: string): number {
  let best = 0;
  for (const m of dur.matchAll(/(\d+)\s*h(?:\s*(\d+))?/g)) best = Math.max(best, Number(m[1]) * 60 + Number(m[2] ?? 0));
  for (const m of dur.matchAll(/(\d+)\s*min/g)) best = Math.max(best, Number(m[1]));
  return best || 60;
}

const pad = (n: number) => String(n).padStart(2, "0");
const stamp = (d: Date) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
const esc = (t: string) => t.replace(/<[^>]+>/g, "").replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
/** RFC 5545 lines are folded at 75 octets. */
function fold(line: string): string {
  const bytes = new TextEncoder().encode(line);
  if (bytes.length <= 75) return line;
  const out: string[] = [];
  let cur = "";
  for (const ch of line) {
    if (new TextEncoder().encode(cur + ch).length > (out.length ? 74 : 75)) { out.push(cur); cur = ch; }
    else cur += ch;
  }
  out.push(cur);
  return out.join("\r\n ");
}

/** Every remaining session of the plan as calendar events, with a reminder at 20:00 the evening before. */
export function buildICS(s: AppState, o: CalendarOptions, appUrl: string): { ics: string; count: number } {
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Projet V8//FR", "CALSCALE:GREGORIAN", "METHOD:PUBLISH", "X-WR-CALNAME:Projet V8"];
  const t0 = today();
  const fw = s.profile.firstWeek ?? 1;
  const grade = currentGrade(s);
  const now = stamp(new Date());
  let count = 0;
  for (let w = fw; w <= 16; w++) {
    for (let d = 0; d < 7; d++) {
      const day = getDay(w, d);
      if (day.type === "rest" && !o.includeRest) continue;
      const date = dateOf(s.profile.start, w, d);
      if (date < t0) continue;
      const [hh, mm] = (day.type === "gym" ? o.gymTime : o.climbTime).split(":").map(Number);
      const start = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hh || 0, mm || 0);
      const mins = day.type === "rest" ? 30 : durationMinutes(day.dur);
      if (start.getTime() < Date.now()) continue; // already started or past
      const end = new Date(start.getTime() + mins * 60000);
      const parts = [
        `${day.phase.short} · ${day.phase.name} · semaine ${w}`,
        day.rpe ? `RPE cible ${day.rpe}` : "",
        ...day.banners,
        day.warm ? `Échauffement : ${WARM[day.warm === "finger" ? "climb" : day.warm].name}` : "",
        day.gym ? `Séance ${day.gym} de salle` : "",
        ...day.blocks.map((b) => { const bl = boardLabel(b, w, grade); return `• ${b.t}${b.d ? ` (${b.d})` : ""}${bl ? ` : ${bl}` : ""}`; }),
        `Ouvrir Projet V8 : ${appUrl}`,
      ].filter(Boolean);
      // Reminder at 20:00 the evening before.
      const before = start.getHours() * 60 + start.getMinutes() + 4 * 60;
      lines.push(
        "BEGIN:VEVENT",
        `UID:${sessionKey(w, d)}-${stamp(start)}@projet-v8`,
        `DTSTAMP:${now}`,
        `DTSTART:${stamp(start)}`,
        `DTEND:${stamp(end)}`,
        fold(`SUMMARY:${esc(`${day.type === "rest" ? "Mobilité" : day.title} · Projet V8`)}`),
        fold(`DESCRIPTION:${esc(parts.join("\n"))}`),
        fold(`URL:${appUrl}`),
        "BEGIN:VALARM", "ACTION:DISPLAY", fold(`DESCRIPTION:${esc(`Demain : ${day.title}`)}`), `TRIGGER:-PT${before}M`, "END:VALARM",
        "END:VEVENT",
      );
      count++;
    }
  }
  lines.push("END:VCALENDAR");
  return { ics: lines.join("\r\n") + "\r\n", count };
}

/** Share sheet on iPhone when possible (lets you pick Calendar), plain download otherwise. */
export async function deliverICS(ics: string): Promise<"shared" | "downloaded" | "cancelled"> {
  const file = new File([ics], "projet-v8.ics", { type: "text/calendar" });
  const nav = navigator as Navigator & { canShare?: (d: { files: File[] }) => boolean };
  if (nav.canShare?.({ files: [file] }) && /iPhone|iPad|Android/i.test(navigator.userAgent)) {
    try { await navigator.share({ files: [file], title: "Projet V8" }); return "shared"; }
    catch (e: any) { if (e?.name === "AbortError") return "cancelled"; }
  }
  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url; a.download = "projet-v8.ics";
  document.body.appendChild(a); a.click(); a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 4000);
  return "downloaded";
}
