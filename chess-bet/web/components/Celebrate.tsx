"use client";
import { motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";
import { useApp } from "@/lib/ctx";

const EMOJI = ["🎉", "✨", "♛", "🏆", "🎊", "♞"];

/** Поздравление победителя: падающее конфетти и подпрыгивающий кубок. */
export default function Celebrate() {
  const { t } = useApp();
  const reduce = useReducedMotion();
  const bits = useMemo(
    () => Array.from({ length: 18 }, (_, i) => ({ x: Math.random() * 100, d: i * 0.09, e: EMOJI[i % EMOJI.length] })),
    []
  );
  return (
    <div className="relative overflow-hidden text-center py-2">
      {!reduce && (
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          {bits.map((b, i) => (
            <motion.span
              key={i}
              className="absolute text-xl"
              style={{ left: `${b.x}%`, top: -20 }}
              initial={{ y: 0, opacity: 1, rotate: 0 }}
              animate={{ y: 260, opacity: 0, rotate: 360 }}
              transition={{ duration: 2.6, delay: b.d, ease: "easeIn" }}
            >{b.e}</motion.span>
          ))}
        </div>
      )}
      <motion.div
        className="text-6xl"
        initial={{ scale: 0.3, rotate: -20 }}
        animate={reduce ? { scale: 1 } : { scale: [0.3, 1.25, 1], rotate: [-20, 8, 0] }}
        transition={{ duration: 0.7 }}
      >🏆</motion.div>
      <div className="text-2xl font-extrabold mt-1 bg-gradient-to-r from-brand-400 to-brand-violet bg-clip-text text-transparent">{t("congrats")}</div>
    </div>
  );
}
