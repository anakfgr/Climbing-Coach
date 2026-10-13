import type { ReactNode } from "react";

/* One consistent line style for every drawing: body in ink, working limbs in accent,
   far-side limbs faded, equipment in muted tones. All coordinates live in a 200 × 160 box. */
type P = [number, number];
const pts = (p: P[]) => p.map((x) => x.join(",")).join(" ");

const Limb = ({ p, hot, back, w = 7 }: { p: P[]; hot?: boolean; back?: boolean; w?: number }) => (
  <polyline points={pts(p)} fill="none" stroke={hot ? "var(--accent)" : "var(--ink)"} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" opacity={back ? 0.4 : 1} />
);
const Head = ({ c, r = 9 }: { c: P; r?: number }) => <circle cx={c[0]} cy={c[1]} r={r} fill="var(--ink)" />;
const Bar = ({ a, b, w = 4 }: { a: P; b: P; w?: number }) => <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="var(--muted)" strokeWidth={w} strokeLinecap="round" />;
const Box = ({ x, y, w, h, r = 3 }: { x: number; y: number; w: number; h: number; r?: number }) => (
  <rect x={x} y={y} width={w} height={h} rx={r} fill="var(--sunk)" stroke="var(--line)" strokeWidth="1.5" />
);
const Weight = ({ x, y, w = 14, h = 9 }: { x: number; y: number; w?: number; h?: number }) => <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx="2" fill="var(--ink)" />;
const Floor = ({ y = 152 }: { y?: number }) => <line x1="12" y1={y} x2="188" y2={y} stroke="var(--line)" strokeWidth="2" />;
const Move = ({ d, both }: { d: string; both?: boolean }) => (
  <path d={d} fill="none" stroke="var(--accent)" strokeWidth="2.2" strokeDasharray="5 4" strokeLinecap="round" markerEnd="url(#cc-arrow)" markerStart={both ? "url(#cc-arrow-s)" : undefined} />
);
const Note = ({ x, y, children, anchor = "start" }: { x: number; y: number; children: ReactNode; anchor?: "start" | "end" | "middle" }) => (
  <text x={x} y={y} fontSize="9.5" fill="var(--muted)" textAnchor={anchor} fontFamily="IBM Plex Sans, system-ui, sans-serif" fontWeight="500">{children}</text>
);

const Defs = () => (
  <defs>
    <marker id="cc-arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
      <path d="M0 0L10 5L0 10z" fill="var(--accent)" />
    </marker>
    <marker id="cc-arrow-s" viewBox="0 0 10 10" refX="3" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
      <path d="M0 0L10 5L0 10z" fill="var(--accent)" />
    </marker>
  </defs>
);

const Frame = ({ children, label, vb = "0 0 200 160" }: { children: ReactNode; label: string; vb?: string }) => (
  <svg viewBox={vb} role="img" aria-label={label}><Defs />{children}</svg>
);

