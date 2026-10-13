import type { Block, Day, Phase, PhaseId, ResolvedDay, TimerKey, TimerPreset, WarmKey, WarmProtocol } from "../types";

export const PHASES: Phase[] = [
  { id: "p1", short: "Phase 1", name: "Reconstruction", weeks: [1, 2, 3, 4],
    goal: "Reconditionner doigts, coudes et épaules, et retrouver une qualité de mouvement de V6 sur du V4. Tu sentiras que tu pourrais en faire plus : c’est voulu. Rien au-dessus de RPE 8." },
  { id: "p2a", short: "Phase 2A", name: "Force", weeks: [5, 6, 7, 8],
    goal: "Construire la force maximale des doigts et du tirage. C’est ici que le V6 revient. Longs repos, peu d’essais, effort total. Semaine 8 = décharge." },
  { id: "p2b", short: "Phase 2B", name: "Puissance", weeks: [9, 10, 11, 12],
    goal: "Transformer la force en vitesse et en puissance dynamique, plus l’endurance de puissance pour enchaîner les mouvements durs. Semaine 12 = décharge." },
  { id: "p3", short: "Phase 3", name: "Performance", weeks: [13, 14, 15, 16],
    goal: "Encaisser la force. Volume réduit d’un tiers, presque tous les efforts durs vont dans les projets V6 à V7. S15 = semaine de croix, S16 = décharge et retest." },
];

export const phaseOf = (w: number): Phase => PHASES.find((p) => p.weeks.includes(w)) ?? PHASES[3];
export const DOW = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
export const DOW_SHORT = ["L", "M", "M", "J", "V", "S", "D"];
export const DELOAD = [8, 12, 16];
export const TEST_WEEKS = [4, 8, 12, 16];
export const FONT: Record<string, string> = { V3: "6A", V4: "6B", V5: "6C", V6: "7A", V7: "7A+", V8: "7B", V9: "7C" };
export const TYPE_LABEL = { climb: "Grimpe", gym: "Salle", rest: "Repos", test: "Tests" } as const;

export const TIMERS: Record<TimerKey, TimerPreset> = {
  max: { name: "Suspensions max · 6 × 10 s", sets: 6, work: 10, rest: 180 },
  heavy: { name: "Suspensions lourdes · 6 × 7 s", sets: 6, work: 7, rest: 180 },
  maint: { name: "Maintenance · 4 × 7 s", sets: 4, work: 7, rest: 180 },
  prep: { name: "Prépa doigts · 5 × 10 s", sets: 5, work: 10, rest: 120 },
  fwarm: { name: "Échauffement doigts · 3 × 10 s", sets: 3, work: 10, rest: 30 },
  limit: { name: "Repos entre essais · 4 min", sets: 1, work: 0, rest: 240 },
  r3: { name: "Repos · 3 min", sets: 1, work: 0, rest: 180 },
  r5: { name: "Repos projet · 5 min", sets: 1, work: 0, rest: 300 },
  r44: { name: "Repos 4×4 · 4 min", sets: 1, work: 0, rest: 240 },
};

