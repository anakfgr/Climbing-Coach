import type { Grade, Style } from "../types";

export interface DayTarget { name: string; when: string; kcal: number; p: string; c: string; f: string; pg: number; cg: number; fg: number; }

export const TARGETS: Record<"hard" | "light" | "run", DayTarget> = {
  hard: { name: "Grosse séance", when: "Lundi, jeudi, samedi", kcal: 2700, p: "110-130", c: "350-380", f: "75-80", pg: 120, cg: 365, fg: 78 },
  light: { name: "Salle ou repos", when: "Mardi, mercredi, vendredi, dimanche", kcal: 2300, p: "110-130", c: "250-280", f: "75-80", pg: 120, cg: 265, fg: 78 },
  run: { name: "Course > 60 min", when: "Jour de sortie longue", kcal: 3000, p: "110-130", c: "420+", f: "75-80", pg: 120, cg: 420, fg: 78 },
};

export const SAMPLE_DAY: [string, string, string][] = [
  ["07:30", "Overnight oats : 80 g d’avoine, 250 ml de lait, 150 g de yaourt grec, banane, miel", "25"],
  ["12:30", "Hawker : chicken rice avec extra poulet et un œuf, ou yong tau foo avec tofu et poisson + nouilles", "35"],
  ["16:30", "Avant la grimpe : 2 tranches de pain complet au beurre de cacahuète, banane", "8"],
  ["17:00", "Collagène ou gélatine 15 g + un verre de jus d’orange (jours de doigts uniquement)", ""],
  ["Séance", "500 à 750 ml d’eau par heure, électrolytes si tu transpires beaucoup", ""],
  ["20:30", "Juste après : whey avec du lait, ou 400 ml de lait chocolaté, + un fruit", "25"],
  ["21:30", "Dîner : 150 g de saumon ou haut de cuisse de poulet, 1,5 tasse de riz, légumes, huile d’olive", "35"],
  ["23:00", "Optionnel : 150 g de yaourt grec ou de cottage cheese", "12"],
];

export const QUICK_PROTEIN: [string, number][] = [
  ["3 œufs", 18], ["Yaourt grec 150 g", 15], ["Whey", 25], ["Chicken rice + extra", 35], ["Saumon 150 g", 33],
  ["Poulet 150 g", 38], ["Tofu ferme 150 g", 18], ["Cottage 150 g", 17], ["Thon (1 boîte)", 25], ["Lait 250 ml", 8],
  ["Yong tau foo", 25], ["Satay ×10", 30],
];

export const SUPPLEMENTS: [string, string, string][] = [
  ["Créatine monohydrate", "3-5 g/jour", "Le complément le mieux prouvé pour la puissance et les efforts durs répétés. Compte 0,5 à 1 kg d’eau en plus."],
  ["Collagène ou gélatine + vitamine C", "15 g + ~50 mg", "45 à 60 min avant suspensions et board. Pourrait soutenir l’adaptation des tendons ; preuves prometteuses mais encore limitées."],
  ["Whey", "25-30 g", "Après les séances. Pratique, pas magique."],
  ["Caféine", "60-150 mg", "45 min avant les séances limite. À éviter le soir si elle te coûte du sommeil."],
];

export const HAWKER = ["Chicken rice, extra poulet", "Sliced fish soup avec riz", "Yong tau foo (tofu, poisson, œuf)", "Economic rice : 2 protéines + 1 légume", "Ban mian avec œuf", "Satay"];
export const MARKET = ["Œufs", "Yaourt grec, cottage cheese", "Thon ou saumon en boîte", "Tofu ferme", "Hauts de cuisse de poulet", "Whey", "Avoine, riz, bananes"];
export const RECOVERY = [
  "<b>Dors 8 à 9 h.</b> C’est là que tendons et muscles s’adaptent. Rien d’autre ne compte autant.",
  "<b>Hydratation :</b> 2,5 à 3,5 L par jour à Singapour, plus les jours de course.",
  "<b>Peau :</b> lime les callosités deux fois par semaine, baume le soir, ongles courts.",
  "<b>Les semaines de décharge font partie de l’entraînement.</b> S8, S12 et S16 : résiste à l’envie d’y aller fort.",
  "<b>Test du matin :</b> doigts raides, mauvais sommeil ou zéro motivation ? Remplace la séance du jour par la suivante plus facile.",
];

/* ---------- Tests ---------- */
export interface TestDef { id: string; name: string; unit?: string; ref: string; type: "num" | "sel"; opts?: string[]; band?: [number, number]; }
export const TESTS: TestDef[] = [
  { id: "bw", name: "Poids", unit: "kg", ref: "58 à 61", type: "num", band: [58, 61] },
  { id: "hang", name: "Suspension 20 mm, 10 s", unit: "kg ajoutés", ref: "+18 à 28", type: "num", band: [18, 28] },
  { id: "pull", name: "Traction lestée 1RM", unit: "kg ajoutés", ref: "+30 à 35", type: "num", band: [30, 35] },
  { id: "fl", name: "Front lever (10 s)", ref: "Tuck avancé à straddle", type: "sel", opts: ["", "Tuck", "Tuck avancé", "Une jambe", "Straddle", "Complet"] },
  { id: "lock", name: "Blocage un bras 90°", unit: "s, bras faible", ref: "10+", type: "num" },
  { id: "send", name: "Bloc le plus dur", ref: "V7 à V8", type: "sel", opts: ["", "V3", "V4", "V5", "V6", "V7", "V8", "V9"] },
  { id: "flash", name: "Meilleur flash", ref: "V6", type: "sel", opts: ["", "V3", "V4", "V5", "V6", "V7", "V8"] },
];
export const TEST_COLS = [0, 4, 8, 12, 16];

/* ---------- Climbing vocab ---------- */
export const GRADES: Grade[] = ["V2", "V3", "V4", "V5", "V6", "V7", "V8", "V9"];
export const STYLES: { id: Style; label: string }[] = [
  { id: "dalle", label: "Dalle" }, { id: "reglettes", label: "Réglettes" }, { id: "devers", label: "Dévers" },
  { id: "compression", label: "Compression" }, { id: "dynamique", label: "Dynamique" }, { id: "board", label: "Board" },
];
/** Hold colours used to set circuits in most gyms. */
export const HOLD_COLORS: { id: string; label: string; hex: string }[] = [
  { id: "jaune", label: "Jaune", hex: "#E8C431" }, { id: "vert", label: "Vert", hex: "#3E9B4F" }, { id: "bleu", label: "Bleu", hex: "#2F6FD6" },
  { id: "rouge", label: "Rouge", hex: "#D23B32" }, { id: "violet", label: "Violet", hex: "#7A4CC2" }, { id: "rose", label: "Rose", hex: "#E46CA8" },
  { id: "orange", label: "Orange", hex: "#E9822E" }, { id: "noir", label: "Noir", hex: "#1B1B1B" }, { id: "blanc", label: "Blanc", hex: "#F4F4F0" },
];