/* ---------- Gym exercises ---------- */
const PullUp = () => (
  <Frame label="Traction lestée, position haute">
    <Bar a={[40, 20]} b={[160, 20]} w={5} />
    <line x1="100" y1="84" x2="100" y2="102" stroke="var(--muted)" strokeWidth="2" />
    <rect x="86" y="102" width="28" height="10" rx="2" fill="var(--muted)" />
    <Limb p={[[100, 82], [95, 112], [96, 142]]} />
    <Limb p={[[100, 82], [105, 112], [104, 142]]} back />
    <Limb p={[[100, 26], [100, 82]]} />
    <Limb p={[[86, 30], [114, 30]]} />
    <Head c={[100, 13]} />
    <Limb p={[[86, 30], [72, 50], [80, 21]]} hot />
    <Limb p={[[114, 30], [128, 50], [120, 21]]} hot />
    <Move d="M152 120 V64" />
  </Frame>
);
const Row = () => (
  <Frame label="Rowing un bras sur banc">
    <Floor />
    <Box x={56} y={96} w={96} h={10} />
    <Bar a={[66, 106]} b={[66, 152]} w={3} /><Bar a={[142, 106]} b={[142, 152]} w={3} />
    <Limb p={[[86, 72], [72, 94], [56, 94]]} back />
    <Limb p={[[138, 68], [140, 94]]} back />
    <Limb p={[[86, 72], [138, 66]]} />
    <Head c={[154, 62]} />
    <Limb p={[[86, 72], [92, 112], [90, 150]]} />
    <Limb p={[[134, 67], [114, 48], [118, 76]]} hot />
    <Weight x={118} y={80} w={18} h={9} />
    <Move d="M100 98 V60" />
  </Frame>
);
const Pulldown = () => (
  <Frame label="Tirage bras tendus à la poulie">
    <Floor />
    <circle cx="30" cy="16" r="7" fill="var(--sunk)" stroke="var(--muted)" strokeWidth="2" />
    <line x1="30" y1="16" x2="104" y2="94" stroke="var(--muted)" strokeWidth="1.5" />
    <Limb p={[[124, 96], [130, 124], [132, 150]]} back />
    <Limb p={[[121, 44], [124, 96]]} />
    <Limb p={[[124, 96], [118, 124], [116, 150]]} />
    <Head c={[126, 30]} />
    <Limb p={[[120, 48], [104, 94]]} hot />
    <Bar a={[96, 95]} b={[112, 95]} w={4} />
    <Move d="M72 40 Q 70 70 92 86" />
  </Frame>
);
const FacePull = () => (
  <Frame label="Face pull à la poulie">
    <Floor />
    <circle cx="30" cy="44" r="7" fill="var(--sunk)" stroke="var(--muted)" strokeWidth="2" />
    <line x1="30" y1="44" x2="100" y2="42" stroke="var(--muted)" strokeWidth="1.5" />
    <Limb p={[[122, 98], [128, 124], [130, 150]]} back />
    <Limb p={[[120, 48], [122, 98]]} />
    <Limb p={[[122, 98], [116, 124], [114, 150]]} />
    <Head c={[124, 34]} />
    <Limb p={[[118, 52], [110, 30], [100, 42]]} hot />
    <Move d="M52 60 H 92" />
  </Frame>
);
const WristCurl = () => (
  <Frame label="Curl inversé du poignet">
    <Box x={24} y={86} w={98} h={16} />
    <Limb p={[[34, 80], [116, 80]]} w={11} />
    <Limb p={[[116, 80], [138, 62]]} hot w={10} />
    <rect x="132" y="44" width="13" height="26" rx="3" fill="var(--ink)" />
    <Move d="M160 92 Q 166 70 152 52" />
    <Note x={70} y={122} anchor="middle">paume vers le bas</Note>
  </Frame>
);
const Hammer = () => (
  <Frame label="Pronation et supination au marteau">
    <Box x={18} y={96} w={108} h={18} r={9} />
    <Limb p={[[30, 88], [110, 88]]} w={11} />
    <circle cx="118" cy="88" r="9" fill="var(--ink)" />
    <line x1="118" y1="86" x2="118" y2="34" stroke="var(--muted)" strokeWidth="5" strokeLinecap="round" />
    <rect x="104" y="22" width="28" height="13" rx="3" fill="var(--accent)" />
    <Move d="M90 52 A 30 11 0 0 0 148 52" both />
  </Frame>
);
const LegRaise = () => (
  <Frame label="Relevé de jambes suspendu">
    <Bar a={[60, 16]} b={[140, 16]} w={5} />
    <Limb p={[[100, 18], [100, 54]]} />
    <Head c={[114, 48]} />
    <Limb p={[[100, 54], [100, 98]]} />
    <Limb p={[[100, 98], [128, 92], [156, 88]]} back />
    <Limb p={[[100, 98], [130, 98], [158, 98]]} hot />
    <Move d="M120 146 Q 168 140 168 108" />
  </Frame>
);
const Dips = () => (
  <Frame label="Dips aux barres parallèles">
    <Floor />
    <Bar a={[70, 84]} b={[150, 84]} w={5} />
    <Bar a={[80, 84]} b={[80, 152]} w={3} /><Bar a={[140, 84]} b={[140, 152]} w={3} />
    <Limb p={[[98, 110], [100, 134], [80, 140]]} />
    <Limb p={[[108, 64], [98, 110]]} />
    <Head c={[118, 50]} />
    <Limb p={[[108, 68], [88, 66], [106, 84]]} hot />
    <Move d="M166 124 V 70" />
  </Frame>
);
const Press = () => (
  <Frame label="Développé militaire haltères">
    <Floor />
    <Limb p={[[100, 100], [92, 126], [90, 150]]} />
    <Limb p={[[100, 100], [108, 126], [110, 150]]} />
    <Limb p={[[100, 52], [100, 100]]} />
    <Limb p={[[86, 56], [114, 56]]} />
    <Head c={[100, 40]} />
    <Limb p={[[86, 56], [76, 36], [84, 16]]} hot />
    <Limb p={[[114, 56], [124, 36], [116, 16]]} hot />
    <Weight x={84} y={12} w={26} h={9} /><Weight x={116} y={12} w={26} h={9} />
    <Move d="M160 70 V 22" />
  </Frame>
);
const Split = () => (
  <Frame label="Fente bulgare">
    <Floor />
    <Box x={14} y={94} w={48} h={12} />
    <Limb p={[[96, 96], [76, 140], [44, 96]]} back />
    <Limb p={[[98, 48], [96, 96]]} />
    <Head c={[100, 33]} />
    <Limb p={[[96, 96], [126, 118], [124, 150]]} hot />
    <Limb p={[[98, 54], [100, 78], [100, 100]]} />
    <Weight x={100} y={104} w={10} h={14} />
    <Move d="M160 74 V 124" />
  </Frame>
);
const Rdl = () => (
  <Frame label="Soulevé de terre roumain">
    <Floor />
    <Limb p={[[86, 94], [102, 122], [98, 150]]} hot />
    <Limb p={[[86, 94], [140, 72]]} />
    <Head c={[154, 68]} />
    <Limb p={[[136, 74], [132, 120]]} />
    <circle cx="132" cy="128" r="15" fill="var(--sunk)" stroke="var(--ink)" strokeWidth="3" />
    <circle cx="132" cy="128" r="3" fill="var(--ink)" />
    <Move d="M178 104 Q 180 66 162 50" />
  </Frame>
);
const Cossack = () => (
  <Frame label="Squat cosaque">
    <Floor />
    <Limb p={[[88, 106], [50, 112], [62, 150]]} hot />
    <Limb p={[[100, 106], [130, 128], [160, 150]]} />
    <line x1="160" y1="150" x2="164" y2="138" stroke="var(--ink)" strokeWidth="6" strokeLinecap="round" />
    <Limb p={[[88, 106], [100, 106]]} />
    <Limb p={[[94, 106], [94, 58]]} />
    <Head c={[94, 42]} />
    <Limb p={[[84, 62], [94, 86]]} /><Limb p={[[104, 62], [94, 86]]} />
    <Weight x={94} y={90} w={12} h={12} />
  </Frame>
);
const SidePlank = () => (
  <Frame label="Gainage latéral avec descente de hanche">
    <Floor />
    <Limb p={[[52, 124], [52, 148], [80, 148]]} />
    <Limb p={[[52, 124], [110, 132], [140, 140], [168, 147]]} hot />
    <Head c={[40, 114]} />
    <Limb p={[[56, 122], [80, 112], [104, 126]]} back />
    <Move d="M112 98 V 124" both />
  </Frame>
);

