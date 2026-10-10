"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Chess } from "chess.js";
import { BOT_TIMES } from "@/lib/config";
import { useApp } from "@/lib/ctx";
import { canMate } from "@/lib/rules";
import Board, { Clock, Moves } from "./Board";
import Celebrate from "./Celebrate";
import { ReplayBar, useReplay } from "./Replay";

// Уровни 1–8 → Skill Level Stockfish и время на ход
const SKILL = [0, 3, 5, 8, 11, 14, 17, 20];
const MOVETIME = [100, 150, 250, 400, 600, 800, 1000, 1500];
/** Бот отвечает не раньше чем через 2 секунды после хода игрока */
const BOT_DELAY = 2000;

type G = {
  chess: Chess; w: number; b: number; last: number; over: boolean; me: "w" | "b";
  playing: boolean; level: number; sid: number; askedAt: number;
};

export default function BotGame() {
  const { t } = useApp();
  const [minutes, setMinutes] = useState(15);
  const [level, setLevel] = useState(3);
  const [pick, setPick] = useState<"w" | "b" | "r">("w");
  const [res, setRes] = useState<{ text: string; sub: string; win: boolean } | null>(null);
  const [thinking, setThinking] = useState(false);
  const [, force] = useState(0);
  const rerender = () => force((x) => x + 1);
  const g = useRef<G>({ chess: new Chess(), w: 0, b: 0, last: 0, over: false, me: "w", playing: false, level: 3, sid: 0, askedAt: 0 });
  const worker = useRef<Worker | null>(null);

  const san = g.current.chess.history();
  const replay = useReplay(san);

  const end = useCallback((sub: string, winner: "w" | "b" | null) => {
    const s = g.current;
    if (s.over) return;
    s.over = true; s.playing = false; setThinking(false);
    setRes({
      text: winner === null ? t("rDraw") : winner === s.me ? t("won") : t("lost"),
      sub,
      win: winner === s.me,
    });
    rerender();
  }, [t]);

  const checkEnd = useCallback(() => {
    const c = g.current.chess;
    if (c.isCheckmate()) end(t("rChk"), c.turn() === "w" ? "b" : "w");
    else if (c.isDraw() || c.isStalemate() || c.isInsufficientMaterial()) end("", null);
  }, [end, t]);

  // просрочка времени: победа соперника, а если он не может поставить мат — ничья
  const flag = useCallback((loser: "w" | "b") => {
    const winner = loser === "w" ? "b" : "w";
    if (!canMate(g.current.chess, winner)) end(t("rTimeDraw"), null);
    else end(t("rTime"), winner);
  }, [end, t]);

  const askBot = useCallback(() => {
    const s = g.current;
    if (s.over || !worker.current) return;
    s.askedAt = Date.now();
    setThinking(true);
    worker.current.postMessage(`setoption name Skill Level value ${SKILL[s.level - 1]}`);
    worker.current.postMessage(`position fen ${s.chess.fen()}`);
    worker.current.postMessage(`go movetime ${MOVETIME[s.level - 1]}`);
  }, []);

  // Stockfish в Web Worker (файл копируется в public/ скриптом postinstall)
  useEffect(() => {
    let w: Worker;
    try { w = new Worker(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/stockfish.js`); } catch { return; }
    worker.current = w;
    w.postMessage("uci");
    w.onmessage = (ev) => {
      const line = String(ev.data);
      if (!line.startsWith("bestmove")) return;
      const s0 = g.current;
      const mv = line.split(" ")[1];
      if (!s0.playing || s0.over || !mv || mv === "(none)") return;
      const sid = s0.sid;
      const ply = s0.chess.history().length;
      // ждём, пока с момента хода игрока пройдёт BOT_DELAY (часы бота при этом идут)
      const wait = Math.max(0, BOT_DELAY - (Date.now() - s0.askedAt));
      setTimeout(() => {
        const s = g.current;
        if (s.sid !== sid || !s.playing || s.over || s.chess.history().length !== ply) return; // игру сбросили или она уже закончилась
        const now = Date.now();
        const side = s.chess.turn();
        if (s.chess.history().length > 0) s[side] -= now - s.last; // первый ход белых время не расходует
        s.last = now;
        try { s.chess.move({ from: mv.slice(0, 2), to: mv.slice(2, 4), promotion: mv[4] }); } catch { return; }
        setThinking(false);
        checkEnd();
        rerender();
      }, wait);
    };
    return () => w.terminate();
  }, [checkEnd]);

  // часы
  useEffect(() => {
    const i = setInterval(() => {
      const s = g.current;
      if (!s.playing || s.over) return;
      const now = Date.now(), side = s.chess.turn();
      if (s.chess.history().length === 0) { s.last = now; return; } // часы стоят до первого хода белых
      s[side] -= now - s.last; s.last = now;
      if (s[side] <= 0) { s[side] = 0; flag(side); }
      rerender();
    }, 200);
    return () => clearInterval(i);
  }, [flag]);

  const start = () => {
    const me = pick === "r" ? (Math.random() < 0.5 ? "w" : "b") : pick;
    const ms = minutes * 60_000;
    g.current = { chess: new Chess(), w: ms, b: ms, last: Date.now(), over: false, me, playing: true, level, sid: g.current.sid + 1, askedAt: 0 };
    setRes(null);
    rerender();
    if (me === "b") askBot();
  };

  const s = g.current;
  const onMove = (from: string, to: string, promotion?: string) => {
    if (!s.playing || s.over || s.chess.turn() !== s.me) return;
    const now = Date.now();
    if (s.chess.history().length > 0) s[s.me] -= now - s.last; // первый ход белых время не расходует
    s.last = now;
    try { s.chess.move({ from, to, promotion }); } catch { return; }
    rerender();
    checkEnd();
    if (!g.current.over) askBot();
  };

  if (!s.playing && !res) {
    return (
      <section className="card space-y-5">
        <h2 className="text-lg font-bold">{t("bot")}</h2>
        <div>
          <div className="text-sm opacity-70 mb-1">{t("time")}</div>
          <div className="flex gap-2 flex-wrap">
            {BOT_TIMES.map((m) => <button key={m} className={`chip ${minutes === m ? "chip-on" : ""}`} onClick={() => setMinutes(m)}>{m} {t("min")}</button>)}
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1"><span className="opacity-70">{t("level")}</span><b className="mono">{level}</b></div>
          <input type="range" min={1} max={8} value={level} onChange={(e) => setLevel(+e.target.value)} className="w-full h-8" aria-label={t("level")} />
        </div>
        <div>
          <div className="text-sm opacity-70 mb-1">{t("color")}</div>
          <div className="flex gap-2 flex-wrap">
            {([["w", t("white")], ["b", t("black")], ["r", t("random")]] as const).map(([k, l]) => (
              <button key={k} className={`chip ${pick === k ? "chip-on" : ""}`} onClick={() => setPick(k)}>{l}</button>
            ))}
          </div>
        </div>
        <button className="btn btn-primary w-full" onClick={start}>{t("newGame")}</button>
      </section>
    );
  }

  const c = s.chess;
  const botColor = s.me === "w" ? "b" : "w";
  const myTurn = s.playing && !s.over && c.turn() === s.me;

  return (
    <div className="space-y-3">
      <Clock ms={s[botColor]} active={s.playing && c.turn() === botColor} label={`🤖 ${t("level")} ${s.level}`} />
      <Board
        fen={replay.fen}
        orientation={s.me === "w" ? "white" : "black"}
        lastMove={replay.last}
        disabled={!myTurn || !replay.isLive}
        mute={!replay.isLive}
        onMove={onMove}
      />
      <Clock ms={s[s.me]} active={myTurn} label={s.me === "w" ? t("white") : t("black")} />
      <ReplayBar r={replay} />
      <div className="text-sm font-medium min-h-5">{thinking ? t("thinking") : myTurn ? t("yourTurn") : ""}</div>
      <Moves san={san} />
      {res ? (
        <div className="card text-center space-y-2 !bg-gradient-to-br from-brand-500/15 to-brand-violet/15">
          {res.win && <Celebrate />}
          <div className="text-xl font-bold">{res.text}</div>
          {res.sub && <div className="text-sm opacity-70">{res.sub}</div>}
          <button className="btn btn-primary w-full" onClick={() => { g.current = { ...g.current, playing: false }; setRes(null); rerender(); }}>{t("newGame")}</button>
        </div>
      ) : (
        <button className="btn btn-danger w-full" onClick={() => end(t("rRes"), botColor)}>{t("resign")}</button>
      )}
    </div>
  );
}