export const WARM: Record<WarmKey, WarmProtocol> = {
  climb: { name: "Échauffement grimpe", dur: "20 à 25 min", steps: [
    ["Cardio · 5 min", "Corde à sauter, rameur ou marche rapide en pente sur tapis. Objectif : une légère transpiration."],
    ["Articulations · 5 min", "Cercles de bras 10 avant + 10 arrière · écartés élastique 2 × 15 · tractions scapulaires (bras tendus, épaules vers le bas et l’arrière) 2 × 8 · cercles de poignets et poing fermé / doigts écartés × 20 · squat profond 30 s · grenouille 30 s."],
    ["Grimpe facile · 10 à 15 min", "4 à 6 blocs V0 à V2 sur bacs, puis 2 à 3 en V3, puis 1 à 2 en V4. Commence main ouverte et réduis la taille des prises progressivement."],
  ], example: [
    "Blocs 1-2 : V0 sur gros bacs, tout en main ouverte, respiration calme.",
    "Blocs 3-4 : V1 à V2 avec quelques plats et pinces larges.",
    "Blocs 5-6 : V2 vertical sur réglettes larges, en semi-arqué.",
    "Blocs 7-8 : V3 avec un léger dévers et un mouvement plus ample.",
    "Bloc 9 : un V4 que tu connais bien, à 80 % de ton effort.",
  ] },
  finger: { name: "Échauffement doigts", dur: "5 min", timer: "fwarm", steps: [
    ["50 % du poids", "Réglette 20 mm, pieds au sol ou sur une chaise : 3 × 10 s, 30 s de repos."],
    ["70 % du poids", "Même réglette : 2 × 10 s."],
    ["85 % du poids", "Même réglette : 1 × 7 s."],
    ["Repos 2 min", "Puis attaque les séries principales. Le pourcentage se règle avec les pieds : plus tu pousses dans le sol, moins tu portes."],
  ] },
  express: { name: "Échauffement express", dur: "12 min", steps: [
    ["Articulations · 3 min", "Cercles de bras, écartés élastique 1 × 15, tractions scapulaires 1 × 8, cercles de poignets."],
    ["Grimpe · 9 min", "3 blocs V0-V1, 2 blocs V2, 1 bloc V3, 1 bloc V4. 30 s de repos entre chaque. Pas de réglettes avant le 4e bloc."],
  ] },
  gym: { name: "Échauffement salle", dur: "10 min", steps: [
    ["Cardio · 3 min", "Rameur ou vélo."],
    ["Épaules", "Écartés élastique 2 × 15 · suspension passive 2 × 20 s · tractions scapulaires 1 × 8."],
    ["Séries d’approche", "1 à 2 séries plus légères du premier exercice (par ex. 3 tractions au poids du corps avant les lestées)."],
  ] },
  coolGym: { name: "Retour au calme salle", dur: "10 min", steps: [
    ["Flush · 3 à 5 min", "Rameur ou vélo très facile, jusqu’à ce que les avant-bras et le dos ne soient plus congestionnés."],
    ["Décompression · 1 min", "Suspension passive à la barre de traction, pieds au sol si besoin : 2 × 20 s, épaules relâchées."],
    ["Avant-bras", "Fléchisseurs (paume vers le haut, tire les doigts en arrière) et extenseurs (paume vers le bas, tire le poing vers le bas) : 2 × 30 s chaque bras."],
    ["Dorsaux et pectoraux", "Mains sur un montant du rack, recule les hanches pour étirer les dorsaux 30 s par côté · avant-bras contre le rack, tourne le buste pour les pectoraux 30 s par côté."],
    ["Hanches et ischios", "Pigeon sur un banc ou au sol, ischios jambe tendue sur le banc : 45 s par côté."],
    ["Antagonistes · 2 min", "Extensions des doigts avec un élastique 2 × 20 (ou contre la main opposée) · écartés élastique 1 × 15."],
  ] },
  cool: { name: "Retour au calme", dur: "10 à 15 min", steps: [
    ["Flush · 3 à 5 min", "Traversée facile ou désescalade sur gros bacs jusqu’à ce que la congestion disparaisse."],
    ["Avant-bras", "Fléchisseurs (paume vers le haut, tire les doigts en arrière) et extenseurs (paume vers le bas, tire le poing vers le bas) : 2 × 30 s chaque bras."],
    ["Haut du corps", "Dorsaux à la barre ou au chambranle, pectoraux dans l’encadrement d’une porte : 30 s chacun."],
    ["Hanches et jambes", "Pigeon et ischios : 45 s par côté."],
    ["Antagonistes · 2 min", "Extensions des doigts contre un élastique épais 2 × 20 · curls inversés poignet haltère léger 1 × 15."],
  ] },
  mobility: { name: "Mobilité jour de repos", dur: "20 min", steps: [
    ["Dos", "Chat-vache × 10 · thread the needle × 8 par côté."],
    ["Squat profond", "3 × 45 s."],
    ["Grenouille", "2 × 60 s. La clé pour les crochets de talon et les grands écarts."],
    ["Écart assis, buste en avant", "2 × 60 s."],
    ["Dislocations d’épaules à l’élastique", "2 × 10."],
    ["Pigeon", "60 s par côté."],
  ] },
};

const B = (t: string, d: string, items: string[], extra: Partial<Block> = {}): Block => ({ t, d, items, ...extra });
const HALF = "Réglette 20 mm, semi-arqué";