/* ---------- Front lever progression ---------- */
export function FrontLeverStrip() {
  const labels = ["Tuck", "Tuck avancé", "Une jambe", "Straddle", "Complet"];
  return (
    <svg viewBox="0 0 400 112" role="img" aria-label="Progression du front lever, du tuck au complet">
      <line x1="6" y1="14" x2="394" y2="14" stroke="var(--muted)" strokeWidth="4" strokeLinecap="round" />
      {labels.map((lab, i) => {
        const x = 26 + i * 80;
        const sh: P = [x + 4, 48];
        const pelvis: P = i === 0 ? [x + 26, 54] : [x + 36, 48];
        const legs: { p: P[]; back?: boolean }[] =
          i === 0 ? [{ p: [pelvis, [x + 20, 34], [x + 36, 36]] }]
          : i === 1 ? [{ p: [pelvis, [x + 32, 30], [x + 50, 32]] }]
          : i === 2 ? [{ p: [pelvis, [x + 32, 30], [x + 50, 32]], back: true }, { p: [pelvis, [x + 74, 48]] }]
          : i === 3 ? [{ p: [pelvis, [x + 70, 40]] }, { p: [pelvis, [x + 70, 58]], back: true }]
          : [{ p: [pelvis, [x + 76, 48]] }];
        return (
          <g key={lab}>
            <Limb p={[[x, 16], sh]} w={5} />
            <circle cx={x - 7} cy={52} r={6.5} fill="var(--ink)" />
            <Limb p={[sh, pelvis]} w={5} hot />
            {legs.map((l, k) => <Limb key={k} p={l.p} w={5} back={l.back} hot={!l.back} />)}
            <text x={x + 28} y={100} textAnchor="middle" fontSize="12" fontWeight="600" fill={i === 4 ? "var(--accent)" : "var(--muted)"} fontFamily="IBM Plex Sans, system-ui, sans-serif">{lab}</text>
          </g>
        );
      })}
    </svg>
  );
}

