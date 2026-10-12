"use client";
import { useState } from "react";
import { useActiveAccount } from "thirdweb/react";
import { useApp } from "@/lib/ctx";
import { postFaucet } from "@/lib/api";
import { FAUCET_ENABLED } from "@/lib/config";

/** Тестовая сеть: заметная кнопка «получить тестовые токены» на любой вкладке (на реальной сети не показывается). */
export default function FaucetBar() {
  const { t, toast } = useApp();
  const account = useActiveAccount();
  const [busy, setBusy] = useState(false);
  if (!FAUCET_ENABLED || !account) return null;
  const get = async () => {
    setBusy(true);
    try { const r = await postFaucet(account.address); toast(r.ok ? t("testTokensDone") : t("testTokensFail"), r.ok ? "ok" : "err"); }
    catch { toast(t("testTokensFail"), "err"); }
    finally { setBusy(false); }
  };
  return (
    <div className="mb-3 flex items-center justify-between gap-3 rounded-2xl border border-amber-300/30 bg-amber-400/10 px-3 py-2 text-sm">
      <span>🧪 {t("testTokensHint")}</span>
      <button className="btn btn-primary shrink-0" disabled={busy} onClick={get}>{t("testTokensGet")}</button>
    </div>
  );
}