export const DAYS: Record<PhaseId, Day[]> = {
  p1: [
    { dow: 0, type: "climb", title: "Volume technique", dur: "90 min", rpe: "6-7", warm: "climb", cool: true, blocks: [
      B("Exercices techniques", "40 min · V1 à V3", [
        "<b>Pieds silencieux :</b> 5 blocs, zéro bruit de pied. Un frottement = tu désescalades et tu recommences.",
        "<b>Mains en suspens :</b> 4 blocs, ta main plane 2 s au-dessus de chaque prise avant de la saisir.",
        "<b>Bras tendus :</b> 4 blocs en dévers, bras tendus, tu tournes avec les hanches.",
        "<b>Désescalade :</b> 4 blocs en aller-retour."]),
      B("Volume à vue", "20 min · V3 à V4", ["6 à 8 blocs jamais faits, un seul essai chacun, puis tu passes au suivant."])] },
    { dow: 1, type: "gym", title: "Salle A · introduction", dur: "60 min", rpe: "6-7", warm: "gym", cool: true, gym: "A",
      intro: "Séance A, mais 2 séries par exercice à RPE 6 à 7 et tractions au poids du corps. Tu apprends les mouvements, tu ne charges pas encore." },
    { dow: 2, type: "rest", title: "Repos actif", dur: "20 à 60 min", warm: "mobility", blocks: [
      B("Footing optionnel", "30 à 45 min", ["Allure conversation : tu peux respirer par le nez. Pas de fractionné."])] },
    { dow: 3, type: "climb", title: "Pyramide de niveaux", dur: "90 min", rpe: "7-8", warm: "climb", cool: true, blocks: [
      B("Pyramide", "50 min · 2 à 3 min de repos", ["5 × V3", "4 × V4", "1 × V5, 3 essais maximum"], { weeks: [1] }),
      B("Pyramide", "50 min · 2 à 3 min de repos", ["4 × V3", "3 × V4", "2 × V5, jusqu’à 4 essais chacun", "1 × V5 ou V6, 3 essais maximum, puis tu passes"], { weeks: [2, 3, 4] }),
      B("Gainage", "10 min", ["Relevés de genoux suspendu 3 × 10", "Hollow body 3 × 20 s"])] },
    { dow: 4, type: "rest", title: "Repos complet", dur: "", weeks: [1, 2], warm: "mobility", intro: "Repos complet, ou 20 min de mobilité si tu as envie de bouger." },
    { dow: 4, type: "gym", title: "Salle B · introduction", dur: "60 min", rpe: "6-7", weeks: [3, 4], warm: "gym", cool: true, gym: "B", intro: "Séance B, 2 séries par exercice à RPE 6 à 7." },
    { dow: 5, type: "climb", title: "Volume + essais max", dur: "2 h", rpe: "7-8", warm: "climb", cool: true, blocks: [
      B("Circuit de styles", "40 min · V3 à V4", [
        "2 blocs de chaque : dalle, réglettes verticales, dévers, compression, mouvement dynamique.",
        "Note le style le plus dur pour toi : c’est ta faiblesse, on va la travailler."]),
      B("Essais max", "30 min · V5", ["2 blocs V5 dans ton style le plus faible.", "5 min de travail, 4 min de repos."], { kind: "attempts", rest: 240, timer: "limit" }),
      B("Prépa doigts", "10 min", ["5 × 10 s pieds assistés sur 20 mm à environ 85 % du poids du corps, 2 min de repos.", "Prépare les tendons aux vraies suspensions de la Phase 2."],
        { weeks: [3], kind: "hang", timer: "prep", hang: { sets: 5, work: 10, rest: 120, grip: HALF } })] },
    { dow: 6, type: "rest", title: "Repos complet", dur: "", intro: "Grasse mat’ et bien manger. Si tu cours, c’est le jour de la sortie longue facile (jusqu’à 90 min) : lundi n’est que de la technique dans cette phase." },
  ],
  p2a: [
    { dow: 0, type: "climb", title: "Doigts + bloc limite", dur: "2 h", rpe: "9-10", warm: "finger", cool: true, blocks: [
      B("Suspensions max", "25 min", [
        "Réglette 20 mm, semi-arqué (index à annulaire pliés à 90°, pouce libre).",
        "<b>6 séries × 10 s, 3 min de repos.</b>",
        "Charge : tu pourrais tenir 13 s (3 s en réserve). Ajoute du poids au baudrier, ou retire-en avec une poulie.",
        "Épaules engagées, coudes légèrement fléchis, corps immobile."], { kind: "hang", timer: "max", hang: { sets: 6, work: 10, rest: 180, grip: HALF } }),
      B("Pause", "10 min", ["Bois, mange une banane."]),
      B("Bloc limite", "45 min · V5 à V6", [
        "3 à 4 blocs à ton maximum.", "4 à 6 essais par bloc, 3 à 5 min de repos entre les essais.",
        "Mouvement impossible : travaille-le isolé, puis enchaîne les sections.",
        "Stop quand 2 essais d’affilée sont moins bons que le précédent."], { kind: "attempts", rest: 240, timer: "limit" })] },
    { dow: 1, type: "gym", title: "Salle A · force", dur: "60 à 75 min", rpe: "7-8", warm: "gym", cool: true, gym: "A", intro: "Séance A complète : 4 séries sur les tractions, 3 sur le reste." },
    { dow: 2, type: "rest", title: "Repos actif", dur: "20 à 90 min", warm: "mobility", blocks: [
      B("Course optionnelle", "jusqu’à 90 min", ["La sortie longue passe ici à partir de la Phase 2.", "Allure conversation. Le tempo et le fractionné concurrencent ta récupération de grimpe."])] },
    { dow: 3, type: "climb", title: "Board puissance", dur: "90 min", rpe: "8-9", warm: "climb", cool: true, blocks: [
      B("Board", "50 min", [
        "Kilter, Moon ou le mur le plus raide. Commence par 4 blocs faciles sur le board.",
        "6 à 8 blocs à ta limite sur board (compte 1 à 2 niveaux plus dur qu’en bloc).",
        "4 essais max par bloc, 3 min de repos.",
        "Gainage total : orteils qui tirent dans les prises, hanches près du mur."], { kind: "attempts", rest: 180, timer: "r3" }),
      B("Blocages", "10 min", ["À la barre : 3 × 5 s à 90° puis à 120°, par bras.", "Pied sur une box pour s’aider si nécessaire."])] },
    { dow: 4, type: "gym", title: "Salle B", dur: "60 min", rpe: "7", warm: "gym", cool: true, gym: "B", intro: "Séance B complète, 3 séries, RPE 7." },
    { dow: 5, type: "climb", title: "Projet + flash", dur: "2 h à 2 h 30", rpe: "9-10", warm: "climb", cool: true, blocks: [
      B("Projet", "60 min · V6", ["1 à 2 blocs V6, idéalement dans ton style faible.", "Crux d’abord, puis enchaîne depuis le départ.", "4 à 5 min de repos entre les vrais essais."], { kind: "attempts", rest: 270, timer: "limit" }),
      B("Volume flash", "30 min · V4", ["6 à 8 blocs V4, un seul essai chacun. Entraîne la lecture et l’exécution du premier coup."], { kind: "attempts", rest: 120 })] },
    { dow: 6, type: "rest", title: "Repos complet", dur: "", intro: "Pas de grimpe, pas de course. Marche, nage tranquille ou rien du tout. Dors 8 à 9 h : lundi, les doigts doivent être frais." },
  ],
  p2b: [
    { dow: 0, type: "climb", title: "Suspensions lourdes + limite dynamique", dur: "2 h", rpe: "9-10", warm: "finger", cool: true, blocks: [
      B("Suspensions lourdes", "25 min", [HALF + ".", "<b>6 séries × 7 s, 3 min de repos.</b>", "2 s en réserve (tu pourrais tenir 9 s). Pars de ta charge S7 + 2,5 à 5 kg."],
        { kind: "hang", timer: "heavy", hang: { sets: 6, work: 7, rest: 180, grip: HALF } }),
      B("Pause", "10 min", ["Bois, mange."]),
      B("Bloc limite dynamique", "45 min · V6", ["3 à 4 blocs avec grands mouvements, jetés ou lancés.", "4 à 6 essais chacun, 3 à 5 min de repos.", "Engagement total : l’hésitation fait rater les mouvements dynamiques."], { kind: "attempts", rest: 240, timer: "limit" })] },
    { dow: 1, type: "gym", title: "Salle A · puissance", dur: "60 min", rpe: "8", warm: "gym", cool: true, gym: "A", intro: "Tractions lestées 4 × 3 (plus lourd qu’en 2A), puis tractions explosives 3 × 3 au poids du corps, 3 min de repos. Le reste de A en 3 séries." },
    { dow: 2, type: "rest", title: "Repos actif", dur: "20 à 90 min", warm: "mobility", blocks: [B("Course optionnelle", "jusqu’à 90 min", ["Facile, sortie longue autorisée."])] },
    { dow: 3, type: "climb", title: "Board + campus", dur: "90 min", rpe: "8-9", warm: "climb", cool: true, blocks: [
      B("Intro campus", "15 min", [
        "Seulement si tu n’as eu aucune douleur aux doigts en Phase 2A.",
        "<b>S9-10 :</b> campus pieds posés sur les bacs du board, 5 séries de 6 mouvements, 2 min de repos.",
        "<b>S11 :</b> campus sur les plus grosses barres, échelles 1-2-3-4-5 en mains alternées, 5 séries, 3 min de repos.",
        "Le moindre inconfort aux doigts : stop, retour aux pieds posés."], { weeks: [9, 10, 11] }),
      B("Board", "40 min", ["5 à 6 blocs à ta limite board, 4 essais max chacun, 3 min de repos."], { kind: "attempts", rest: 180, timer: "r3" })] },
    { dow: 4, type: "gym", title: "Salle B", dur: "60 min", rpe: "7-8", warm: "gym", cool: true, gym: "B", intro: "Séance B complète, 3 séries. Passe au niveau de front lever suivant si l’actuel est solide." },
    { dow: 5, type: "climb", title: "Projet + 4×4", dur: "2 h 30", rpe: "9-10", warm: "climb", cool: true, blocks: [
      B("Projet", "60 min · V6 à V7", ["Crux d’abord, puis enchaînement, 4 à 5 min de repos."], { kind: "attempts", rest: 270, timer: "limit" }),
      B("Pause", "10 min", ["Bois, mange."]),
      B("4×4", "25 min · V3 à V4", ["Choisis 4 blocs voisins.", "Grimpe les 4 à la suite sans repos = 1 tour.", "4 min de repos, 4 tours au total."], { weeks: [9, 10, 11], timer: "r44" })] },
    { dow: 6, type: "rest", title: "Repos complet", dur: "", intro: "Repos total. Sommeil 8 à 9 h." },
  ],
  p3: [
    { dow: 0, type: "climb", title: "Maintenance + projet", dur: "2 h", rpe: "9-10", warm: "finger", cool: true, blocks: [
      B("Suspensions de maintenance", "15 min", ["4 séries × 7 s à ta charge S11, 3 min de repos.", "Assez pour garder la force, pas assez pour te fatiguer."],
        { kind: "hang", timer: "maint", hang: { sets: 4, work: 7, rest: 180, grip: HALF } }),
      B("Séance projet", "60 min · V6 à V7", ["Répète le crux, puis 4 à 6 essais complets avec 5 min de repos."], { kind: "attempts", rest: 300, timer: "r5" })] },
    { dow: 1, type: "gym", title: "Salle A · maintenance", dur: "45 min", rpe: "7", warm: "gym", cool: true, gym: "A", intro: "Uniquement les 4 exercices ci-dessous, à la charge S11. Rien d’autre." },
    { dow: 2, type: "rest", title: "Repos actif", dur: "20 à 60 min", warm: "mobility", blocks: [B("Course optionnelle", "60 min max", ["Facile. Pas de sortie longue dans cette phase pour protéger samedi."])] },
    { dow: 3, type: "climb", title: "Board ou 2e projet", dur: "75 min", rpe: "8", warm: "climb", cool: true, blocks: [
      B("Au choix selon ta forme", "45 min", ["<b>Frais :</b> 45 min de board limite (5 blocs, 4 essais chacun).", "<b>Un peu fatigué :</b> 45 min sur un second projet dans un style différent."], { kind: "attempts", rest: 180, timer: "r3" })] },
    { dow: 4, type: "rest", title: "Repos ou gainage", dur: "0 à 20 min", warm: null, blocks: [
      B("Gainage optionnel", "20 min · pas de doigts", ["Relevés de jambes suspendu 3 × 8", "Front lever (ton niveau) 3 × 8 s", "Hollow body 2 × 30 s"])] },
    { dow: 5, type: "climb", title: "Jour de croix", dur: "2 h à 2 h 30", rpe: "10", warm: "climb", cool: true,
      intro: "Échauffement prolongé à 30 min, en finissant par 2 blocs V5 pour être complètement allumé.", blocks: [
      B("Essais d’enchaînement", "75 min", ["Projet principal d’abord, tant que tu es frais.", "Visualise toute la séquence avant chaque essai. 5 min de repos.", "3 essais d’affilée sans progrès : passe au second projet."], { kind: "attempts", rest: 300, timer: "r5" })] },
    { dow: 6, type: "rest", title: "Repos complet", dur: "", intro: "Repos total." },
  ],
};

