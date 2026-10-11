import { API_URL } from "./config";

export type OpenGame = { id: number; p1: string; bet: string; duration: number; signer: string | null };
export type LiveInfo = { id: number; bet: string; duration: number; white: string; black: string; startedAt: number; over: boolean };
export type DoneGame = { id: number; white: string; black: string; bet: string; winner: string | null; reason: string; payout: string; at: number };
export type Stats = { wins: number; losses: number; draws: number; net: number };

async function get<T>(path: string): Promise<T> {
  const r = await fetch(API_URL + path, { cache: "no-store" });
  if (!r.ok) throw new Error(String(r.status));
  return r.json();
}
export const fetchGames = () => get<{ feeBps: number; games: OpenGame[] }>("/games");
export const fetchGame = (id: number) => get<{ status: "open" | "active" | "done" | "unknown"; game?: OpenGame }>(`/game/${id}`);
export const fetchMine = (a: string) => get<{ open: OpenGame[]; active: LiveInfo[] }>(`/mine/${a}`);
export const fetchHistory = (a: string) => get<{ games: DoneGame[]; stats: Stats }>(`/history/${a}`);

export type ProfileData = { name: string; bio: string; link: string; avatar: string };
export const fetchProfile = (a: string) => get<ProfileData | null>(`/profile/${a}`);
export const fetchProfiles = (a: string[]) => get<Record<string, { name: string; avatar: string }>>(`/profiles?a=${a.join(",")}`);
export async function postProfile(body: Record<string, unknown>): Promise<{ ok: boolean; error?: string }> {
  const r = await fetch(API_URL + "/profile", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  return r.json();
}
