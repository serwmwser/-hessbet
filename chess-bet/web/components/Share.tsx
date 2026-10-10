"use client";
import { useEffect, useState } from "react";
import { useApp } from "@/lib/ctx";

/** Кнопки отправки ссылки-приглашения: системное меню телефона, Telegram, WhatsApp, копирование. */
export default function Share({ url, text }: { url: string; text: string }) {
  const { t, toast } = useApp();
  const [native, setNative] = useState(false);
  useEffect(() => { setNative(typeof navigator.share === "function"); }, []);
  const enc = encodeURIComponent;

  const copy = async () => {
    try { await navigator.clipboard.writeText(url); toast(t("linkCopied"), "ok"); }
    catch { window.prompt(t("copyLink"), url); }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {native && (
        <button className="chip chip-on" onClick={() => navigator.share({ title: "Chess Bet", text, url }).catch(() => {})}>{t("share")}</button>
      )}
      <a className="chip" target="_blank" rel="noreferrer" href={`https://t.me/share/url?url=${enc(url)}&text=${enc(text)}`}>Telegram</a>
      <a className="chip" target="_blank" rel="noreferrer" href={`https://wa.me/?text=${enc(`${text} ${url}`)}`}>WhatsApp</a>
      <button className="chip" onClick={copy}>{t("copyLink")}</button>
    </div>
  );
}
