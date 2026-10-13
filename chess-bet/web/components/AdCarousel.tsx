"use client";
import { useEffect, useState } from "react"
export type Ad = { type:"video"|"banner"|"cta"|"html"; src?:string; href?:string; title?:string; subtitle?:string; html?:string }
export function AdCarousel({ ads }: { ads: Ad[] }){
  const [i,setI]=useState(0); const [pr,setPr]=useState(0)
  if(!ads||ads.length===0) return null
  if(ads.length===1) return <div className="w-full max-w-[520px] mx-auto">{render(ads[0])}</div>
  useEffect(()=>{ const a=setInterval(()=>{setI(v=>(v+1)%ads.length); setPr(0)},30000); const b=setInterval(()=>setPr(v=>v>=100?100:v+0.33),100); return()=>{clearInterval(a);clearInterval(b)}},[ads.length])
  useEffect(()=>setPr(0),[i])
  return <div className="w-full max-w-[520px] mx-auto"><div className="relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur">{render(ads[i])}<div className="absolute bottom-0 left-0 h-[2px] bg-[#FFD700]" style={{width:`${pr}%`}}/></div><div className="flex justify-center gap-1.5 mt-3">{ads.map((_,k)=><button key={k} onClick={()=>setI(k)} className={`h-1.5 rounded-full ${k===i?"w-6 bg-[#FFD700]":"w-1.5 bg-white/20"}`} />)}<span className="text-[11px] text-white/40 ml-2">{i+1}/{ads.length}</span></div></div>
}
function render(ad:Ad){
  const wrap=(el:React.ReactNode)=> ad.href? <a href={ad.href} target="_blank" rel="noopener noreferrer">{el}</a> : <>{el}</>
  if(ad.type==="video") return wrap(<video src={ad.src} autoPlay muted loop playsInline className="w-full aspect-[16/9] object-cover" onError={e=>(e.currentTarget.style.display="none")}/>)
  if(ad.type==="banner") return wrap(<img src={ad.src} alt="ad" className="w-full h-[290px] object-cover" onError={e=>(e.currentTarget.style.display="none")}/>)
  if(ad.type==="cta") return <div className="p-6 text-center bg-gradient-to-br from-[#1a1500] to-[#08080A]"><h3 className="text-white font-bold text-lg">{ad.title}</h3><p className="text-white/60 text-sm mt-1">{ad.subtitle}</p>{ad.href&&<a href={ad.href} target="_blank" className="inline-block mt-4 px-6 py-2 bg-[#FFD700] text-black font-bold rounded-full">ПЕРЕЙТИ</a>}</div>
  if(ad.type==="html") return <div className="p-4 max-h-[300px] overflow-auto" dangerouslySetInnerHTML={{__html:(ad.html||"").slice(0,51200).replace(/<script.*?>.*?<\/script>/gi,"")}}/>
  return null
}