export const TEST_DAY: Day = {
  dow: 5, type: "test", title: "Tests de référence", dur: "90 min", rpe: "Max sur chaque test", warm: "finger", cool: true,
  intro: "Frais, après un échauffement complet. Les chiffres disent si le plan marche bien avant les niveaux. Ils s’enregistrent dans Suivi.",
  blocks: [
    B("Suspension max 20 mm, 10 s", "", ["Semi-arqué. Pars du poids du corps et ajoute 2,5 kg par essai, 3 min de repos, jusqu’à ne plus tenir 10 s.", "Note la dernière charge réussie (négatif si assisté)."], { timer: "r3" }),
    B("Traction lestée 1RM", "", ["Après l’échauffement salle, ajoute 2,5 à 5 kg par répétition unique, 3 min de repos."]),
    B("Front lever", "", ["Le niveau le plus dur tenu 10 s : tuck, tuck avancé, une jambe, straddle, complet."]),
    B("Blocage un bras à 90°", "", ["Secondes tenues, bras le plus faible."]),
    B("Bloc le plus dur et flash", "", ["Ton bloc le plus dur enchaîné cette semaine et ton meilleur flash."]),
  ],
};

export const WEEK_NOTE: Record<number, string> = {
  1: "Tout à RPE 6-7. Attends-toi à des courbatures aux avant-bras et aux épaules. Niveau max : V4.",
  2: "La pyramide ajoute l’essai V5/V6. Salle toujours à 2 séries.",
  3: "Nouveau : Salle B le vendredi et prépa doigts le samedi.",
  4: "Samedi = tests de référence à la place des essais max. Salle à 3 séries.",
  5: "Suspensions au poids du corps (ou assistées). Tractions 4 × 5 au poids du corps. Habitue-toi aux repos longs.",
  6: "Suspensions +2,5 kg si la S5 était propre. Tractions 4 × 5 à +2,5 kg. Essais V6 le lundi.",
  7: "Suspensions +2,5 kg encore si propre. Tractions 4 × 5 à +5 kg. Premières croix V6.",
  8: "Décharge : suspensions 4 séries à la charge S6, salle 2 séries. Toute la grimpe à RPE 7, pas de limite. Tests samedi.",
  9: "Suspensions lourdes : charge S7 + 2,5 à 5 kg. Tractions 4 × 3 à +2,5 kg par rapport à S7. Campus pieds posés, premiers projets V6 à V7.",
  10: "+2,5 kg aux suspensions si propre. Tractions +2,5 kg. 4×4 en V3.",
  11: "+2,5 kg si propre. Tractions +2,5 kg. Échelles au campus, 4×4 en V4.",
  12: "Décharge : suspensions 4 séries à la charge S10, salle 2 séries, ni campus ni 4×4, tout à RPE 7. Tests samedi.",
  13: "Choisis 2 projets : un V6 dans ton style fort, un V6 à V7 dans ton style faible.",
  14: "Même structure. Si le V6 passe, remplace-le par un V7.",
  15: "Semaine de croix. Lundi : 3 séries de suspensions et 45 min de projet. Jeudi : 30 min facile. Samedi : tout pour la croix.",
  16: "Décharge et retest. Lundi et jeudi à RPE 6. Samedi : tests complets. Ensuite, redémarre la Phase 2A avec tes nouvelles charges.",
};

