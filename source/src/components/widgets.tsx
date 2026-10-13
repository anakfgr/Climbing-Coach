import { QUICK_PROTEIN } from "../data/nutrition";
import { toISO, today } from "../lib/date";
import { update, useAppState } from "../lib/store";

export function ProteinTracker({ compact }: { compact?: boolean }) {
  const s = useAppState();
  const k = toISO(today());
  const day = s.protein[k];
  const items = day && !day.del ? day.items : [];
  const total = items.reduce((a, x) => a + x[1], 0);
  const goal = 130, min = 110;
  const write = (next: [string, number][]) => update((d) => {
    d.protein[k] = { items: next, u: Date.now() };
    const keys = Object.keys(d.protein).sort();
    while (keys.length > 21) delete d.protein[keys.shift()!];
  });
  return (
    <div className="stack">
      <div className="pt-head">
        <span className="v num">{total}</span>
        <span className="muted">g de protéines aujourd’hui · objectif {min} à {goal} g</span>
        {total >= min && <span className="chip ok">Objectif atteint</span>}
      </div>
      <div className="pt-bar" aria-hidden="true"><i style={{ width: `${Math.min(100, (total / goal) * 100)}%` }} /><u style={{ left: `${(min / goal) * 100}%` }} /></div>
      {items.length > 0 && (
        <div className="eaten">
          {items.map((x, i) => (
            <button key={i} type="button" aria-label={`Retirer ${x[0]}`} onClick={() => write(items.filter((_, j) => j !== i))}>{x[0]} · {x[1]} g</button>
          ))}
        </div>
      )}
      <div className="quick">
        {(compact ? QUICK_PROTEIN.slice(0, 6) : QUICK_PROTEIN).map((q) => (
          <button key={q[0]} type="button" onClick={() => write([...items, q])}>{q[0]}<b>{q[1]}</b></button>
        ))}
      </div>
    </div>
  );
}

/** Small line chart over dated points, with an optional target band. */
export function LineChart({ points, band, unit, empty = "Pas encore de mesure" }: { points: { x: string; y: number }[]; band?: [number, number]; unit?: string; empty?: string }) {
  const W = 320, H = 160, pl = 34, pr = 14, pt = 18, pb = 26;
  const ys = points.map((p) => p.y).concat(band ?? []);
  let lo = ys.length ? Math.min(...ys) : 0, hi = ys.length ? Math.max(...ys) : 10;
  if (hi - lo < 4) { const m = (hi + lo) / 2; lo = m - 2; hi = m + 2; }
  const pad = (hi - lo) * 0.12; lo = Math.floor(lo - pad); hi = Math.ceil(hi + pad);
  const n = Math.max(points.length, 2);
  const X = (i: number) => pl + (points.length === 1 ? (W - pl - pr) / 2 : (i * (W - pl - pr)) / (n - 1));
  const Y = (v: number) => pt + ((hi - v) / (hi - lo)) * (H - pt - pb);
  const ticks = [lo, Math.round((lo + hi) / 2), hi];
  const labelEvery = Math.ceil(points.length / 6);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Graphique${unit ? " en " + unit : ""}`}>
      {band && <rect x={pl} y={Y(band[1])} width={W - pl - pr} height={Math.max(0, Y(band[0]) - Y(band[1]))} fill="var(--accent-soft)" />}
      {ticks.map((v) => (
        <g key={v}>
          <line x1={pl} x2={W - pr} y1={Y(v)} y2={Y(v)} stroke="var(--line)" />
          <text x={pl - 6} y={Y(v) + 4} textAnchor="end" fontSize="11" fill="var(--muted)" fontFamily="IBM Plex Mono, monospace">{v}</text>
        </g>
      ))}
      {points.map((p, i) => (i % labelEvery === 0 || i === points.length - 1) && (
        <text key={"l" + i} x={X(i)} y={H - 8} textAnchor="middle" fontSize="10.5" fill="var(--muted)" fontFamily="IBM Plex Mono, monospace">{p.x}</text>
      ))}
      {points.length > 1 && <polyline points={points.map((p, i) => `${X(i)},${Y(p.y)}`).join(" ")} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinejoin="round" />}
      {points.map((p, i) => {
        const last = i === points.length - 1;
        return (
          <g key={"p" + i}>
            <circle cx={X(i)} cy={Y(p.y)} r={last ? 5 : 3.5} fill={last ? "var(--accent)" : "var(--surface)"} stroke="var(--accent)" strokeWidth="2" />
            {last && <text x={X(i)} y={Y(p.y) - 10} textAnchor="middle" fontSize="12" fontWeight="600" fill="var(--ink)" fontFamily="IBM Plex Mono, monospace">{p.y > 0 && unit?.includes("kg") ? "+" : ""}{p.y}</text>}
          </g>
        );
      })}
      {!points.length && <text x={(W + pl) / 2} y={H / 2} textAnchor="middle" fontSize="12" fill="var(--muted)">{empty}</text>}
    </svg>
  );
}
