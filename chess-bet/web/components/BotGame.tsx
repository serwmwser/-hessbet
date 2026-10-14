"use client";
import { useState } from "react";
import { BOT_TIMES } from "@/lib/config";
import { useApp } from "@/lib/ctx";
import { usePT } from "@/lib/pauseTxt";
import { botMove, botPause, botReset, botResign, botResume, startBot, useBot, Res } from "@/lib/botStore";
import Board, { Clock, Moves } from "./Board";
import PausePage, { PauseButton } from "./PausePage";
import { LoseSplash, WinSplash } from "./Splash";
import { ReplayBar, useReplay } from "./Replay";

export default function BotGame() {
  const { t } = useApp();
  const pt = usePT();
  const s = useBot(); // партия хранится в lib/botStore и не теряется при смене вкладки
  const [minutes, setMinutes] = useState(s.minutes);
  const [level, setLevel] = useState(s.level);
  const [pick, setPick] = useState<"w" | "b" | "r">("w");
  const [hide, setHide] = useState(false); // окно результата закрыто крестиком: видна доска с итоговой позицией
  const again = () => { setHide(false); botReset(); };
  const san = s.chess.history();
  const replay = useReplay(san);

  const resText = (r: Res) => ({
    text: r.kind === "draw" ? t("rDraw") : r.kind === "win" ? t("won") : t("lost"),
    sub: r.why === "chk" ? t("rChk") : r.why === "time" ? t("rTime") : r.why === "timeDraw" ? t("rTimeDraw") : r.why === "res" ? t("rRes") : r.why === "pause" ? pt.lostPause : "",
  });

  if (!s.playing && !s.res) {
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
        <button className="btn btn-primary w-full" onClick={() => startBot(minutes, level, pick)}>{t("newGame")}</button>
      </section>
    );
  }

  const c = s.chess;
  const botColor = s.me === "w" ? "b" : "w";
  const started = san.length > 0;
  const myTurn = s.playing && !s.over && !s.pause && c.turn() === s.me;
  const res = s.res ? resText(s.res) : null;

  return (
    <div className="space-y-3">
      {s.pause && s.playing && (
        <PausePage mode="bot" until={s.pause.until} byMe color={s.pause.color} left={s.pausesLeft[s.pause.color]} onResume={botResume} />
      )}
      <Clock ms={s[botColor]} active={s.playing && !s.pause && c.turn() === botColor} label={`🤖 ${t("level")} ${s.level}`} />
      <Board
        fen={replay.fen}
        orientation={s.me === "w" ? "white" : "black"}
        lastMove={replay.last}
        disabled={!myTurn || !replay.isLive}
        mute={!replay.isLive}
        onMove={botMove}
      />
      <Clock ms={s[s.me]} active={myTurn} label={s.me === "w" ? t("white") : t("black")} />
      <ReplayBar r={replay} />
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm font-medium min-h-5">{s.thinking ? t("thinking") : myTurn ? t("yourTurn") : ""}</div>
        {!s.over && <PauseButton left={s.pausesLeft[s.me]} active={myTurn && started} onClick={botPause} />}
      </div>
      <Moves san={san} />
      {res ? (
        hide ? (
          <button className="btn btn-primary w-full" onClick={again}>{t("newGame")}</button>
        ) : (
          <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 grid place-items-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="relative w-full max-w-sm max-h-[90vh] overflow-y-auto rounded-3xl border border-white/20 bg-slate-900 text-white shadow-2xl ring-4 ring-brand-500/40 p-5 text-center space-y-3">
              <button type="button" aria-label="close" className="absolute top-2 end-3 text-2xl leading-none text-white/60 hover:text-white" onClick={() => setHide(true)}>✕</button>
              {s.res?.kind === "win" && <WinSplash sub={pt.botWin} />}
              {s.res?.kind === "lose" && <LoseSplash sub={pt.botLose} />}
              {s.res?.kind === "draw" && <div className="text-2xl font-extrabold py-4">{res.text}</div>}
              {res.sub && <div className="text-sm text-white/70">{res.sub}</div>}
              <button className="btn btn-primary w-full" onClick={again}>{t("newGame")}</button>
            </div>
          </div>
        )
      ) : (
        <button className="btn btn-danger w-full" onClick={botResign}>{t("resign")}</button>
      )}
    </div>
  );
}
