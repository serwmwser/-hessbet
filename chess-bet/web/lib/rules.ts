import { Chess } from "chess.js";

/**
 * Может ли сторона `s` поставить мат сопернику хоть какой-то серией легальных ходов (при содействии соперника)?
 * Правило ФИДЕ: если у игрока, чьё время не вышло, мата поставить нельзя, просрочка времени соперника — ничья.
 * Совпадает с проверкой на сервере.
 */
export function canMate(chess: Chess, s: "w" | "b"): boolean {
  const mine: { type: string; square: string }[] = [];
  const theirs: { type: string; square: string }[] = [];
  for (const row of chess.board()) for (const p of row) if (p && p.type !== "k") (p.color === s ? mine : theirs).push(p);
  if (mine.some((p) => p.type === "p" || p.type === "r" || p.type === "q")) return true;
  if (mine.length === 0) return false;
  if (mine.length === 1 && theirs.length === 0) return false;
  const col = (sq: string) => (sq.charCodeAt(0) - 97 + Number(sq[1])) % 2;
  const onlyBishops = (a: { type: string }[]) => a.every((p) => p.type === "b");
  if (onlyBishops(mine) && onlyBishops(theirs) && new Set([...mine, ...theirs].map((p) => col(p.square))).size <= 1) return false;
  return true;
}