export function getDay(week: number, dow: number): ResolvedDay {
  const phase = phaseOf(week);
  let base = DAYS[phase.id].find((d) => d.dow === dow && (!d.weeks || d.weeks.includes(week)))!;
  if (TEST_WEEKS.includes(week) && dow === 5) base = TEST_DAY;
  const blocks = (base.blocks ?? []).filter((b) => !b.weeks || b.weeks.includes(week)).map((b) => {
    if (b.kind === "hang" && b.hang && week === 15) return { ...b, hang: { ...b.hang, sets: 3 } };
    if (b.kind === "hang" && b.hang && DELOAD.includes(week)) return { ...b, hang: { ...b.hang, sets: 4 } };
    return b;
  });
  const banners: string[] = [];
  if (DELOAD.includes(week) && base.type !== "rest" && base.type !== "test")
    banners.push(week === 16 ? "Semaine de décharge : RPE 6 maximum, moitié du volume, aucun effort limite." : "Semaine de décharge : moitié du volume, RPE 7 maximum, pas de bloc limite. C’est là que ton corps encaisse le travail.");
  if (week === 15 && dow === 0) banners.push("Semaine de croix : seulement 3 séries de suspensions, puis 45 min de projet.");
  if (week === 15 && dow === 3) banners.push("Semaine de croix : 30 min faciles seulement, garde tout pour samedi.");
  if (week === 15 && dow === 5) banners.push("Le samedi pour lequel tu t’entraînes depuis 15 semaines. Tout pour la croix.");
  if (week === 4 && dow === 5) banners.push("Fin de la Phase 1 : premier relevé de tes chiffres.");
  return { ...base, week, phase, blocks, banners };
}

