"use client";
import { create } from "zustand"
type Owner = "w"|"b"|null
type State = { isPaused:boolean; left:number; owner:Owner; remW:number; remB:number; start:(c:"w"|"b", turn:"w"|"b")=>boolean; tick:()=>void; resume:()=>void; reset:()=>void }
export const usePauseStore = create<State>((set,get)=>({
  isPaused:false, left:300, owner:null, remW:2, remB:2,
  start:(color, turn)=>{
    const s=get(); if(s.isPaused) return false; if(color!==turn) return false;
    if(color==="w"&&s.remW<=0) return false; if(color==="b"&&s.remB<=0) return false;
    set({ isPaused:true, left:300, owner:color, remW: color==="w"?s.remW-1:s.remW, remB: color==="b"?s.remB-1:s.remB }); return true
  },
  tick:()=>{
    const s=get(); if(!s.isPaused) return;
    if(s.left<=1){ set({ isPaused:false, left:0 }); return }
    set({ left:s.left-1 })
  },
  resume:()=>set({ isPaused:false, owner:null, left:300 }),
  reset:()=>set({ isPaused:false, left:300, owner:null, remW:2, remB:2 })
}))