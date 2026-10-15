"use client";

export type Kind = "ninja" | "police" | "lady" | "bandit";
export type Side = "w" | "b";
export type Mood = "idle" | "sad" | "cheer" | "scream";

const SKIN = "#ffd9b8";
const OUT = "#2a2140";

/** Стили и анимации персонажей (подключаются один раз на странице: <style>{CARTOON_CSS}</style>) */
export const CARTOON_CSS = `
.cc-w { filter: drop-shadow(0 0 5px #ffffff) drop-shadow(0 0 2px #fff6c9); }
.cc-b { filter: drop-shadow(0 0 5px #ff2d55) drop-shadow(0 0 2px #7a00ff); }
.cc .tg { transform-box: fill-box; transform-origin: 50% 100%; }
.cc .eyes { transform-origin: 50% 50%; }
.cc .tail { transform-box: fill-box; transform-origin: 0% 50%; }
.cc-idle .head { animation: cc-bob 2.8s ease-in-out infinite; }
.cc-idle .eyes { animation: cc-blink 4s infinite; }
.cc-idle .tail { animation: cc-tail 1.6s ease-in-out infinite; }
.cc-sad .head { animation: cc-droop 2.4s ease-in-out infinite; }
.cc-sad .tear { animation: cc-tear 1.6s ease-in infinite; }
.cc-cheer { animation: cc-jump .55s ease-in-out infinite; }
.cc-cheer .tail { animation: cc-tail .5s ease-in-out infinite; }
.cc-scream { animation: cc-shake .12s linear infinite; }
@keyframes cc-bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-2px); } }
@keyframes cc-blink { 0%,92%,100% { transform: scaleY(1); } 95% { transform: scaleY(.1); } }
@keyframes cc-tail { 0%,100% { transform: rotate(-6deg); } 50% { transform: rotate(10deg); } }
@keyframes cc-droop { 0%,100% { transform: rotate(0) translateY(0); } 50% { transform: rotate(7deg) translateY(3px); } }
@keyframes cc-tear { 0% { opacity: 0; transform: translateY(0); } 30% { opacity: 1; } 100% { opacity: 0; transform: translateY(14px); } }
@keyframes cc-jump { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
@keyframes cc-shake { 0% { transform: translateX(-2px); } 50% { transform: translateX(2px); } 100% { transform: translateX(-2px); } }
@media (prefers-reduced-motion: reduce) { .cc, .cc * { animation: none !important; } }
`;

const PAL = {
  w: { base: "#ffffff", body: "#ffffff", collar: "#ffcc33", belt: "#ffcc33", hat: "#ffffff", brim: "#e9e2c8", badge: "#ffcc33", mask: "#ffffff", band: "#ffcc33", hair: "#f2c94c", bow: "#ffffff", stripe: "#ffcc33" },
  b: { base: "#1a1a24", body: "#22232e", collar: "#e4363f", belt: "#e4363f", hat: "#15151d", brim: "#0b0b10", badge: "#e4363f", mask: "#15151d", band: "#e4363f", hair: "#17131f", bow: "#7a2cff", stripe: "#e4363f" },
};

