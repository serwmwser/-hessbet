// Копирует движок Stockfish в public/, чтобы запускать его как Web Worker с нашего же домена.
import fs from "node:fs";
import path from "node:path";

const src = path.resolve("node_modules/stockfish.js/stockfish.js");
const dst = path.resolve("public/stockfish.js");
try {
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.copyFileSync(src, dst);
  console.log("stockfish.js скопирован в public/");
} catch (e) {
  console.warn("Не удалось скопировать stockfish.js:", e.message);
}
