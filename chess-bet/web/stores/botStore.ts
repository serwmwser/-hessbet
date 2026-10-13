"use client";
import { create } from "zustand"
import { persist } from "zustand/middleware"
type S = { fen:string; w:number; b:number; me:"w"|"b"; playing:boolean; level:number; minutes:number; history:string[]; over:boolean }
type Store = S & { set:(p:Partial<S>)=>void; reset:()=>void }
const init:S = { fen:"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", w:900000, b:900000, me:"w", playing:false, level:3, minutes:15, history:[], over:false }
export const useBotStore = create<Store>()(persist((set)=>({ ...init, set:(p)=>set(p), reset:()=>set(init) }),{ name:"chessBet-bot-global" }))