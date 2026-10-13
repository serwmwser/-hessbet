"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useApp } from "@/lib/ctx";
import { useAds } from "@/lib/ads";
import { usePT } from "@/lib/pauseTxt";
import { PAUSES_TOTAL } from "@/lib/rules";
import AdBlock from "./AdBlock";

const GOLD = "#FFD700";
const mmss = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};

/**
 * Страница паузы: ОДИН компонент и для игры с ботом, и для игры на токены.
 * until — локальное время (Date.now()), когда пауза закончится автопоражением.
 * Продолжить может только тот, кто взял паузу (byMe); сопернику кнопка видна, но неактивна.
 */
export default function PausePage({ mode, until, byMe, color, left, onResume }: {
  mode: "bot" | "pvp"; until: number; byMe: boolean; color: "w" | "b"; left: number; onResume: () => void;
}) {
  const { t } = useApp();
  const pt = usePT();
  const ads = useAds();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const i = setInterval(() => setNow(Date.now()), 250); return () => clearInterval(i); }, []);
  const ms = Math.max(0, until - now);
  const urgent = ms <= 30_000;
  const who = byMe ? pt.you : `${pt.opp} ${color === "w" ? t("white") : t("black")}`;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} role="dialog" aria-modal="true" aria-label={pt.title} data-mode={mode}
      className="fixed inset-0 z-[60] flex flex-col text-white" style={{ background: "#08080A" }}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[640px] h-[640px] rounded-full blur-3xl opacity-25" style={{ background: `radial-gradient(circle, ${GOLD} 0%, transparent 65%)` }} />
        <span className="absolute -bottom-10 -start-6 text-[260px] leading-none opacity-[0.045] select-none">♔</span>
        <span className="absolute top-24 -end-8 text-[220px] leading-none opacity-[0.04] select-none">♛</span>
      </div>

      <div className="relative flex-1 min-h-0 overflow-y-auto px-4 pt-8 pb-4">
        <div className="mx-auto w-full max-w-md space-y-4">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-6 text-center" style={{ boxShadow: "0 0 60px -20px rgba(255,215,0,.45)" }}>
            <div className="text-xs tracking-[.35em]" style={{ color: GOLD }}>{pt.title}</div>
            <div className="mono text-7xl sm:text-8xl font-extrabold my-3" dir="ltr"
              style={{ color: urgent ? "#ff5a5a" : GOLD, textShadow: `0 0 28px ${urgent ? "rgba(255,90,90,.5)" : "rgba(255,215,0,.45)"}` }}>{mmss(ms)}</div>
            <div className="text-[11px] tracking-[.25em] text-white/60 leading-relaxed">{pt.frozen}<br />{pt.toLoss}</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl px-4 py-3 flex items-center justify-between gap-3">
            <div className="text-sm"><span className="text-white/60">{pt.by} </span><b style={{ color: GOLD }}>{who}</b></div>
            <div className="flex items-center gap-2 text-xs text-white/70 shrink-0">
              {pt.leftPauses}
              <span className="flex gap-1">
                {Array.from({ length: PAUSES_TOTAL }, (_, i) => (
                  <span key={i} className="w-2.5 h-2.5 rounded-full" style={{ border: `1px solid ${GOLD}99`, background: i < left ? GOLD : "transparent" }} />
                ))}
              </span>
              <b className="mono">{left}/{PAUSES_TOTAL}</b>
            </div>
          </div>

          <AdBlock ads={ads} />
          <p className="text-center text-[11px] text-white/40 px-3">🛡️ {pt.trustT}</p>
        </div>
      </div>

      {/* кнопка вынесена из прокручиваемой области: реклама её никогда не перекрывает */}
      <div className="relative px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-white/10 bg-[#08080A]/95 backdrop-blur-xl">
        <div className="mx-auto max-w-md space-y-1.5">
          <button
            onClick={onResume} disabled={!byMe}
            className="w-full rounded-2xl py-4 text-base font-extrabold tracking-wide text-[#08080A] disabled:opacity-45 transition active:scale-[.98]"
            style={{ background: "linear-gradient(90deg,#FFD700,#FFB800)", boxShadow: byMe ? "0 0 32px -6px rgba(255,215,0,.65)" : undefined }}
          >{pt.resume}</button>
          {!byMe && <p className="text-center text-xs text-white/50">{pt.waitOpp}</p>}
        </div>
      </div>
    </motion.div>
  );
}

/** Кнопка «ПАУЗА 1/2»: золотое свечение, когда можно нажать; рядом тултип с правилами */
export function PauseButton({ left, active, onClick }: { left: number; active: boolean; onClick: () => void }) {
  const pt = usePT();
  const [tip, setTip] = useState(false);
  const can = active && left > 0;
  return (
    <div className="relative inline-flex items-center gap-2">
      <button
        disabled={!can} onClick={onClick} title={`${pt.trustT}. ${pt.trustP}`}
        className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold tracking-wide border backdrop-blur-xl transition active:scale-[.98] disabled:cursor-not-allowed ${can ? "bg-[#0e0e12] text-[#FFD700] border-[#FFD700]/60" : "bg-slate-500/15 text-slate-500 border-slate-400/20"}`}
        style={can ? { boxShadow: "0 0 22px -4px rgba(255,215,0,.55)" } : undefined}
      >
        <span className="font-black tracking-tighter">||</span>{pt.pause} <span className="mono">{left}/{PAUSES_TOTAL}</span>
      </button>
      <button
        type="button" aria-label="info" aria-expanded={tip}
        onClick={() => setTip((x) => !x)} onMouseEnter={() => setTip(true)} onMouseLeave={() => setTip(false)} onBlur={() => setTip(false)}
        className="w-7 h-7 rounded-full text-xs font-bold border border-slate-400/40 opacity-80 hover:opacity-100"
      >i</button>
      {tip && (
        <div role="tooltip" className="absolute bottom-full mb-2 start-0 w-72 max-w-[85vw] z-30 rounded-2xl p-3 text-xs leading-relaxed text-white border border-white/10 bg-[#08080A]/95 backdrop-blur-xl">
          <b style={{ color: GOLD }}>{pt.trustT}.</b> {pt.trustP}
        </div>
      )}
    </div>
  );
}

/** Блок доверия на главной: защита ставки от форс-мажора */
export function TrustBlock({ className = "" }: { className?: string }) {
  const pt = usePT();
  return (
    <div className={`rounded-2xl border border-[#FFD700]/25 bg-[#08080A]/80 text-white text-start p-4 flex gap-3 ${className}`} style={{ boxShadow: "0 0 30px -14px rgba(255,215,0,.5)" }}>
      <div className="text-2xl leading-none">🛡️</div>
      <div className="space-y-1">
        <div className="text-sm font-bold" style={{ color: GOLD }}>{pt.trustT}</div>
        <p className="text-xs text-white/70 leading-relaxed">{pt.trustP}</p>
      </div>
    </div>
  );
}
