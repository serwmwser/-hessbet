"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useActiveAccount } from "thirdweb/react";
import { shortAddr, usdc, WS_URL } from "@/lib/config";
import { useApp } from "@/lib/ctx";
import { useProfile } from "@/lib/profile";
import { Key } from "@/lib/i18n";
import Board, { Clock, Moves } from "./Board";
import Celebrate from "./Celebrate";
import Claim from "./Claim";
import { ReplayBar, useReplay } from "./Replay";

type State = {
  t: "state"; id: number; fen: string; history: string[]; lastMove: { from: string; to: string } | null;
  white: string; black: string; bet: string; turn: "w" | "b"; clock: { w: number; b: number };
  over: boolean; reason: string | null; winner: string | null; drawOffer: string | null; feeBps: number;
};

const REASON: Record<string, Key> = { checkmate: "rChk", timeout: "rTime", resign: "rRes", timeout_draw: "rTimeDraw", abort: "rAbort" };
const EMPTY: string[] = [];

export default function OnlineGame({ id, onExit }: { id: number; onExit: () => void }) {
  const { t, toast } = useApp();
  const account = useActiveAccount();
  const [st, setSt] = useState<State | null>(null);
  const [, tick] = useState(0);
  const recv = useRef(0);
  const ws = useRef<WebSocket | null>(null);
  const me = account?.address.toLowerCase();
  const oppAddr = st ? (st.white === me ? st.black : st.white) : undefined;
  const oppProf = useProfile(oppAddr);
  const replay = useReplay(st?.history ?? EMPTY);

  useEffect(() => {
    if (!account) return;
    let closed = false;
    let retry: ReturnType<typeof setTimeout>;
    const connect = () => {
      const sock = new WebSocket(WS_URL);
      ws.current = sock;
      const join = () => sock.send(JSON.stringify({ t: "join", id }));
      sock.onmessage = async (ev) => {
        const m = JSON.parse(ev.data);
        if (m.t === "challenge") {
          try {
            const message = `ChessBet login\nAddress: ${account.address}\nNonce: ${m.nonce}`;
            const sig = await account.signMessage({ message });
            sock.send(JSON.stringify({ t: "auth", address: account.address, message, sig }));
          } catch { toast("Signature rejected", "err"); }
        } else if (m.t === "authed") join();
        else if (m.t === "state") { setSt(m); recv.current = Date.now(); }
        else if (m.t === "error") {
          if (m.message === "game_not_found") setTimeout(() => sock.readyState === 1 && join(), 1500);
          else if (m.message !== "not_your_turn") toast(m.message, "err");
        }
      };
      sock.onclose = () => { if (!closed) retry = setTimeout(connect, 2000); };
    };
    connect();
    return () => { closed = true; clearTimeout(retry); ws.current?.close(); };
  }, [account, id, toast]);

  // часы обновляются локально между сообщениями сервера
  useEffect(() => { const i = setInterval(() => tick((x) => x + 1), 250); return () => clearInterval(i); }, []);

  const send = (o: object) => ws.current?.readyState === 1 && ws.current.send(JSON.stringify(o));

  if (!st || !account) return <div className="space-y-3"><div className="skeleton h-12" /><div className="skeleton aspect-square max-w-[560px] mx-auto" /><div className="skeleton h-12" /></div>;

  const iAmWhite = st.white === me;
  const myColor = iAmWhite ? "w" : "b";
  const opp = iAmWhite ? st.black : st.white;
  // часы стоят до первого хода белых; первый ход время не расходует
  const started = st.history.length > 0;
  const elapsed = st.over || !started ? 0 : Date.now() - recv.current;
  const rem = (c: "w" | "b") => st.clock[c] - (!st.over && st.turn === c ? elapsed : 0);
  const myTurn = !st.over && st.turn === myColor;
  const bet = Number(st.bet);
  const offerFromOpp = !!st.drawOffer && st.drawOffer !== me;
  const won = st.over && st.winner === me;
  const lost = st.over && !!st.winner && st.winner !== me;
  const drawn = st.over && !st.winner;
  const reasonText = st.reason && REASON[st.reason] ? t(REASON[st.reason]) : drawn ? t("rDraw") : "";

  return (
    <div className="space-y-3">
      {/* таймер каждого игрока: общее время на партию, идёт только на своём ходу */}
      <Clock ms={rem(iAmWhite ? "b" : "w")} active={started && !st.over && st.turn !== myColor} label={`${oppProf?.name || shortAddr(opp)} · ${iAmWhite ? t("black") : t("white")}`} />
      <Board
        fen={replay.fen}
        orientation={iAmWhite ? "white" : "black"}
        lastMove={replay.last}
        disabled={!myTurn || !replay.isLive}
        mute={!replay.isLive}
        onMove={(from, to, promotion) => send({ t: "move", from, to, promotion })}
      />
      <Clock ms={rem(myColor)} active={started && myTurn} label={`${t("profile")} · ${iAmWhite ? t("white") : t("black")}`} />

      <ReplayBar r={replay} />

      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{st.over ? "" : myTurn ? t("yourTurn") : t("oppTurn")}</span>
        <span className="opacity-70">{t("pot")}: <b className="mono">{usdc(bet * 2)}</b> USDC</span>
      </div>
      <Moves san={st.history} />

      {!st.over && (
        <div className="grid grid-cols-2 gap-2">
          {offerFromOpp ? (
            <>
              <button className="btn btn-primary" onClick={() => send({ t: "draw_accept" })}>{t("acceptDraw")}</button>
              <button className="btn btn-ghost" onClick={() => send({ t: "draw_decline" })}>{t("cancel")}</button>
            </>
          ) : (
            <button className="btn btn-ghost" disabled={st.drawOffer === me} onClick={() => send({ t: "draw_offer" })}>{st.drawOffer === me ? "…" : t("offerDraw")}</button>
          )}
          <button className="btn btn-danger" onClick={() => window.confirm(t("resign") + "?") && send({ t: "resign" })}>{t("resign")}</button>
        </div>
      )}

      {st.over && (
        <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} className="card text-center space-y-3 !bg-gradient-to-br from-brand-500/15 to-brand-violet/15">
          {won && <Celebrate />}
          {lost && <div className="text-4xl">♚</div>}
          {drawn && <div className="text-4xl">🤝</div>}
          <div className="text-xl font-bold">{won ? t("won") : lost ? t("lost") : t("drawn")}</div>
          {reasonText && <div className="text-sm opacity-70">{reasonText}</div>}
          {(won || drawn) && <Claim id={st.id} who={account.address} />}
          <button className="btn btn-ghost w-full" onClick={onExit}>{t("backLobby")}</button>
        </motion.div>
      )}
    </div>
  );
}
