"use client";
import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchGames, OpenGame } from "@/lib/api";
import { BETS, DEFAULT_FEE_BPS, DURATIONS, shortAddr, TERMS_URL, usdc } from "@/lib/config";
import { useApp } from "@/lib/ctx";
import { Step, useEscrow } from "@/lib/tx";

export const durLabel = (sec: number, min: string, hr: string) => (sec < 3600 ? `${sec / 60} ${min}` : `${sec / 3600} ${hr}`);
const QUICK = [50_000, 500_000, 1_000_000, 2_500_000, 5_000_000];

export default function Lobby() {
  const { t, toast, agreed, setAgreed } = useApp();
  const { account, create, join, cancel } = useEscrow();
  const [games, setGames] = useState<OpenGame[] | null>(null);
  const [feeBps, setFeeBps] = useState(DEFAULT_FEE_BPS);
  const [betIdx, setBetIdx] = useState(19); // 1 USDC
  const [dur, setDur] = useState(900);
  const [busy, setBusy] = useState<number | "create" | null>(null);
  const [step, setStep] = useState<Step>("idle");
  const [fMax, setFMax] = useState(0);
  const [fDur, setFDur] = useState(0);

  const refresh = useCallback(async () => {
    try { const r = await fetchGames(); setGames(r.games); setFeeBps(r.feeBps); } catch { setGames((g) => g ?? []); }
  }, []);
  useEffect(() => { refresh(); const i = setInterval(refresh, 4000); return () => clearInterval(i); }, [refresh]);

  const bet = BETS[betIdx];
  const pot = bet * 2;
  const win = pot - Math.floor((pot * feeBps) / 10_000);
  const me = account?.address.toLowerCase();

  const errMsg = (e: unknown) => ((e as Error)?.message || "error").slice(0, 160);
  const guard = () => {
    if (!account) { toast(t("signIn"), "err"); return false; }
    if (!agreed) { toast(t("ageNote"), "err"); return false; }
    return true;
  };
  const stepText = step === "approve" ? t("approving") : step === "confirm" ? t("confirming") : "";

  const onCreate = async () => {
    if (!guard()) return;
    setBusy("create");
    try { await create(bet, dur, setStep); toast(t("waiting"), "ok"); await refresh(); }
    catch (e) { toast(errMsg(e), "err"); }
    finally { setBusy(null); setStep("idle"); }
  };
  const onJoin = async (g: OpenGame) => {
    if (!guard()) return;
    setBusy(g.id);
    try { await join(g.id, Number(g.bet), setStep); await refresh(); }
    catch (e) { toast(errMsg(e), "err"); }
    finally { setBusy(null); setStep("idle"); }
  };
  const onCancel = async (g: OpenGame) => {
    setBusy(g.id);
    try { await cancel(g.id); await refresh(); } catch (e) { toast(errMsg(e), "err"); } finally { setBusy(null); }
  };

  const list = (games ?? []).filter((g) => (!fMax || Number(g.bet) <= fMax) && (!fDur || g.duration === fDur));

  return (
    <div className="space-y-4">
      <section className="card space-y-4">
        <h2 className="text-lg font-bold">{t("createGame")}</h2>

        <div>
          <div className="flex items-baseline justify-between mb-1">
            <label htmlFor="bet" className="text-sm opacity-70">{t("bet")}</label>
            <span className="mono text-2xl font-bold bg-gradient-to-r from-brand-400 to-brand-violet bg-clip-text text-transparent">{usdc(bet)} USDC</span>
          </div>
          <input id="bet" type="range" min={0} max={BETS.length - 1} value={betIdx} onChange={(e) => setBetIdx(+e.target.value)} className="w-full h-8" />
          <div className="flex flex-wrap gap-2 mt-1">
            {QUICK.map((q) => (
              <button key={q} className={`chip ${bet === q ? "chip-on" : ""}`} onClick={() => setBetIdx(BETS.indexOf(q))}>{usdc(q)}</button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-sm opacity-70 mb-1">{t("time")}</div>
          <div className="flex flex-wrap gap-2">
            {DURATIONS.map((d) => (
              <button key={d} className={`chip ${dur === d ? "chip-on" : ""}`} onClick={() => setDur(d)}>{durLabel(d, t("min"), t("hr"))}</button>
            ))}
          </div>
        </div>

        <dl className="grid grid-cols-3 gap-2 text-center text-sm">
          <div className="rounded-2xl bg-black/5 dark:bg-white/5 py-2"><dt className="opacity-60 text-xs">{t("pot")}</dt><dd className="mono font-semibold">{usdc(pot)}</dd></div>
          <div className="rounded-2xl bg-black/5 dark:bg-white/5 py-2"><dt className="opacity-60 text-xs">{t("fee")} {feeBps / 100}%</dt><dd className="mono font-semibold">{usdc(pot - win)}</dd></div>
          <div className="rounded-2xl bg-emerald-500/15 py-2"><dt className="opacity-70 text-xs">{t("winnerGets")}</dt><dd className="mono font-bold text-emerald-500">{usdc(win)}</dd></div>
        </dl>

        {!agreed && (
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" className="mt-1 accent-emerald-500" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
            <span>{t("ageNote")} · <a className="underline" href={TERMS_URL} target="_blank" rel="noreferrer">Terms</a></span>
          </label>
        )}

        <button className="btn btn-primary w-full" disabled={busy !== null} onClick={onCreate}>
          {busy === "create" ? stepText || "…" : t("create")}
        </button>
        {!account && <p className="text-sm opacity-70 text-center">{t("signIn")}</p>}
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-bold me-auto">{t("lobby")}</h2>
          <select aria-label={t("bet")} value={fMax} onChange={(e) => setFMax(+e.target.value)} className="rounded-xl bg-black/5 dark:bg-white/10 px-2 py-1.5 text-sm">
            <option value={0} className="text-slate-900">{t("bet")}: {t("any")}</option>
            {[500_000, 1_000_000, 2_500_000, 5_000_000].map((v) => <option key={v} value={v} className="text-slate-900">≤ {usdc(v)}</option>)}
          </select>
          <select aria-label={t("time")} value={fDur} onChange={(e) => setFDur(+e.target.value)} className="rounded-xl bg-black/5 dark:bg-white/10 px-2 py-1.5 text-sm">
            <option value={0} className="text-slate-900">{t("time")}: {t("any")}</option>
            {DURATIONS.map((d) => <option key={d} value={d} className="text-slate-900">{durLabel(d, t("min"), t("hr"))}</option>)}
          </select>
        </div>

        {games === null && [0, 1, 2].map((i) => <div key={i} className="skeleton h-[72px]" />)}
        {games !== null && list.length === 0 && <div className="card text-center opacity-70 text-sm">{t("noGames")}</div>}

        <AnimatePresence initial={false}>
          {list.map((g) => {
            const mine = g.p1 === me;
            return (
              <motion.div key={g.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} className="card flex items-center gap-3 !py-3">
                <div className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-500/25 to-brand-violet/25 text-xl">♟</div>
                <div className="me-auto min-w-0">
                  <div className="mono font-bold">{usdc(g.bet)} USDC</div>
                  <div className="text-xs opacity-60 truncate" dir="ltr">{durLabel(g.duration, t("min"), t("hr"))} · {shortAddr(g.p1)}</div>
                </div>
                {mine
                  ? <button className="btn btn-ghost !py-2" disabled={busy !== null} onClick={() => onCancel(g)}>{t("cancel")}</button>
                  : <button className="btn btn-primary !py-2" disabled={busy !== null} onClick={() => onJoin(g)}>{busy === g.id ? stepText || "…" : t("join")}</button>}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </section>
    </div>
  );
}
