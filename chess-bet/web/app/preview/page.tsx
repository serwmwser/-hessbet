"use client";

import { useState } from "react";
import Character, { CARTOON_CSS, type Kind, type Mood } from "../../components/cartoon/Character";

const MOODS: { id: Mood; label: string }[] = [
  { id: "idle", label: "Спокойный" },
  { id: "sad", label: "Грустный" },
  { id: "cheer", label: "Радость" },
  { id: "scream", label: "Крик" },
];

const WHITE: Kind[] = ["ninja", "police", "lady"];
const BLACK: Kind[] = ["ninja", "police", "lady", "bandit"];

const NAMES: Record<Kind, string> = {
  ninja: "Ниндзя",
  police: "Полицейский",
  lady: "Девушка",
  bandit: "Бандит",
};

export default function PreviewPage() {
  const [mood, setMood] = useState<Mood>("idle");
  const [own, setOwn] = useState<Record<string, Mood>>({});

  const pick = (key: string) => {
    setOwn((o) => ({ ...o, [key]: "cheer" }));
    setTimeout(() => setOwn((o) => ({ ...o, [key]: "idle" })), 1500);
  };

  const row = (side: "w" | "b", kinds: Kind[]) => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "center" }}>
      {kinds.map((k) => {
        const key = side + k;
        return (
          <button
            key={key}
            onClick={() => pick(key)}
            style={{
              background: side === "w" ? "#f0d9a8" : "#b58863",
              border: "none",
              borderRadius: 12,
              padding: "14px 18px",
              cursor: "pointer",
              textAlign: "center",
            }}
          >
            <Character kind={k} side={side} mood={own[key] ?? mood} size={110} />
            <div style={{ marginTop: 6, fontSize: 13, color: "#2a2140" }}>{NAMES[k]}</div>
          </button>
        );
      })}
    </div>
  );

  return (
    <main style={{ minHeight: "100vh", padding: 20, background: "#241f33", color: "#fff" }}>
      <style>{CARTOON_CSS}</style>
      <h1 style={{ textAlign: "center", fontSize: 22, marginBottom: 14 }}>Мультяшные фигуры: предпросмотр</h1>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 22 }}>
        {MOODS.map((m) => (
          <button
            key={m.id}
            onClick={() => setMood(m.id)}
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              border: "2px solid " + (mood === m.id ? "#ffcc33" : "#555"),
              background: mood === m.id ? "#ffcc33" : "transparent",
              color: mood === m.id ? "#241f33" : "#fff",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      <h2 style={{ textAlign: "center", fontSize: 16, margin: "10px 0" }}>Белые: благородные</h2>
      {row("w", WHITE)}

      <h2 style={{ textAlign: "center", fontSize: 16, margin: "26px 0 10px" }}>Чёрные: бандиты и хулиганы</h2>
      {row("b", BLACK)}

      <p style={{ textAlign: "center", fontSize: 13, opacity: 0.7, marginTop: 22 }}>
        Нажмите на фигуру: она на 1,5 секунды обрадуется.
      </p>
    </main>
  );
}