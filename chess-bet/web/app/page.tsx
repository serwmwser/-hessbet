"use client";
import { useEffect, useState } from "react";
import { useActiveAccount } from "thirdweb/react";
import BotGame from "@/components/BotGame";
import BottomNav, { Tab } from "@/components/BottomNav";
import Header from "@/components/Header";
import Earn from "@/components/Earn";
import FaucetBar from "@/components/FaucetBar";
import Hero from "@/components/Hero";
import Invite from "@/components/Invite";
import Lobby from "@/components/Lobby";
import OnlineGame from "@/components/OnlineGame";
import { WaitingSplash } from "@/components/Splash";
import Profile from "@/components/Profile";
import { fetchMine } from "@/lib/api";
import { TERMS_URL } from "@/lib/config";
import { useApp } from "@/lib/ctx";
import { captureRef, registerRef } from "@/lib/ref";

export default function Home() {
  const { t, toast } = useApp();
  const account = useActiveAccount();
  const [tab, setTab] = useState<Tab>("lobby");
  const [gid, setGid] = useState<number | null>(null);
  const [openCount, setOpenCount] = useState(0);
  const [inviteId, setInviteId] = useState<number | null>(null);
  const addr = account?.address.toLowerCase();

  useEffect(() => { captureRef(); }, []);
  useEffect(() => { if (account) void registerRef(account as never); }, [account]);

  // Ссылка-приглашение: /?game=ID (для приватных игр ключ в #k=...)
  useEffect(() => {
    const p = new URLSearchParams(location.search).get("game");
    if (p && /^\d+$/.test(p)) setInviteId(Number(p));
  }, []);

  // Следим за своими играми: как только соперник принял вызов, переключаемся на доску
  useEffect(() => {
    if (!addr) { setGid(null); setOpenCount(0); return; }
    const poll = async () => {
      try {
        const m = await fetchMine(addr);
        setOpenCount(m.open.length);
        const playing = m.active.find((x) => !x.over);
        if (gid === null && playing) { setGid(playing.id); setTab("play"); toast(t("play"), "ok"); }
      } catch { /* сервер временно недоступен */ }
    };
    poll();
    const i = setInterval(poll, 3000);
    return () => clearInterval(i);
  }, [addr, gid, toast, t]);

  const openGame = (id: number) => { setGid(id); setTab("play"); };

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-3 pt-4 pb-32">
        <FaucetBar />
        {inviteId !== null && <Invite id={inviteId} onClose={() => setInviteId(null)} />}
        {tab === "lobby" && <div className="space-y-4"><Hero onBot={() => setTab("bot")} onEarn={() => setTab("earn")} /><Lobby /></div>}
        {tab === "play" && (gid !== null
          ? <OnlineGame id={gid} onExit={() => { setGid(null); setTab("lobby"); }} />
          : openCount ? <WaitingSplash /> : <div className="card text-center space-y-1 py-10"><div className="text-4xl">♞</div><div className="font-medium">{t("noActive")}</div></div>)}
        {tab === "bot" && <BotGame />}
        {tab === "earn" && <Earn />}
        {tab === "profile" && <Profile onOpenGame={openGame} />}
        <p className="text-center text-xs opacity-50 mt-8">18+ · <a className="underline" href={TERMS_URL}>Terms</a> · Play responsibly</p>
      </main>
      <BottomNav tab={tab} setTab={setTab} badge={gid !== null} />
    </>
  );
}