function Eyes({ mood, lit }: { mood: Mood; lit: boolean }) {
  const ink = lit ? "#ffffff" : OUT;
  if (mood === "cheer")
    return (
      <g className="eyes tg">
        <path d="M34 45 Q40 37 46 45" stroke={ink} strokeWidth="3.2" fill="none" strokeLinecap="round" />
        <path d="M54 45 Q60 37 66 45" stroke={ink} strokeWidth="3.2" fill="none" strokeLinecap="round" />
      </g>
    );
  if (mood === "scream")
    return (
      <g className="eyes tg">
        <ellipse cx="40" cy="42" rx="6.5" ry="8.5" fill="#ffffff" stroke={OUT} strokeWidth="2" />
        <ellipse cx="60" cy="42" rx="6.5" ry="8.5" fill="#ffffff" stroke={OUT} strokeWidth="2" />
        <circle cx="40" cy="42" r="2.2" fill={OUT} />
        <circle cx="60" cy="42" r="2.2" fill={OUT} />
      </g>
    );
  const ry = mood === "sad" ? 4.4 : 5.4;
  return (
    <g className="eyes tg">
      {lit ? (
        <>
          <ellipse cx="40" cy="43" rx="5" ry="4.6" fill="#ffffff" />
          <ellipse cx="60" cy="43" rx="5" ry="4.6" fill="#ffffff" />
          <circle cx="41" cy="43" r="2.2" fill={OUT} />
          <circle cx="59" cy="43" r="2.2" fill={OUT} />
        </>
      ) : (
        <>
          <ellipse cx="40" cy="43" rx="4.2" ry={ry} fill={OUT} />
          <ellipse cx="60" cy="43" rx="4.2" ry={ry} fill={OUT} />
          <circle cx="41.6" cy="41" r="1.6" fill="#ffffff" />
          <circle cx="61.6" cy="41" r="1.6" fill="#ffffff" />
        </>
      )}
      {mood === "sad" && (
        <>
          <path d="M33 36 L46 31" stroke={ink} strokeWidth="2.6" strokeLinecap="round" />
          <path d="M54 31 L67 36" stroke={ink} strokeWidth="2.6" strokeLinecap="round" />
          <circle className="tear" cx="35" cy="50" r="3" fill="#8fd3ff" />
        </>
      )}
    </g>
  );
}

function Mouth({ mood, kind }: { mood: Mood; kind: Kind }) {
  if (kind === "ninja" && mood === "idle") return null;
  if (mood === "scream") return <ellipse cx="50" cy="58" rx="7" ry="9" fill="#7a1f3d" stroke={OUT} strokeWidth="2.5" />;
  if (mood === "cheer")
    return (
      <>
        <path d="M38 52 Q50 70 62 52 Z" fill="#7a1f3d" stroke={OUT} strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M44 60 Q50 65 56 60 Q50 57 44 60 Z" fill="#ff7a93" />
      </>
    );
  if (mood === "sad") return <path d="M43 59 Q50 52 57 59" stroke={OUT} strokeWidth="3" fill="none" strokeLinecap="round" />;
  if (kind === "bandit") return <path d="M41 56 Q52 62 60 52" stroke="#ffffff" strokeWidth="3" fill="none" strokeLinecap="round" />;
  return <path d="M41 55 Q50 62 59 55" stroke={OUT} strokeWidth="3" fill="none" strokeLinecap="round" />;
}

