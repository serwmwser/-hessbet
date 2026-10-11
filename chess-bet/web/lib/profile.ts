"use client";
import { useEffect, useState } from "react";
import { fetchProfiles } from "./api";

const cache = new Map<string, { name: string; avatar: string } | null>();

/** Логин и аватар игрока по адресу (с кэшем). Пока нет данных — null. */
export function useProfile(addr?: string) {
  const a = addr?.toLowerCase();
  const [p, setP] = useState<{ name: string; avatar: string } | null>(a ? cache.get(a) ?? null : null);
  useEffect(() => {
    if (!a) return;
    if (cache.has(a)) { setP(cache.get(a) ?? null); return; }
    let live = true;
    fetchProfiles([a]).then((r) => { cache.set(a, r[a] ?? null); if (live) setP(r[a] ?? null); }).catch(() => {});
    return () => { live = false; };
  }, [a]);
  return p;
}
export const forgetProfile = (a: string) => cache.delete(a.toLowerCase());

/** Сжимает выбранную картинку до квадрата 128×128 (JPEG) — чтобы аватар весил несколько КБ. */
export function resizeAvatar(file: File, size = 128): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = c.height = size;
      const ctx = c.getContext("2d");
      if (!ctx) { URL.revokeObjectURL(url); return reject(new Error("canvas")); }
      const s = Math.min(img.width, img.height);
      ctx.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("image")); };
    img.src = url;
  });
}

export async function sha256Hex(s: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