export const coolKey = (d: { type: string }): WarmKey => (d.type === "gym" ? "coolGym" : "cool");

export const isTraining = (d: { type: string }) => d.type !== "rest";

export const COACH_RULES: [string, string][] = [
  ["48 h entre deux séances doigts max.", "Suspensions, bloc limite et board comptent tous."],
  ["Jamais 3 jours de grimpe d’affilée.", ""],
  ["Arrête un essai quand tu tombes moins bien, pas mieux.", "Les essais fatigués apprennent de mauvais mouvements et blessent."],
  ["Repos entre essais limite : 3 à 5 min.", "Chronomètre. La plupart des grimpeurs se reposent deux fois moins et stagnent."],
  ["Semi-arqué et main ouverte d’abord.", "Arqué complet seulement sur les projets, jamais en exercice."],
  ["Course facile seulement les jours de repos.", "Pas de course dans les 24 h avant une séance doigts du lundi."],
];

export const RPE_SCALE: [string, string, string][] = [
  ["3-4", "Tu peux discuter, aucune congestion", "Échauffements, retour au calme, mobilité"],
  ["5-6", "Concentré, tu pourrais en faire beaucoup plus", "Volume technique, décharges"],
  ["7-8", "Dur, 2 à 3 reps ou mouvements en réserve", "Salle, suspensions, board"],
  ["9-10", "Tout ce que tu as", "Bloc limite et projets uniquement"],
];