/** Мультяшная пешка. side "w" = белые (светлые, добрые, золотая отделка, белое свечение), "b" = чёрные (тёмные, злые, красная отделка, красное свечение). */
export default function Character({ kind, mood = "idle", size = 120, side }: { kind: Kind; mood?: Mood; size?: number; side?: Side }) {
  const sd: Side = side ?? (kind === "bandit" ? "b" : "w");
  const p = PAL[sd];
  const lit = sd === "b" && kind === "bandit";
  return (
    <svg className={"cc cc-" + sd + " cc-" + mood} viewBox="0 0 100 120" width={size} height={size * 1.2} role="img" aria-label={kind} style={{ display: "block", overflow: "visible" }}>
      <ellipse cx="50" cy="113" rx="30" ry="5" fill="rgba(0,0,0,.18)" />
      <ellipse cx="50" cy="106" rx="30" ry="9" fill={p.base} stroke={OUT} strokeWidth="2" />
      <path d="M32 106 C34 86 40 74 42 64 L58 64 C60 74 66 86 68 106 Z" fill={p.body} stroke={OUT} strokeWidth="2.5" />
      {kind === "ninja" && <path d="M39 78 H61" stroke={p.belt} strokeWidth="6" strokeLinecap="round" />}
      {kind === "police" && (
        <>
          <circle cx="50" cy="74" r="2.6" fill={p.badge} />
          <circle cx="50" cy="84" r="2.6" fill={p.badge} />
          <circle cx="50" cy="94" r="2.6" fill={p.badge} />
        </>
      )}
      {kind === "lady" && <path d="M42 66 Q50 78 58 66 Z" fill={sd === "w" ? "#ffe9a8" : "#7a2cff"} />}
      {kind === "bandit" && <path d="M41 74 H59 M38 84 H62 M35 94 H65" stroke={p.stripe} strokeWidth="4" />}
      <ellipse cx="50" cy="64" rx="15" ry="5" fill={p.collar} stroke={OUT} strokeWidth="2" />

      <g className="head tg">
        {kind === "lady" && (
          <path d="M24 46 Q22 14 50 14 Q78 14 76 46 Q76 70 68 74 L66 50 Q50 38 34 50 L32 74 Q24 70 24 46 Z" fill={p.hair} stroke={OUT} strokeWidth="2.5" />
        )}
        <circle cx="27" cy="45" r="5" fill={SKIN} stroke={OUT} strokeWidth="2" />
        <circle cx="73" cy="45" r="5" fill={SKIN} stroke={OUT} strokeWidth="2" />
        <circle cx="50" cy="42" r="23" fill={SKIN} stroke={OUT} strokeWidth="2.5" />
        {kind !== "ninja" && <circle cx="35" cy="52" r="4" fill="#ff9aa8" opacity=".55" />}
        {kind !== "ninja" && <circle cx="65" cy="52" r="4" fill="#ff9aa8" opacity=".55" />}

        {kind === "ninja" && <path d="M29 46 Q50 41 71 46 L70 60 Q50 71 30 60 Z" fill={p.mask} stroke={OUT} strokeWidth="2.2" />}
        {kind === "bandit" && <path d="M29 38 Q50 32 71 38 Q73 50 62 49 Q54 46 50 48 Q46 46 38 49 Q27 50 29 38 Z" fill="#14141c" />}

        <Eyes mood={mood} lit={lit} />
        <Mouth mood={mood} kind={kind} />

        {kind === "ninja" && (
          <>
            <rect x="28" y="26" width="44" height="9" rx="3" fill={p.band} stroke={OUT} strokeWidth="2" />
            <rect x="43" y="27" width="14" height="7" rx="2" fill={sd === "w" ? "#ffffff" : "#7a2cff"} />
            <path className="tail" d="M72 30 L92 23 L85 32 L94 39 L72 35 Z" fill={p.band} stroke={OUT} strokeWidth="1.6" />
          </>
        )}
        {kind === "police" && (
          <>
            <path d="M29 34 Q50 4 71 34 Z" fill={p.hat} stroke={OUT} strokeWidth="2.5" />
            <path d="M26 34 Q50 42 74 34 L74 38 Q50 46 26 38 Z" fill={p.brim} stroke={OUT} strokeWidth="2" />
            <circle cx="50" cy="22" r="5" fill={p.badge} stroke={OUT} strokeWidth="1.5" />
          </>
        )}
        {kind === "lady" && (
          <>
            <path d="M28 40 Q34 18 52 22 Q70 20 72 40 Q60 28 50 32 Q40 28 28 40 Z" fill={p.hair} stroke={OUT} strokeWidth="2" />
            <ellipse cx="62" cy="18" rx="7" ry="4.5" fill={p.bow} stroke={OUT} strokeWidth="1.6" transform="rotate(-20 62 18)" />
            <ellipse cx="76" cy="20" rx="7" ry="4.5" fill={p.bow} stroke={OUT} strokeWidth="1.6" transform="rotate(20 76 20)" />
            <circle cx="69" cy="19" r="3" fill={sd === "w" ? "#ffcc33" : "#e4363f"} stroke={OUT} strokeWidth="1.2" />
            <path d="M34 38 L31 36 M66 38 L69 36" stroke={OUT} strokeWidth="2" strokeLinecap="round" />
          </>
        )}
        {kind === "bandit" && (
          <>
            <path d="M27 32 Q50 8 73 32 Q50 28 27 32 Z" fill="#4a4d5e" stroke={OUT} strokeWidth="2.5" />
            <path d="M52 31 Q74 30 80 36 Q64 38 52 35 Z" fill="#3a3c4a" stroke={OUT} strokeWidth="2" />
          </>
        )}
      </g>
    </svg>
  );
}