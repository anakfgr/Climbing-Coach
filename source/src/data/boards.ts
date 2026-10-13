import type { BoardId, Grade } from "../types";
import { DELOAD, FONT, phaseOf } from "./program";
import { GRADES } from "./nutrition";

/** The boards at Lighthouse Climbing (Pasir Panjang), from the gym's facility pages. */
export interface BoardInfo {
  id: BoardId;
  name: string;
  app: string;
  specs: string;
  use: string;
  tips: string[];
}

export const BOARDS: Record<BoardId, BoardInfo> = {
  kilter: {
    id: "kilter", name: "Kilter Board", app: "App Kilter Board",
    specs: "12 × 12 ft, angle réglable de 0 à 70°",
    use: "Puissance et gainage : grosses prises bien orientées, mouvements amples, pieds précis sur le kickboard.",
    tips: ["Règle l’angle dans l’app avant de chercher les blocs : la liste dépend de l’angle.", "Les blocs avec peu de répétitions ont des cotations peu fiables.", "Utilise les circuits de l’app pour garder tes blocs du jour."],
  },
  tension: {
    id: "tension", name: "Tension Board", app: "App Tension Board",
    specs: "8 × 12 ft, disposition miroir, angle réglable de 0 à 70°",
    use: "Précision des pieds et symétrie : prises en bois peu adhérentes, tout passe par la tension et le placement des pieds.",
    tips: ["Disposition miroir : chaque bloc existe aussi dans l’autre sens. Fais les deux côtés pour corriger tes déséquilibres.", "Le bois glisse plus que la résine : magnésie fine et peau sèche.", "Commence 5 à 10° moins raide que sur la Kilter."],
  },
  moon: {
    id: "moon", name: "MoonBoard 2016", app: "App MoonBoard",
    specs: "Jeu de prises 2016, angle standard de 40°",
    use: "Force des doigts : petites réglettes, peu de pieds. Le plus exigeant pour les doigts des quatre.",
    tips: ["Choisis le jeu de prises « MoonBoard 2016 » dans l’app, sinon les blocs ne correspondent pas.", "Filtre « Benchmarks » : les blocs de référence, cotations les plus fiables.", "Cotation en Font : jamais 2 séances MoonBoard en moins de 48 h."],
  },
  spray: {
    id: "spray", name: "Spray wall", app: "Pas d’app",
    specs: "Mur couvert de prises, sans blocs tracés",
    use: "Tes propres blocs : 4×4, travail du style faible, répétition d’un mouvement précis.",
    tips: ["Prends une photo de tes blocs maison pour les retrouver.", "Pour les 4×4 : 4 blocs voisins, 6 à 10 mouvements chacun.", "Règle simple : mains sur les prises choisies, pieds libres, pour aller vite."],
  },
};

const ROTATION: Record<number, { board: BoardId; angle: number }> = {
  5: { board: "kilter", angle: 40 }, 6: { board: "moon", angle: 40 }, 7: { board: "kilter", angle: 45 }, 8: { board: "tension", angle: 30 },
  9: { board: "tension", angle: 40 }, 10: { board: "kilter", angle: 45 }, 11: { board: "moon", angle: 40 }, 12: { board: "kilter", angle: 30 },
  13: { board: "kilter", angle: 40 }, 14: { board: "moon", angle: 40 }, 15: { board: "kilter", angle: 35 }, 16: { board: "tension", angle: 30 },
};

export interface BoardPlan {
  board: BoardInfo; angle: number; low: Grade; high: Grade;
  count: string; attempts: string; easy: boolean; filters: string[];
}

const shift = (g: Grade, n: number): Grade => GRADES[Math.max(1, Math.min(GRADES.length - 1, GRADES.indexOf(g) + n))];

/** What to set in the board's app for this week's board session, scaled to the current grade. */
export function boardPlan(week: number, grade: Grade): BoardPlan {
  const r = ROTATION[week] ?? ROTATION[5];
  const easy = DELOAD.includes(week) || week === 15;
  const p3 = phaseOf(week).id === "p3";
  const low = easy ? shift(grade, -2) : shift(grade, -1);
  const high = easy ? shift(grade, -1) : p3 ? shift(grade, 1) : grade;
  const b = BOARDS[r.board];
  // The 2016 set's easiest problems start around 6A+.
  const moonLow = FONT[low] === "6A" ? "6A+" : FONT[low];
  const range = r.board === "moon" ? `${moonLow} à ${FONT[high]} (Font, soit ${low} à ${high})` : `${low} à ${high}`;
  const filters =
    r.board === "kilter" ? [`Angle ${r.angle}°`, `Niveau ${range}`, "Tri par qualité (étoiles), puis par répétitions", "Au moins 20 répétitions par bloc"]
    : r.board === "tension" ? [`Disposition miroir, angle ${r.angle}°`, `Niveau ${range}`, "Tri par qualité", "Chaque bloc dans les deux sens"]
    : r.board === "moon" ? ["Jeu de prises MoonBoard 2016, 40°", "Filtre Benchmarks", `Niveau ${range}`]
    : [];
  return { board: b, angle: r.angle, low, high, easy, filters, count: easy ? "4 blocs" : "6 à 8 blocs", attempts: easy ? "2 essais max, RPE 7" : "4 essais max par bloc" };
}

export const BOARD_GRADE_NOTE = "Les boards cotent en général 1 niveau plus dur que les blocs de salle, parfois 2 sur la MoonBoard. Un V5 sur board vaut souvent un V6 de salle.";
