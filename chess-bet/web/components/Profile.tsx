"use client";
import { useEffect, useState } from "react";
import { useActiveAccount, useWalletBalance } from "thirdweb/react";
import { fetchHistory, DoneGame, Stats } from "@/lib/api";
import { chain, client, shortAddr, usdc, USDC_ADDRESS } from "@/lib/config";
import { BOARDS, BoardName, useApp } from "@/lib/ctx";

export default function Profile() {
  const { t, board, setBoard } = useApp();
  const account = useActiveAccount();
  const me = account?.address;
  const pol = useWalletBalance({ client, chain, address: me });
  const usd = useWalletBalance({ client, chain, address: me, tokenAddress: USDC_ADDRESS });
  const [data, setData] = useState<{ games: DoneGame[]; stats: Stats } | null>(null);

  useEffect(() => {
    if (!me) { setData(null); return; }
    const load = () => fetchHistory(me.toLowerCase()).then(setData).catch(() => {});
    load();
    const i = setInterval(load, 8000);
    return () => clearInterval(i);
  }, [me]);

  const lowGas = !!pol.data && Number(pol.data.displayValue) < 0.01;
  const net = data ? data.stats.net : 0;

  return (
    <div className="space-y-4">
      {!me ? (
        <div className="card text-center opacity-80">{t("signIn")}</div>
      ) : (
        <>
          <section className="card space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">{t("balance")}</h2>
              <span className="mono text-xs opacity-60" dir="ltr">{shortAddr(me)}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-2xl bg-emerald-500/10 p-3"><div className="text-xs opacity-60">USDC</div><div className="mono text-xl font-bold">{usd.data ? Number(usd.data.displayValue).toFixed(2) : "…"}</div></div>
              <div className="rounded-2xl bg-violet-500/10 p-3"><div className="text-xs opacity-60">POL</div><div className="mono text-xl font-bold">{pol.data ? Number(pol.data.displayValue).toFixed(3) : "…"}</div></div>
            </div>
            {lowGas && <p className="text-sm rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-300 px-3 py-2">⛽ {t("lowGas")}</p>}
          </section>

          <section className="card space-y-3">
            <h2 className="text-lg font-bold">{t("stats")}</h2>
            <div className="grid grid-cols-4 gap-2 text-center">
              {([[t("wins"), data?.stats.wins], [t("losses"), data?.stats.losses], [t("draws"), data?.stats.draws]] as const).map(([l, v]) => (
                <div key={l} className="rounded-2xl bg-black/5 dark:bg-white/5 py-2"><div className="mono text-xl font-bold">{v ?? "–"}</div><div className="text-[11px] opacity-60">{l}</div></div>
              ))}
              <div className="rounded-2xl bg-black/5 dark:bg-white/5 py-2">
                <div className={`mono text-xl font-bold ${net > 0 ? "text-emerald-500" : net < 0 ? "text-red-500" : ""}`}>{net > 0 ? "+" : ""}{usdc(net)}</div>
                <div className="text-[11px] opacity-60">{t("net")}</div>
              </div>
            </div>
          </section>

          <section className="card space-y-2">
            <h2 className="text-lg font-bold">{t("history")}</h2>
            {data === null && <div className="skeleton h-14" />}
            {data?.games.map((g) => {
              const mine = me.toLowerCase();
              const won = g.winner === mine, drawn = !g.winner;
              const opp = g.white === mine ? g.black : g.white;
              const delta = drawn ? 0 : won ? Number(g.payout) - Number(g.bet) : -Number(g.bet);
              return (
                <div key={g.id} className="flex items-center gap-3 rounded-2xl bg-black/5 dark:bg-white/5 px-3 py-2">
                  <span className="text-xl">{drawn ? "🤝" : won ? "🏆" : "♚"}</span>
                  <div className="me-auto min-w-0">
                    <div className="text-sm font-medium">{drawn ? t("rDraw") : won ? t("won") : t("lost")}</div>
                    <div className="text-xs opacity-60" dir="ltr">#{g.id} · {shortAddr(opp)} · {new Date(g.at).toLocaleDateString()}</div>
                  </div>
                  <span className={`mono font-semibold ${delta > 0 ? "text-emerald-500" : delta < 0 ? "text-red-500" : "opacity-60"}`}>{delta > 0 ? "+" : ""}{usdc(delta)}</span>
                </div>
              );
            })}
          </section>
        </>
      )}

      <section className="card space-y-2">
        <h2 className="text-lg font-bold">{t("boardTheme")}</h2>
        <div className="flex gap-3 flex-wrap">
          {(Object.keys(BOARDS) as BoardName[]).map((b) => (
            <button key={b} onClick={() => setBoard(b)} aria-label={b} aria-pressed={board === b}
              className={`w-14 h-14 rounded-2xl overflow-hidden grid grid-cols-2 border-2 ${board === b ? "border-emerald-500" : "border-transparent"}`}>
              {[0, 1, 1, 0].map((c, i) => <span key={i} style={{ background: BOARDS[b][c] }} />)}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
