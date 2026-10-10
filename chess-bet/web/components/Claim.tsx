"use client";
import { useCallback, useEffect, useState } from "react";
import { usdc } from "@/lib/config";
import { useApp } from "@/lib/ctx";
import { readClaimInfo, useEscrow } from "@/lib/tx";

type Info = { amount: number; claimed: boolean; status: number };

/** Кнопка «Забрать» для игры: выигрыш или возврат ставки при ничьей. Состояния: ожидание подтверждения в блокчейне → кнопка → «Получено». */
export default function Claim({ id, who, onClaimed }: { id: number; who: string; onClaimed?: () => void }) {
  const { t, toast } = useApp();
  const { claim } = useEscrow();
  const [info, setInfo] = useState<Info | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => { try { setInfo(await readClaimInfo(id, who)); } catch { /* повторим */ } }, [id, who]);
  useEffect(() => {
    load();
    const i = setInterval(load, 4000);
    return () => clearInterval(i);
  }, [load]);

  if (!info) return <div className="skeleton h-12" />;
  if (info.claimed) return <div className="rounded-2xl bg-emerald-500/15 text-emerald-500 font-semibold py-3 text-center">{t("claimed")}</div>;
  if (info.amount === 0) return info.status === 2 ? <div className="text-sm opacity-70 text-center animate-pulse">{t("payoutWait")}</div> : null;

  return (
    <div className="space-y-1">
      <button
        className="btn btn-primary w-full text-base"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          try { await claim(id); await load(); toast(t("claimed"), "ok"); onClaimed?.(); }
          catch (e) { toast(((e as Error).message || "error").slice(0, 160), "err"); }
          finally { setBusy(false); }
        }}
      >
        {busy ? "…" : `${t("claim")} +${usdc(info.amount)} USDC`}
      </button>
      <p className="text-xs opacity-60 text-center">{t("claimNote")}</p>
    </div>
  );
}