export const WARNING_SIGNS = [
  "Douleur vive ou localisée à la base d’un doigt, ou un « pop » : stop immédiat, 1 à 2 semaines de repos, kiné si ça dure plus de 5 jours.",
  "Douleur au coude interne qui dure jusqu’au lendemain : plus de board pendant une semaine, garde les curls inversés.",
  "Pincement d’épaule sur les gastons ou inversées : évite ces mouvements, ajoute des face pulls.",
  "Raideur des doigts le matin plus de 30 min : surcharge, prends un jour de repos en plus.",
];

export const RUNNING = [
  "<b>Phase 1 :</b> sortie longue le dimanche (jusqu’à 90 min), footing facile le mercredi.",
  "<b>Phases 2A et 2B :</b> la sortie longue passe au mercredi. Rien le dimanche pour arriver frais lundi.",
  "<b>Phase 3 :</b> 60 min max le mercredi, pour protéger le samedi.",
  "Toujours en endurance fondamentale (respiration nasale). Pas de fractionné ni de tempo pendant le cycle.",
  "Une course de plus de 60 min = journée à ~3 000 kcal (voir Nutrition).",
];

export const SINGAPORE = [
  "L’humidité tue l’adhérence : grimpe tôt le matin ou après 19 h, magnésie liquide sous la magnésie sèche, une serviette.",
  "Tu transpires plus qu’à Paris : 500 à 750 ml d’eau par heure de grimpe, électrolytes les jours chauds.",
  "Peau : ponce les callosités deux fois par semaine et mets un baume le soir. Un bout de doigt fendu = une semaine perdue.",
];
