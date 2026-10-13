"use client";
import { usePauseStore } from "../stores/pauseStore"
export function PauseButton({ me, turn, onTake }: { me:"w"|"b"; turn:"w"|"b"; onTake:()=>void }){
  const { isPaused, remW, remB } = usePauseStore(); const rem=me==="w"?remW:remB; const can=me===turn&&!isPaused&&rem>0
  return <div className="relative group"><button onClick={onTake} disabled={!can} title="2 паузы по 5 минут, только в свой ход. Таймер заморожен." className={`px-4 py-2 rounded-full border text-sm font-bold flex items-center gap-2 backdrop-blur ${can?"bg-white/[0.08] border-[#FFD700]/50 text-white shadow-[0_0_15px_rgba(255,215,0,0.3)] hover:bg-[#FFD700] hover:text-black":"bg-white/[0.04] border-white/10 text-white/30 cursor-not-allowed"}`}><span>||</span> ПАУЗА {rem}/2</button></div>
}