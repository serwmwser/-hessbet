"use client";
import { useApp } from "@/lib/ctx";
import { Key } from "@/lib/i18n";

export type Tab = "lobby" | "play" | "bot" | "profile";
const TABS: { id: Tab; key: Key; icon: string }[] = [
  { id: "lobby", key: "lobby", icon: "♜" },
  { id: "play", key: "play", icon: "♞" },
  { id: "bot", key: "bot", icon: "🤖" },
  { id: "profile", key: "profile", icon: "◉" },
];

export default function BottomNav({ tab, setTab, badge }: { tab: Tab; setTab: (t: Tab) => void; badge?: boolean }) {
  const { t } = useApp();
  return (
    <nav className="glass fixed bottom-0 inset-x-0 z-40 border-x-0 border-b-0 pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto max-w-3xl grid grid-cols-4 px-2 py-1.5">
        {TABS.map((x) => (
          <button
            key={x.id}
            onClick={() => setTab(x.id)}
            aria-current={tab === x.id}
            className={`relative flex flex-col items-center gap-0.5 rounded-2xl py-2 text-xs font-medium transition ${tab === x.id ? "bg-gradient-to-r from-brand-500/20 to-brand-violet/20 text-brand-500" : "opacity-70"}`}
          >
            <span className="text-xl leading-none">{x.icon}</span>
            {t(x.key)}
            {x.id === "play" && badge && <span className="absolute top-1 end-[30%] w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />}
          </button>
        ))}
      </div>
    </nav>
  );
}