/* ---------- Hangboard ---------- */
export const HangPosture = () => (
  <Frame label="Position de suspension sur poutre" vb="0 0 240 160">
    <Box x={56} y={6} w={92} h={16} r={4} />
    <Limb p={[[98, 104], [104, 128], [98, 150]]} back />
    <Limb p={[[98, 104], [108, 128], [102, 150]]} />
    <Limb p={[[100, 58], [98, 104]]} />
    <Head c={[113, 52]} />
    <Limb p={[[100, 22], [105, 40], [100, 58]]} hot />
    <line x1="108" y1="40" x2="128" y2="34" stroke="var(--muted)" strokeWidth="1" />
    <Note x={130} y={37}>coudes souples</Note>
    <line x1="100" y1="62" x2="128" y2="74" stroke="var(--muted)" strokeWidth="1" />
    <Note x={130} y={78}>épaules engagées</Note>
    <line x1="108" y1="124" x2="128" y2="124" stroke="var(--muted)" strokeWidth="1" />
    <Note x={130} y={127}>corps immobile</Note>
  </Frame>
);

/* ---------- Grips (finger side view on a 20 mm edge) ---------- */
type GripKind = "half" | "open" | "full";
export function Grip({ kind }: { kind: GripKind }) {
  const F: Record<GripKind, P[]> = {
    half: [[62, 46], [100, 50], [102, 82], [122, 87]],
    open: [[62, 46], [96, 62], [114, 80], [132, 88]],
    full: [[62, 46], [102, 40], [96, 80], [118, 87]],
  };
  const f = F[kind];
  const label = { half: "Semi-arqué", open: "Main ouverte", full: "Arqué complet" }[kind];
  return (
    <svg viewBox="0 0 200 140" role="img" aria-label={`Doigt en ${label} sur une réglette`}>
      <rect x="98" y="88" width="102" height="52" fill="var(--sunk)" stroke="var(--line)" strokeWidth="1.5" />
      <line x1="98" y1="88" x2="118" y2="88" stroke="var(--accent)" strokeWidth="3" />
      <text x="108" y="104" textAnchor="middle" fontSize="9" fill="var(--muted)" fontFamily="IBM Plex Mono, monospace">20 mm</text>
      <polyline points={pts([[8, 26], [62, 46]])} fill="none" stroke="var(--ink)" strokeWidth="20" strokeLinecap="round" />
      <polyline points={pts(f)} fill="none" stroke="var(--accent)" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
      {kind === "full" && <path d="M36 58 Q 70 62 98 38" fill="none" stroke="var(--warn)" strokeWidth="9" strokeLinecap="round" />}
      {f.slice(1, 3).map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="3.5" fill="var(--surface)" />)}
    </svg>
  );
}
export const GRIPS: { kind: GripKind; name: string; use: string; tone: "ok" | "warn" }[] = [
  { kind: "half", name: "Semi-arqué", use: "Ta prise de travail : suspensions, réglettes. Doigts à 90° à l’articulation du milieu, pouce libre.", tone: "ok" },
  { kind: "open", name: "Main ouverte", use: "La plus douce pour les poulies. Plats, prises rondes, échauffement.", tone: "ok" },
  { kind: "full", name: "Arqué complet", use: "Pouce verrouillé sur l’index : très fort mais dur pour les poulies. Projets uniquement, jamais en exercice.", tone: "warn" },
];

const MAP: Record<string, () => JSX.Element> = {
  pull: PullUp, row: Row, pulldown: Pulldown, face: FacePull, rwc: WristCurl, hammer: Hammer, hlr: LegRaise,
  dips: Dips, ohp: Press, bss: Split, rdl: Rdl, cossack: Cossack, sp: SidePlank,
};
export function ExerciseArt({ id }: { id: string }) {
  if (id === "fl") return <FrontLeverMini />;
  const C = MAP[id];
  return C ? <C /> : null;
}
const FrontLeverMini = () => (
  <Frame label="Front lever en tuck avancé">
    <Bar a={[40, 24]} b={[160, 24]} w={5} />
    <Limb p={[[80, 26], [86, 70]]} />
    <Head c={[70, 78]} />
    <Limb p={[[86, 70], [130, 70]]} hot />
    <Limb p={[[130, 70], [120, 44], [146, 48]]} hot />
    <Note x={100} y={110} anchor="middle">dos horizontal, bras tendus</Note>
  </Frame>
);
