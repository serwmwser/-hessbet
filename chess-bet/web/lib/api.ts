import { API_URL } from "./config";

export type OpenGame = { id: number; p1: string; bet: string; duration: number };
export type DoneGame = { id: number; white: string; black: string; bet: string; winner: string | null; reason: string; payout: string; at: number };
export type Stats = { wins: number; losses: number; draws: number; net: number };

async function get<T>(path: string): Promise<T> {
  const r = await fetch(API_URL + path, { cache: "no-store" });
  if (!r.ok) throw new Error(String(r.status));
  return r.json();
}
export const fetchGames = () => get<{ feeBps: number; games: OpenGame[] }>("/games");
export const fetchMine = (a: string) => get<{ open: number[]; active: number[] }>(`/mine/${a}`);
export const fetchHistory = (a: string) => get<{ games: DoneGame[]; stats: Stats }>(`/history/${a}`);
