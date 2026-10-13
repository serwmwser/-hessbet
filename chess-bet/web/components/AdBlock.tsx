"use client";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Ad, MAX_ADS } from "@/lib/ads";
import { usePT } from "@/lib/pauseTxt";

const SLOT_MS = 30_000;

/**
 * Универсальный рекламный блок: до 10 слотов, каждый 30 секунд.
 * Нет рекламы — блок скрыт; один слот — без карусели; больше — карусель с точками, счётчиком и полосой времени.
 * Слот, который не загрузился, пропускается.
 */
export default function AdBlock({ ads }: { ads: Ad[] }) {
  const pt = usePT();
  const list = useMemo(() => ads.slice(0, MAX_ADS), [ads]);
  const [failed, setFailed] = useState<number[]>([]);
  const [pos, setPos] = useState(0);
  const alive = list.map((_, i) => i).filter((i) => !failed.includes(i));
  const n = alive.length;
  const cur = n ? alive[pos % n] : -1;

  useEffect(() => {
    if (n < 2) return;
    const id = setTimeout(() => setPos((p) => p + 1), SLOT_MS);
    return () => clearTimeout(id);
  }, [cur, n]);

  if (n === 0) return null;
  const ad = list[cur];
  const fail = () => setFailed((f) => (f.includes(cur) ? f : [...f, cur]));
  const wrap = (el: JSX.Element) => ad.href
    ? <a href={ad.href} target="_blank" rel="noopener noreferrer sponsored" className="block">{el}</a>
    : el;

  let body: JSX.Element;
  if (ad.type === "video") {
    body = wrap(<video key={cur} src={ad.src} muted autoPlay loop playsInline preload="auto" onError={fail} className="w-full aspect-video object-cover rounded-xl bg-black" />);
  } else if (ad.type === "banner") {
    body = wrap(<img key={cur} src={ad.src} alt="" onError={fail} className="w-full aspect-[520/290] object-cover rounded-xl bg-black" />);
  } else if (ad.type === "cta") {
    body = (
      <div className="rounded-xl border border-[#FFD700]/25 bg-black/30 p-5 text-center space-y-3">
        <div className="text-lg font-bold">{ad.title}</div>
        {ad.subtitle && <div className="text-sm text-white/65">{ad.subtitle}</div>}
        <a href={ad.href} target="_blank" rel="noopener noreferrer sponsored" className="inline-block rounded-xl px-6 py-2.5 text-sm font-extrabold text-[#08080A]" style={{ background: "linear-gradient(90deg,#FFD700,#FFB800)" }}>{ad.button || pt.go}</a>
      </div>
    );
  } else {
    // готовый HTML выполняется в песочнице: скрипты отключены, ссылки открываются в новой вкладке
    body = <iframe key={cur} title="ad" sandbox="allow-popups allow-popups-to-escape-sandbox" srcDoc={`<base target="_blank"><style>body{margin:0;font-family:system-ui,sans-serif;color:#fff}</style>${ad.html}`} className="w-full h-[290px] rounded-xl border-0 bg-transparent" />;
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-3 space-y-2">
      <div className="flex items-center justify-between text-[10px] tracking-[.2em] uppercase text-white/40">
        <span>{pt.ad}</span>
        {n > 1 && <span className="mono">{(pos % n) + 1}/{n}</span>}
      </div>
      {body}
      {n > 1 && (
        <div className="space-y-1.5">
          <div className="h-0.5 rounded-full bg-white/10 overflow-hidden">
            <motion.div key={cur} className="h-full" style={{ background: "#FFD700" }} initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: SLOT_MS / 1000, ease: "linear" }} />
          </div>
          <div className="flex justify-center gap-1.5">
            {alive.map((i) => <span key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: i === cur ? "#FFD700" : "rgba(255,255,255,.25)" }} />)}
          </div>
        </div>
      )}
    </div>
  );
}
