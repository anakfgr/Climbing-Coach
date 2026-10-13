import { BOARDS, BOARD_GRADE_NOTE, boardPlan } from "../data/boards";
import { currentGrade, useAppState } from "../lib/store";
import type { Block } from "../types";

/** "Which board, which angle, which filters" for a board block, scaled to the climber's current grade. */
export function BoardPlanCard({ block, week, compact }: { block: Block; week: number; compact?: boolean }) {
  const s = useAppState();
  if (block.board === "spray") {
    const b = BOARDS.spray;
    return (
      <div className="board-plan">
        <div className="row between"><b>{b.name}</b><span className="chip">Option</span></div>
        <p className="small">{b.use}</p>
        {!compact && <ul className="clean small">{b.tips.map((t) => <li key={t}>{t}</li>)}</ul>}
      </div>
    );
  }
  const p = boardPlan(week, currentGrade(s));
  return (
    <div className="board-plan">
      <div className="row between">
        <span className="row" style={{ gap: 8 }}><span className={`board-dot b-${p.board.id}`} /><b>{p.board.name}</b>{p.board.id !== "moon" && <span className="chip num">{p.angle}°</span>}</span>
        {p.easy ? <span className="chip warn">Séance légère</span> : <span className="chip">{p.count}</span>}
      </div>
      <p className="small">{p.board.use}</p>
      <div className="stack" style={{ gap: 4 }}>
        <span className="eyebrow">Dans l’{p.board.app.replace("App ", "app ")}</span>
        <ol className="clean small">{p.filters.map((f) => <li key={f}>{f}</li>)}</ol>
      </div>
      <p className="small"><b>{p.count}</b>, {p.attempts}, 3 min de repos.</p>
      {!compact && (
        <details className="fold">
          <summary>Conseils {p.board.name}</summary>
          <div className="inner"><ul className="clean small">{p.board.tips.map((t) => <li key={t}>{t}</li>)}</ul><p className="muted small">{BOARD_GRADE_NOTE}</p></div>
        </details>
      )}
    </div>
  );
}
