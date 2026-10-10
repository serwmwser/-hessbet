import { encodePacked, Hex, keccak256 } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { CHAIN_ID, ESCROW_ADDRESS } from "./config";

// Ключ приглашения — одноразовый ключ, НЕ связанный с деньгами. Контракт хранит только его адрес;
// присоединиться к приватной игре можно, лишь подписав им адрес присоединяющегося.
const STORE = "chessbet.invites";
type Store = Record<string, string>; // адрес ключа (lowercase) → приватный ключ приглашения

const read = (): Store => { try { return JSON.parse(localStorage.getItem(STORE) || "{}"); } catch { return {}; } };

export function newInvite() {
  const key = generatePrivateKey();
  const signer = privateKeyToAccount(key).address;
  const s = read();
  s[signer.toLowerCase()] = key;
  try { localStorage.setItem(STORE, JSON.stringify(s)); } catch { /* нет доступа к хранилищу */ }
  return { signer, key };
}

/** Ключ приглашения для игры, созданной на этом устройстве */
export const keyForSigner = (signer: string): string | undefined => read()[signer.toLowerCase()];

/** Ссылка на игру. Ключ приватной игры кладётся во фрагмент (#k=...), он не уходит на сервер сайта. */
export const gameUrl = (id: number, key?: string) => `${location.origin}/?game=${id}${key ? `#k=${key}` : ""}`;

export const keyFromHash = (): string | null => {
  const m = /[#&]k=(0x[0-9a-fA-F]{64})/.exec(location.hash);
  return m ? m[1] : null;
};

export const keyMatches = (key: string, signer: string) =>
  privateKeyToAccount(key as Hex).address.toLowerCase() === signer.toLowerCase();

/** Подпись, которую проверяет контракт: hash(escrow, chainId, gameId, joiner) */
export async function signJoin(key: string, id: number, joiner: string) {
  const hash = keccak256(
    encodePacked(
      ["address", "uint256", "uint256", "address"],
      [ESCROW_ADDRESS as Hex, BigInt(CHAIN_ID), BigInt(id), joiner as Hex]
    )
  );
  return privateKeyToAccount(key as Hex).signMessage({ message: { raw: hash } });
}
