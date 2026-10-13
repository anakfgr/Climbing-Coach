import type { Exercise } from "../types";

export const GYM_A: Exercise[] = [
  { id: "pull", name: "Tractions lestées", rest: "3 min", muscles: "Grand dorsal, biceps, trapèzes inférieurs",
    why: "Le tirage pur des blocs : bloquer, remonter les pieds, tenir un mouvement en dévers.",
    sets: { p1: "2-3 × 5 au poids du corps", p2a: "4 × 5", p2b: "4 × 3 lourdes + 3 × 3 explosives", p3: "3 × 3 (charge S11)" },
    how: ["Pars bras tendus, épaules engagées (pas pendu passivement).", "Tire jusqu’à ce que le menton passe la barre.", "Redescends en 2 s, contrôlé, jusqu’à bras tendus.", "En 2B, les explosives : tire le plus vite possible, la poitrine vient chercher la barre."],
    errors: ["Kipping ou élan des jambes", "Demi-amplitude en bas", "Épaules qui montent aux oreilles"],
    progress: "+2,5 kg quand toutes les séries sont à RPE 7.", regress: "Élastique, ou négatives 5 s × 5." },
  { id: "row", name: "Rowing un bras haltère", rest: "2 min", muscles: "Grand dorsal, rhomboïdes, deltoïde postérieur",
    why: "Tirage unilatéral : corrige les déséquilibres gauche/droite et renforce le blocage d’un bras.",
    sets: { p1: "2-3 × 8 par bras", p2a: "3 × 6-8 par bras", p2b: "3 × 6-8 par bras", p3: "2 × 6 par bras" },
    how: ["Genou et main du même côté sur un banc, dos plat.", "Tire le coude vers la hanche, pas vers le plafond.", "Pause 1 s en haut, omoplate serrée.", "Descente lente bras tendu."],
    errors: ["Rotation du buste pour tricher", "Tirer avec le biceps au lieu du dos"],
    progress: "Augmente la charge quand 3 × 8 est propre.", regress: "Rowing à l’élastique." },
  { id: "pulldown", name: "Tirage bras tendus à la poulie", rest: "90 s", muscles: "Grand dorsal, gainage",
    why: "La tension dorsale qui garde les pieds collés en dévers et sur les mouvements de compression.",
    sets: { p1: "2 × 10", p2a: "3 × 10", p2b: "3 × 10", p3: null },
    how: ["Face à la poulie haute, bras tendus, léger buste en avant.", "Pousse la barre jusqu’aux cuisses en gardant les bras droits.", "Remonte lentement sans perdre la tension."],
    errors: ["Plier les coudes", "Cambrer le dos"], progress: "Charge modérée, priorité à la contraction.", regress: "Version élastique." },
  { id: "face", name: "Face pulls", rest: "60 s", muscles: "Coiffe des rotateurs, deltoïde postérieur",
    why: "L’assurance épaules : équilibre tout le tirage vers le bas.",
    sets: { p1: "2 × 15", p2a: "3 × 15", p2b: "3 × 15", p3: "2 × 15" },
    how: ["Corde à hauteur de visage.", "Tire vers le front, coudes hauts, mains qui s’écartent.", "Serre les omoplates 1 s."],
    errors: ["Charge trop lourde", "Coudes qui tombent"], progress: "Reste léger, cherche la qualité.", regress: "Y-T-W à l’élastique : 2 × 10 de chaque." },
  { id: "rwc", name: "Curls inversés du poignet", rest: "60 s", muscles: "Extenseurs du poignet",
    why: "Protège le coude externe (épicondylite), très exposé avec les suspensions.",
    sets: { p1: "2 × 15", p2a: "3 × 15", p2b: "3 × 15", p3: "2 × 15" },
    how: ["Avant-bras posé sur un banc, paume vers le bas, poignet dans le vide.", "Monte le dos de la main lentement, descends en 3 s."],
    errors: ["Charge trop lourde (2 à 4 kg suffisent)", "Mouvement rapide"], progress: "+0,5 à 1 kg toutes les 2 à 3 semaines.", regress: "Élastique." },
  { id: "hammer", name: "Pronation / supination au marteau", rest: "60 s", muscles: "Pronateurs, supinateurs",
    why: "Protège le coude interne (épitrochléite), typique du board et des réglettes.",
    sets: { p1: "2 × 12 par côté", p2a: "2 × 12 par côté", p2b: "2 × 12 par côté", p3: null },
    how: ["Avant-bras sur la cuisse, tiens un marteau par le bout du manche.", "Tourne lentement paume vers le haut, puis paume vers le bas."],
    errors: ["Bouger le coude", "Aller trop vite"], progress: "Tiens le manche plus loin de la tête.", regress: "Tiens le manche plus près de la tête." },
  { id: "hlr", name: "Relevés de jambes suspendu", rest: "60 s", muscles: "Abdominaux, fléchisseurs de hanche",
    why: "Remonter les pieds haut en dévers et garder la tension.",
    sets: { p1: "2 × 8", p2a: "3 × 8-10", p2b: "3 × 8-10", p3: null },
    how: ["Suspendu, épaules engagées.", "Monte les pieds à la barre si possible, sinon genoux à la poitrine.", "Descends lentement, sans balancier."],
    errors: ["Se balancer", "Lâcher la descente"], progress: "Pieds à la barre, puis jambes tendues.", regress: "Genoux à la poitrine." },
];

