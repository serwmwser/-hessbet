"use client";
import { useCallback, useEffect, useState } from "react";
import { fetchHistory, fetchMine, LiveInfo, OpenGame } from "@/lib/api";
import { usdc } from "@/lib/config";
import { useApp } from "@/lib/ctx";
import { gameUrl, keyForSigner } from "@/lib/invite";
import { readClaimInfo, useEscrow } from "@/lib/tx";
import Claim from "./Claim";
import { durLabel } from "./Lobby";
import Share from "./Share";

const GRACE_MS = 3 * 86_400_000;

/** Раздел профиля: мои созданные игры, идущие партии, невостребованные выплаты и аварийный возврат ставок. */
export default function MyGames({ onOpenGame }: { onOpenGame: (id: number) => void }) {
  const { t, toast } = useApp();
  const { account, cancel, refund } = useEscrow();
  const me = account?.address;
  const [mine, setMine] = useState<{ open: OpenGame[]; active: LiveInfo[] } | null>(null);
  const [claims, setClaims] = useState<{ id: number }[]>([]);
  const [rid, setRid] = useState("");
  const [busy, setBusy] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());

  const loadMine = useCallback(async () => {
    if (!me) return;
    try { setMine(await fetchMine(me.toLowerCase())); setNow(Date.now()); } catch { /* сервер недоступен */ }
  }, [me]);
  useEffect(() => { loadMine(); const i = setInterval(loadMine, 4000); return () => clearInterval(i); }, [loadMine]);

  // выплаты, которые игрок ещё не забрал, — по последним 20 завершённым играм
  const loadClaims = useCallback(async () => {
    if (!me) return;
    try {
      const h = await fetchHistory(me.toLowerCase());
      const infos = await Promise.all(
        h.games.slice(0, 20).map((g) => readClaimInfo(g.id, me).then((i) => ({ id: g.id, ...i })).catch(() => null))
      );
      setClaims(infos.filter((x): x is NonNullable<typeof x> => !!x && x.amount > 0 && !x.claimed).map((x) => ({ id: x.id })));
    } catch { /* повторим позже */ }
  }, [me]);
  useEffect(() => { loadClaims(); const i = setInterval(loadClaims, 15000); return () => clearInterval(i); }, [loadClaims]);

  if (!me) return null;

  const errMsg = (e: unknown) => ((e as Error)?.message || "error").slice(0, 160);
  const playing = (mine?.active ?? []).filter((g) => !g.over);
  const stuck = (mine?.active ?? []).filter((g) => now > g.startedAt + (2 * g.duration * 1000 + GRACE_MS));

  const doCancel = async (id: number) => {
    setBusy(id);
    try { await cancel(id); await loadMine(); } catch (e) { toast(errMsg(e), "err"); } finally { setBusy(null); }
  };
  const doRefund = async (id: number) => {
    setBusy(id);
    try { await refund(id); toast(t("claim"), "ok"); await loadClaims(); } catch (e) { toast(errMsg(e), "err"); } finally { setBusy(null); }
  };

  return (
    <>
      <section className="card space-y-3">
        <h2 className="text-lg font-bold">{t("myGames")}</h2>
        {mine === null && <div className="skeleton h-14" />}
        {mine && mine.open.length === 0 && playing.length === 0 && <p className="text-sm opacity-70">{t("noMyGames")}</p>}

        {playing.map((g) => (
          <div key={g.id} className="flex items-center gap-3 rounded-2xl bg-emerald-500/10 px-3 py-2">
            <span className="text-xl">♞</span>
            <div className="me-auto"><div className="mono font-semibold">#{g.id} · {usdc(g.bet)} USDC</div><div className="text-xs opacity-60">{t("live")}</div></div>
            <button className="btn btn-primary !py-2" onClick={() => onOpenGame(g.id)}>{t("resume")}</button>
          </div>
        ))}

        {mine?.open.map((g) => {
          const k = g.signer ? keyForSigner(g.signer) : undefined;
          return (
            <div key={g.id} className="rounded-2xl bg-black/5 dark:bg-white/5 px-3 py-2 space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-xl">{g.signer ? "🔒" : "⏳"}</span>
                <div className="me-auto">
                  <div className="mono font-semibold">#{g.id} · {usdc(g.bet)} USDC</div>
                  <div className="text-xs opacity-60">{durLabel(g.duration, t("min"), t("hr"))} · {g.signer ? `${t("priv")} · ` : ""}{t("waiting")}</div>
                </div>
                <button className="btn btn-ghost !py-2" disabled={busy === g.id} onClick={() => doCancel(g.id)}>{t("cancel")}</button>
              </div>
              {(!g.signer || k) && <Share url={gameUrl(g.id, k)} text={`${t("inviteText")} · ${usdc(g.bet)} USDC`} />}
            </div>
          );
        })}
      </section>

      {claims.length > 0 && (
        <section className="card space-y-2">
          <h2 className="text-lg font-bold">{t("unclaimed")}</h2>
          {claims.map((c) => (
            <div key={c.id} className="flex items-start gap-3">
              <span className="mono text-sm pt-3">#{c.id}</span>
              <div className="flex-1"><Claim id={c.id} who={me} onClaimed={loadClaims} /></div>
            </div>
          ))}
        </section>
      )}

      <details className="card">
        <summary className="cursor-pointer font-semibold">{t("refund")}</summary>
        <div className="space-y-3 mt-3">
          <p className="text-sm opacity-70">{t("refundHint")}</p>
          {stuck.map((g) => (
            <div key={g.id} className="flex items-center gap-3">
              <span className="mono me-auto">#{g.id} · {usdc(g.bet)} USDC</span>
              <button className="btn btn-ghost !py-2" disabled={busy === g.id} onClick={() => doRefund(g.id)}>{t("refund")}</button>
            </div>
          ))}
          <div className="flex gap-2">
            <input
              inputMode="numeric" value={rid} onChange={(e) => setRid(e.target.value.replace(/\D/g, ""))} placeholder={t("gameId")} aria-label={t("gameId")}
              className="flex-1 rounded-2xl bg-black/5 dark:bg-white/10 px-3 py-2 outline-none mono"
            />
            <button className="btn btn-ghost" disabled={!rid || busy !== null} onClick={() => doRefund(Number(rid))}>{t("refund")}</button>
          </div>
        </div>
      </details>
    </>
  );
}
