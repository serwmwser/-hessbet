"use client";
import { CSSProperties, useEffect, useState } from "react";

export type PTheme = { id: string; ru: string; en: string; style: CSSProperties };

const tint = (rgb: string, a1: number, a2: number, border: number, glow = "none"): CSSProperties => ({
  background: "linear-gradient(135deg, rgba(" + rgb + "," + a1 + "), rgba(" + rgb + "," + a2 + "))",
  border: "1px solid rgba(" + rgb + "," + border + ")",
  boxShadow: glow,
});

/** Темы оформления карточки профиля */
export const PTHEMES: PTheme[] = [
  { id: "default", ru: "Стандарт", en: "Default", style: {} },
  { id: "gold", ru: "Золото", en: "Gold", style: tint("247,215,116", 0.28, 0.08, 0.65, "0 0 24px -8px rgba(247,215,116,.6)") },
  { id: "ocean", ru: "Океан", en: "Ocean", style: tint("59,130,246", 0.24, 0.06, 0.55) },
  { id: "emerald", ru: "Изумруд", en: "Emerald", style: tint("16,185,129", 0.24, 0.06, 0.55) },
  { id: "violet", ru: "Аметист", en: "Amethyst", style: tint("139,92,246", 0.26, 0.07, 0.55) },
  { id: "crimson", ru: "Рубин", en: "Ruby", style: tint("220,38,38", 0.22, 0.06, 0.55) },
  { id: "neon", ru: "Неон", en: "Neon", style: tint("55,242,255", 0.18, 0.05, 0.85, "0 0 22px -4px rgba(55,242,255,.7)") },
  { id: "graphite", ru: "Графит", en: "Graphite", style: tint("100,116,139", 0.28, 0.1, 0.6) },
];

const KEY = "profileTheme";
const EVT = "ptheme-change";
const read = (): string => {
  try {
    const v = localStorage.getItem(KEY);
    return PTHEMES.some((p) => p.id === v) ? (v as string) : "default";
  } catch {
    return "default";
  }
};

/** Выбранная тема профиля (хранится в браузере, обновляется сразу везде) */
export function usePTheme(): [PTheme, (id: string) => void] {
  const [id, setId] = useState("default");
  useEffect(() => {
    setId(read());
    const on = () => setId(read());
    window.addEventListener(EVT, on);
    window.addEventListener("storage", on);
    return () => {
      window.removeEventListener(EVT, on);
      window.removeEventListener("storage", on);
    };
  }, []);
  const change = (v: string) => {
    try {
      localStorage.setItem(KEY, v);
    } catch {
      /* без хранилища выбор действует до перезагрузки */
    }
    setId(v);
    window.dispatchEvent(new Event(EVT));
  };
  return [PTHEMES.find((p) => p.id === id) ?? PTHEMES[0], change];
}