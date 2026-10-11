"use client";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo } from "react";
import { useTx } from "@/lib/txt";

const PIECES = ["♞", "♜", "♝", "♛", "♚", "♟"];
const GRAD = "bg-gradient-to-r from-brand-400 via-brand-500 to-sky-400 bg-clip-text text-transparent";

function Dots() {
  return (
    <span className="inline-flex gap-1 ms-1" aria-hidden>
      {[0, 1, 2].map((i) => (
        <motion.span key={i} className="w-1.5 h-1.5 rounded-full bg-brand-400"
          animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }} transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }} />
      ))}
    </span>
  );
}

/** Ожидание соперника: пульсирующие кольца и парящие шахматные фигуры. */
export function WaitingSplash() {
  const tx = useTx();
  const reduce = useReducedMotion();
  return (
    <div className="card relative overflow-hidden text-center py-12 space-y-4">
      {!reduce && PIECES.map((p, i) => (
        <motion.span key={i} aria-hidden className="absolute text-3xl opacity-20 select-none"
          style={{ left: `${8 + i * 17}%`, top: `${i % 2 ? 62 : 14}%` }}
          animate={{ y: [0, -18, 0], rotate: [-8, 8, -8] }} transition={{ duration: 3 + i * 0.4, repeat: Infinity, ease: "easeInOut" }}>{p}</motion.span>
      ))}
      <div className="relative mx-auto w-28 h-28 grid place-items-center">
        {!reduce && [0, 1, 2].map((i) => (
          <motion.span key={i} aria-hidden className="absolute inset-0 rounded-full border-2 border-brand-400/60"
            animate={{ scale: [0.5, 1.5], opacity: [0.8, 0] }} transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.8, ease: "easeOut" }} />
        ))}
        <motion.div className="text-6xl" animate={reduce ? undefined : { rotate: [-12, 12, -12], scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>♞</motion.div>
      </div>
      <h2 className={`relative text-2xl font-extrabold ${GRAD}`}>{tx("waitTitle")}<Dots /></h2>
      <p className="relative text-sm opacity-70 max-w-sm mx-auto">{tx("waitSub")}</p>
    </div>
  );
}

/** Старт партии: полноэкранная заставка на пару секунд. */
export function StartSplash({ white, onDone }: { white: boolean; onDone: () => void }) {
  const tx = useTx();
  const reduce = useReducedMotion();
  useEffect(() => { const i = setTimeout(onDone, 2600); return () => clearTimeout(i); }, [onDone]);
  return (
    <motion.div role="status" onClick={onDone} className="fixed inset-0 z-50 grid place-items-center cursor-pointer px-6 text-center"
      style={{ background: "radial-gradient(800px 500px at 50% 40%, rgba(124,58,237,.55), rgba(6,10,28,.96))" }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="space-y-4">
        <div className="flex justify-center gap-3 text-5xl" aria-hidden>
          <motion.span initial={{ x: -140, opacity: 0, rotate: -30 }} animate={{ x: 0, opacity: 1, rotate: 0 }} transition={{ type: "spring", duration: 0.9 }}>♞</motion.span>
          <motion.span initial={{ scale: 0 }} animate={reduce ? { scale: 1 } : { scale: [0, 1.5, 1], rotate: [0, 180, 360] }} transition={{ duration: 0.9, delay: 0.3 }}>⚔️</motion.span>
          <motion.span initial={{ x: 140, opacity: 0, rotate: 30 }} animate={{ x: 0, opacity: 1, rotate: 0 }} transition={{ type: "spring", duration: 0.9 }}>♘</motion.span>
        </div>
        <motion.h2 className={`text-4xl font-extrabold ${GRAD}`} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>{tx("startTitle")}</motion.h2>
        <motion.p className="text-lg text-white/90" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>{white ? tx("startWhite") : tx("startBlack")}</motion.p>
      </div>
    </motion.div>
  );
}

/** Победа: салют, кубок и корона. */
export function WinSplash() {
  const tx = useTx();
  const reduce = useReducedMotion();
  const bits = useMemo(() => Array.from({ length: 36 }, (_, i) => ({ x: Math.random() * 100, d: Math.random() * 1.2, e: ["🎉", "✨", "🏆", "🎊", "👑", "⭐"][i % 6], s: 16 + Math.random() * 18 })), []);
  return (
    <div className="relative overflow-hidden py-4 space-y-2">
      {!reduce && (
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          {bits.map((b, i) => (
            <motion.span key={i} className="absolute" style={{ left: `${b.x}%`, top: -24, fontSize: b.s }}
              initial={{ y: 0, opacity: 1, rotate: 0 }} animate={{ y: 360, opacity: [1, 1, 0], rotate: 540 }} transition={{ duration: 3.2, delay: b.d, ease: "easeIn", repeat: 1, repeatDelay: 0.4 }}>{b.e}</motion.span>
          ))}
        </div>
      )}
      <motion.div className="relative text-7xl" initial={{ scale: 0.2, rotate: -25 }} animate={reduce ? { scale: 1 } : { scale: [0.2, 1.3, 1], rotate: [-25, 10, 0], y: [0, -8, 0] }} transition={{ duration: 0.9 }}>🏆</motion.div>
      <motion.div className="relative text-3xl" animate={reduce ? undefined : { y: [0, -6, 0] }} transition={{ duration: 1.6, repeat: Infinity }} aria-hidden>👑</motion.div>
      <h2 className="relative text-3xl font-extrabold bg-gradient-to-r from-amber-300 via-brand-400 to-sky-400 bg-clip-text text-transparent">{tx("winTitle")}</h2>
      <p className="relative text-sm opacity-80 max-w-xs mx-auto">{tx("winSub")}</p>
    </div>
  );
}

/** Поражение: мягкая поддержка, плывущие вверх сердечки. */
export function LoseSplash() {
  const tx = useTx();
  const reduce = useReducedMotion();
  const hearts = useMemo(() => Array.from({ length: 10 }, (_, i) => ({ x: 8 + i * 9, d: i * 0.4 })), []);
  return (
    <div className="relative overflow-hidden py-4 space-y-2">
      {!reduce && (
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          {hearts.map((h, i) => (
            <motion.span key={i} className="absolute text-xl" style={{ left: `${h.x}%`, bottom: -20 }}
              animate={{ y: [0, -220], opacity: [0, 0.9, 0] }} transition={{ duration: 3.5, delay: h.d, repeat: Infinity, ease: "easeOut" }}>{i % 2 ? "💜" : "💙"}</motion.span>
          ))}
        </div>
      )}
      <motion.div className="relative text-6xl" initial={{ rotate: 0, y: -30, opacity: 0 }} animate={{ rotate: [0, -12, 0], y: 0, opacity: 1 }} transition={{ duration: 1 }}>♚</motion.div>
      <h2 className="relative text-2xl font-extrabold bg-gradient-to-r from-brand-400 to-sky-400 bg-clip-text text-transparent">{tx("loseTitle")}</h2>
      <p className="relative text-sm opacity-80 max-w-xs mx-auto">{tx("loseSub")}</p>
    </div>
  );
}