export const GYM_B: Exercise[] = [
  { id: "dips", name: "Dips", rest: "2 min", muscles: "Pectoraux, triceps, deltoïde antérieur",
    why: "Le rétablissement en sortie de bloc, et l’équilibre pousser/tirer pour les épaules.",
    sets: { p1: "2 × 6-8", p2a: "3 × 6-10", p2b: "3 × 6-10", p3: null },
    how: ["Épaules basses, buste légèrement en avant.", "Descends jusqu’à ce que l’épaule soit au niveau du coude, pas plus bas.", "Pousse jusqu’à bras tendus."],
    errors: ["Descendre trop bas", "Épaules qui montent"], progress: "Leste quand tu fais 3 × 10.", regress: "Pompes si les épaules râlent." },
  { id: "ohp", name: "Développé militaire haltères", rest: "2 min", muscles: "Deltoïdes, triceps, gainage",
    why: "Équilibre tout le tirage et stabilise l’épaule au-dessus de la tête (rétablissements, poussées).",
    sets: { p1: "2 × 8", p2a: "3 × 6-8", p2b: "3 × 6-8", p3: null },
    how: ["Debout, côtes basses, fessiers serrés.", "Pousse les haltères au-dessus de la tête, biceps près des oreilles.", "Redescends à hauteur d’épaules."],
    errors: ["Cambrer le bas du dos", "Coudes trop écartés"], progress: "+1 kg par haltère quand 3 × 8 est propre.", regress: "Assis, dos soutenu." },
  { id: "fl", name: "Progression front lever", rest: "2 min", muscles: "Grand dorsal, abdominaux, gainage total",
    why: "La tension de tout le corps pour garder les pieds sur les prises en dévers.",
    sets: { p1: "3 × 8 s (tuck)", p2a: "4 × 8-10 s", p2b: "4 × 8-10 s", p3: null },
    how: ["Niveaux : tuck, tuck avancé, une jambe, straddle, complet.", "Bras tendus, épaules tirées vers le bas.", "Le dos doit être horizontal, hanches à la même hauteur que les épaules."],
    errors: ["Plier les bras", "Hanches qui chutent"], progress: "Niveau suivant quand tu tiens 4 × 10 s propre.", regress: "Négatives de front lever 3 × 3." },
  { id: "bss", name: "Fentes bulgares", rest: "90 s", muscles: "Quadriceps, fessiers",
    why: "Des jambes fortes pour les pieds hauts et les rétablissements.",
    sets: { p1: "2 × 8 par jambe", p2a: "3 × 8 par jambe", p2b: "3 × 8 par jambe", p3: null },
    how: ["Pied arrière sur un banc.", "Descends le genou arrière vers le sol, buste droit.", "Pousse dans le talon avant."],
    errors: ["Genou avant qui rentre", "Trop lourd avant une grosse séance"], progress: "Charge modérée, RPE 7 max.", regress: "Poids du corps." },
  { id: "rdl", name: "Soulevé de terre roumain", rest: "2 min", muscles: "Ischios, fessiers, lombaires",
    why: "La force des crochets de talon.",
    sets: { p1: "2 × 8", p2a: "3 × 8", p2b: "3 × 8", p3: null },
    how: ["Genoux légèrement fléchis, dos plat.", "Pousse les hanches en arrière, la barre glisse le long des cuisses.", "Sens l’étirement des ischios, puis remonte en poussant les hanches."],
    errors: ["Dos rond", "Plier trop les genoux"], progress: "Charge modérée, RPE 7.", regress: "Haltères, ou une jambe sans charge." },
  { id: "cossack", name: "Squat cosaque", rest: "60 s", muscles: "Adducteurs, hanches",
    why: "Mobilité de hanche sous charge pour les grands écarts et les jetés de pieds.",
    sets: { p1: "2 × 8 par côté", p2a: "2 × 8 par côté", p2b: "2 × 8 par côté", p3: null },
    how: ["Pieds très écartés.", "Descends sur une jambe, l’autre reste tendue pointe vers le haut.", "Talon au sol, buste fier."],
    errors: ["Talon qui décolle", "Descendre trop vite"], progress: "Haltère léger tenu devant.", regress: "Tiens-toi à un poteau." },
  { id: "sp", name: "Gainage latéral, descente de hanche", rest: "45 s", muscles: "Obliques, carré des lombes",
    why: "Les drapeaux et les lolottes.",
    sets: { p1: "2 × 30 s par côté", p2a: "2 × 30 s par côté", p2b: "2 × 30 s par côté", p3: null },
    how: ["Sur l’avant-bras, corps aligné.", "Descends la hanche, remonte au-dessus de l’alignement.", "Lent et contrôlé."],
    errors: ["Hanche qui recule"], progress: "Pied du dessus en l’air.", regress: "Sur les genoux." },
];

