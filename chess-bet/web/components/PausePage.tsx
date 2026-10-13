"use client";
import { useEffect } from "react"
import { AdCarousel, Ad } from "./AdCarousel"
import { usePauseStore } from "../stores/pauseStore"
export function PausePage({ ads=[], onResume, canResume, who }: { ads?:Ad[]; onResume:()=>void; canResume:boolean; who:"w"|"b" }){
  const { left, owner, remW, remB, tick } = usePauseStore()
  useEffect(()=>{ const id=setInterval(()=>tick(),1000); return()=>clearInterval(id)},[tick])
  const m=String(Math.floor(left/60)).padStart(2,"0"); const s=String(left%60).padStart(2,"0")
  const rem = who==="w"? remW: remB
  const colorText = who==="w"?"Белые":"Черные"
  const ownerText = owner===who?`ВЫ [${colorText}]`:`Соперник [${who==="w"?"Черные":"Белые"}]`
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-[#08080A]/95 backdrop-blur-xl overflow-y-auto">
      <div className="absolute inset-0 pointer-events-none opacity-[0.04] text-[200px] flex items-center justify-center gap-10">♔♛</div>
      <div className="absolute inset-0 bg-gradient-to-b from-[#FFD700]/[0.06] via-transparent to-transparent pointer-events-none"/>
      <div className="relative w-full max-w-[560px] rounded-[24px] border border-white/10 bg-white/[0.06] backdrop-blur-2xl shadow-[0_0_60px_rgba(255,215,0,0.15)] p-6 md:p-8 text-center">
        <p className="text-[#FFD700] text-xs tracking-[0.2em] font-semibold">ТАЙМЕР ЗАМОРОЖЕН // ДО АВТОПОРАЖЕНИЯ</p>
        <div className="text-6xl md:text-7xl font-black text-white mt-4 tracking-widest drop-shadow-[0_0_20px_rgba(255,215,0,0.5)]">{m}:{s}</div>
        <p className="text-white/80 mt-3 text-sm">Паузу взял: <span className="text-[#FFD700] font-bold">{ownerText}</span></p>
        <div className="flex items-center justify-center gap-2 mt-4"><span className="text-white/50 text-xs">Осталось пауз: {rem}/2</span><div className="flex gap-1.5">{[0,1].map(k=><div key={k} className={`w-2 h-2 rounded-full ${k<rem?"bg-[#FFD700] shadow-[0_0_8px_#FFD700]":"bg-white/15"}`}/>)}</div></div>
        <div className="my-6"><AdCarousel ads={ads}/></div>
        <button onClick={onResume} disabled={!canResume} className={`w-full py-4 rounded-full font-black text-lg ${canResume?"bg-[#FFD700] text-black hover:bg-[#ffe033] shadow-[0_0_30px_rgba(255,215,0,0.4)]":"bg-white/10 text-white/30 cursor-not-allowed"}`}>▶ ПРОДОЛЖИТЬ ИГРУ</button>
        {!canResume && <p className="text-white/40 text-xs mt-2">Продолжить может только тот, кто взял паузу</p>}
      </div>
    </div>
  )
}