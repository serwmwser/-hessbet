"use client";
import { ComponentProps, ReactElement, useEffect, useState } from "react";
import type { Chessboard } from "react-chessboard";

export type PieceSet = "classic" | "gold" | "silver" | "neon";

export const PIECE_SETS: { id: PieceSet; ru: string; en: string }[] = [
  { id: "classic", ru: "Классические", en: "Classic" },
  { id: "gold", ru: "Золото", en: "Gold" },
  { id: "silver", ru: "Серебро", en: "Silver" },
  { id: "neon", ru: "Неон", en: "Neon" },
];

type Look = { fill: string; stroke: string; glow: string };
const LOOKS: Record<Exclude<PieceSet, "classic">, { w: Look; b: Look }> = {
  gold: {
    w: { fill: "#f7d774", stroke: "#7a5a0e", glow: "none" },
    b: { fill: "#2a1f0a", stroke: "#f7d774", glow: "none" },
  },
  silver: {
    w: { fill: "#f3f5f9", stroke: "#5d6573", glow: "none" },
    b: { fill: "#343a46", stroke: "#d4dae4", glow: "none" },
  },
  neon: {
    w: { fill: "#0b2b33", stroke: "#37f2ff", glow: "0 0 6px #37f2ff" },
    b: { fill: "#2e0b2a", stroke: "#ff4fd8", glow: "0 0 6px #ff4fd8" },
  },
};

const GLYPH = { P: "\u265F", N: "\u265E", B: "\u265D", R: "\u265C", Q: "\u265B", K: "\u265A" } as const;

type CP = NonNullable<ComponentProps<typeof Chessboard>["customPieces"]>;
type PieceFn = (a: { squareWidth: number }) => ReactElement;
const cache: Partial<Record<PieceSet, CP>> = {};

function build(set: Exclude<PieceSet, "classic">): CP {
  const out: Record<string, PieceFn> = {};
  for (const c of ["w", "b"] as const) {
    const look = LOOKS[set][c];
    for (const t of Object.keys(GLYPH) as (keyof typeof GLYPH)[]) {
      out[c + t] = ({ squareWidth }) => (
        <div
          style={{
            width: squareWidth,
            height: squareWidth,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: squareWidth * 0.82,
            lineHeight: 1,
            color: look.fill,
            WebkitTextStroke: `${Math.max(1, squareWidth / 40)}px ${look.stroke}`,
            paintOrder: "stroke fill",
            textShadow: look.glow,
            userSelect: "none",
          }}
        >
          {GLYPH[t] + "\uFE0E"}
        </div>
      );
    }
  }
  return out as unknown as CP;
}

/** Фигуры для доски; для классического набора undefined (стандартные фигуры библиотеки) */
export function piecesFor(set: PieceSet): CP | undefined {
  if (set === "classic") return undefined;
  return (cache[set] ??= build(set));
}

const KEY = "pieceSet";
const EVT = "pieceset-change";
const read = (): PieceSet => {
  try {
    const v = localStorage.getItem(KEY);
    return PIECE_SETS.some((p) => p.id === v) ? (v as PieceSet) : "classic";
  } catch {
    return "classic";
  }
};

/** Выбранный набор фигур (хранится в браузере, обновляется на всех экранах сразу) */
export function usePieceSet(): [PieceSet, (s: PieceSet) => void] {
  const [set, setS] = useState<PieceSet>("classic");
  useEffect(() => {
    setS(read());
    const on = () => setS(read());
    window.addEventListener(EVT, on);
    window.addEventListener("storage", on);
    return () => {
      window.removeEventListener(EVT, on);
      window.removeEventListener("storage", on);
    };
  }, []);
  const change = (s: PieceSet) => {
    try {
      localStorage.setItem(KEY, s);
    } catch {
      /* без хранилища выбор действует до перезагрузки */
    }
    setS(s);
    window.dispatchEvent(new Event(EVT));
  };
  return [set, change];
}