export const ALL_EX = [...GYM_A, ...GYM_B];
export const exById = (id: string) => ALL_EX.find((e) => e.id === id);

/** "4 × 3 lourdes + 3 × 3" → 4 sets, "3" reps. "2-3 × 5" → 3 sets. */
export function parseSets(s: string | null): { sets: number; reps: string } {
  if (!s) return { sets: 0, reps: "" };
  const m = s.match(/^(\d+)(?:-(\d+))?\s*×\s*([\d-]+(?:\s*s)?)/);
  if (!m) return { sets: 2, reps: "" };
  return { sets: Number(m[2] ?? m[1]), reps: m[3].replace(/\s/g, "") };
}
export function parseRest(r: string): number {
  const m = r.match(/(\d+)\s*(min|s)/);
  if (!m) return 90;
  return m[2] === "min" ? Number(m[1]) * 60 : Number(m[1]);
}

export const GYM_DO = ["Tractions lestées lourdes, peu de reps", "Rowing un bras, face pulls", "Pousser : dips, développé militaire", "Extenseurs du poignet, pronation/supination", "Gainage : relevés de jambes, front lever", "Jambes modérées pour les pieds hauts"];
export const GYM_DONT = ["Splits bodybuilding à gros volume", "Séries longues jusqu’à la congestion", "Grosse séance jambes la veille d’une grimpe dure", "Tout ce qui laisse les avant-bras cuits", "Curls biceps lourds et grip en plus"];
export const GYM_PHASE_NOTE: Record<string, string> = {
  p1: "Phase 1 : 2 à 3 séries, tractions au poids du corps, RPE 6 à 7, front lever en tuck uniquement. Salle B à partir de la semaine 3.",
  p2a: "Phase 2A : séries complètes, les charges progressent chaque semaine (+2,5 kg aux tractions si propre).",
  p2b: "Phase 2B : les tractions passent à 4 × 3 lourdes + 3 × 3 explosives. Le reste ne change pas.",
  p3: "Phase 3 : uniquement Salle A en maintenance le mardi. La Salle B devient 20 min de gainage le vendredi.",
};
