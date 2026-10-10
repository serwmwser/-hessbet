import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { WebSocketServer, WebSocket } from "ws";
import { Chess } from "chess.js";
import { ethers } from "ethers";

const {
  RPC_URL,
  ESCROW,
  ORACLE_PK,
  PORT = "8080",
  ALLOWED_ORIGINS = "",
  BLOCKED_COUNTRIES = "",
  STATE_FILE = "./data/state.json",
} = process.env;
if (!RPC_URL || !ESCROW || !ORACLE_PK) {
  console.error("Нужны RPC_URL, ESCROW, ORACLE_PK (см. .env.example)");
  process.exit(1);
}

const ABI = [
  "event GameCreated(uint256 indexed id,address indexed p1,uint256 bet,uint32 duration)",
  "event GameJoined(uint256 indexed id,address indexed p1,address indexed p2)",
  "event GameCancelled(uint256 indexed id)",
  "function games(uint256) view returns (address p1,address p2,uint128 bet,uint32 duration,uint64 startedAt,uint8 status)",
  "function nextGameId() view returns (uint256)",
  "function feeBps() view returns (uint16)",
  "function reportResult(uint256 id,address winner)",
];
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(ORACLE_PK, provider);
const escrow = new ethers.Contract(ESCROW, ABI, wallet);

// ---------- типы и состояние ----------
type OpenGame = { id: number; p1: string; bet: string; duration: number };
type Live = {
  id: number; white: string; black: string; bet: string; duration: number;
  chess: Chess; clock: { w: number; b: number }; last: number;
  drawOffer: string | null; over: boolean; reason: string | null; winner: string | null;
  reported: boolean; socks: Set<WebSocket>;
};
type Done = {
  id: number; white: string; black: string; bet: string; winner: string | null;
  reason: string; payout: string; pgn: string; at: number;
};

const open = new Map<number, OpenGame>();
const live = new Map<number, Live>();
let done: Done[] = [];
let scanFrom = 1;
let feeBps = 600;
const lc = (a: string) => a.toLowerCase();

// ---------- сохранение состояния ----------
function load() {
  try {
    const s = JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
    done = s.done ?? [];
    scanFrom = s.scanFrom ?? 1;
    for (const x of s.live ?? []) {
      const chess = new Chess();
      if (x.pgn) chess.loadPgn(x.pgn);
      // время простоя сервера не списывается с игроков
      live.set(x.id, { ...x, chess, last: Date.now(), socks: new Set() });
    }
    console.log(`state: live=${live.size} done=${done.length} scanFrom=${scanFrom}`);
  } catch {
    /* первый запуск */
  }
}
let saveTimer: NodeJS.Timeout | null = null;
function save() {
  if (saveTimer) return;
  saveTimer = setTimeout(() => {
    saveTimer = null;
    const liveOut = [...live.values()].map((g) => ({
      id: g.id, white: g.white, black: g.black, bet: g.bet, duration: g.duration,
      pgn: g.chess.pgn(), clock: g.clock, drawOffer: g.drawOffer, over: g.over,
      reason: g.reason, winner: g.winner, reported: g.reported,
    }));
    fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
    fs.writeFileSync(STATE_FILE + ".tmp", JSON.stringify({ live: liveOut, done: done.slice(-5000), scanFrom }));
    fs.renameSync(STATE_FILE + ".tmp", STATE_FILE);
  }, 500);
}

// ---------- синхронизация с контрактом ----------
async function sync() {
  const next = Number(await escrow.nextGameId());
  let firstNonTerminal = next;
  const seenOpen = new Set<number>();
  for (let id = scanFrom; id < next; id++) {
    const g = await escrow.games(id);
    const st = Number(g.status);
    if (st === 1) {
      seenOpen.add(id);
      open.set(id, { id, p1: lc(g.p1), bet: g.bet.toString(), duration: Number(g.duration) });
    } else if (st === 2) {
      if (!live.has(id) && !done.some((d) => d.id === id)) startLive(id, lc(g.p1), lc(g.p2), g.bet.toString(), Number(g.duration));
    } else {
      open.delete(id);
    }
    if ((st === 1 || st === 2) && id < firstNonTerminal) firstNonTerminal = id;
  }
  // игра на сервере ещё "в процессе", а в контракте уже закрыта (например, refundStuck)
  for (const g of live.values()) {
    if (g.reported || g.id >= next) continue;
    const st = Number((await escrow.games(g.id)).status);
    if (st > 2) { g.reported = true; finalize(g); }
  }
  scanFrom = Math.min(firstNonTerminal, next);
  save();
}

function startLive(id: number, white: string, black: string, bet: string, duration: number) {
  const ms = duration * 1000;
  live.set(id, {
    id, white, black, bet, duration, chess: new Chess(), clock: { w: ms, b: ms }, last: Date.now(),
    drawOffer: null, over: false, reason: null, winner: null, reported: false, socks: new Set(),
  });
  open.delete(id);
  save();
}

// ---------- игровая логика ----------
function remaining(g: Live) {
  const c = { ...g.clock };
  if (!g.over) { const t = g.chess.turn(); c[t] = Math.max(0, c[t] - (Date.now() - g.last)); }
  return c;
}
function snap(g: Live) {
  const h = g.chess.history({ verbose: true });
  const lm = h[h.length - 1];
  return {
    t: "state", id: g.id, fen: g.chess.fen(), history: h.map((m) => m.san),
    lastMove: lm ? { from: lm.from, to: lm.to } : null,
    white: g.white, black: g.black, bet: g.bet, duration: g.duration,
    turn: g.chess.turn(), clock: remaining(g), over: g.over, reason: g.reason,
    winner: g.winner, drawOffer: g.drawOffer, feeBps,
  };
}
function broadcast(g: Live) {
  const m = JSON.stringify(snap(g));
  for (const s of g.socks) if (s.readyState === WebSocket.OPEN) s.send(m);
}
function finish(g: Live, winner: string | null, reason: string) {
  if (g.over) return;
  g.over = true; g.winner = winner; g.reason = reason; g.drawOffer = null;
  // фиксируем остаток часов на момент окончания
  g.clock = remaining({ ...g, over: false } as Live);
  broadcast(g);
  save();
  void report(g);
}

let queue: Promise<unknown> = Promise.resolve();
const enqueue = <T,>(f: () => Promise<T>) => { const r = queue.then(f, f); queue = r.catch(() => {}); return r; };

async function report(g: Live, attempt = 0): Promise<void> {
  try {
    await enqueue(async () => {
      const st = Number((await escrow.games(g.id)).status);
      if (st === 2) {
        const tx = await escrow.reportResult(g.id, g.winner ?? ethers.ZeroAddress);
        await tx.wait();
      }
    });
    g.reported = true;
    finalize(g);
  } catch (e) {
    console.error(`reportResult #${g.id} попытка ${attempt + 1} не удалась:`, (e as Error).message);
    setTimeout(() => void report(g, attempt + 1), Math.min(60_000, 2000 * 2 ** attempt));
  }
}
function finalize(g: Live) {
  if (done.some((d) => d.id === g.id)) { live.delete(g.id); return; }
  const pot = BigInt(g.bet) * 2n;
  const fee = g.winner ? (pot * BigInt(feeBps)) / 10000n : 0n;
  done.push({
    id: g.id, white: g.white, black: g.black, bet: g.bet, winner: g.winner,
    reason: g.reason ?? "unknown", payout: g.winner ? (pot - fee).toString() : g.bet,
    pgn: g.chess.pgn(), at: Date.now(),
  });
  live.delete(g.id);
  save();
}

setInterval(() => {
  for (const g of live.values()) {
    if (g.over) continue;
    const t = g.chess.turn();
    if (remaining(g)[t] <= 0) finish(g, t === "w" ? g.black : g.white, "timeout");
  }
}, 1000);

// ---------- HTTP ----------
const origins = ALLOWED_ORIGINS.split(",").map((s) => s.trim()).filter(Boolean);
const blocked = BLOCKED_COUNTRIES.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean);
const originOk = (o?: string) => origins.length === 0 || (!!o && origins.includes(o));
const geoBlocked = (req: http.IncomingMessage) => {
  const c = String(req.headers["cf-ipcountry"] ?? "").toUpperCase();
  return !!c && blocked.includes(c);
};

function stats(addr: string) {
  const mine = done.filter((d) => d.white === addr || d.black === addr).sort((a, b) => b.at - a.at);
  let wins = 0, losses = 0, draws = 0, net = 0;
  for (const d of mine) {
    if (!d.winner) draws++;
    else if (d.winner === addr) { wins++; net += Number(d.payout) - Number(d.bet); }
    else { losses++; net -= Number(d.bet); }
  }
  return { games: mine.slice(0, 50).map(({ pgn, ...r }) => r), stats: { wins, losses, draws, net } };
}

const server = http.createServer((req, res) => {
  const origin = req.headers.origin as string | undefined;
  if (geoBlocked(req)) { res.writeHead(451).end("unavailable in your region"); return; }
  if (origin && originOk(origin)) res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Content-Type", "application/json");
  const url = new URL(req.url ?? "/", "http://x");
  const parts = url.pathname.split("/").filter(Boolean);
  const out = (o: unknown) => res.end(JSON.stringify(o));
  if (parts[0] === "health") return out({ ok: true });
  if (parts[0] === "games") return out({ feeBps, games: [...open.values()].sort((a, b) => b.id - a.id).slice(0, 200) });
  if (parts[0] === "mine" && parts[1]) {
    const a = lc(parts[1]);
    return out({
      open: [...open.values()].filter((g) => g.p1 === a).map((g) => g.id),
      active: [...live.values()].filter((g) => !g.over && (g.white === a || g.black === a)).map((g) => g.id),
    });
  }
  if (parts[0] === "history" && parts[1]) return out(stats(lc(parts[1])));
  res.writeHead(404).end("{}");
});

// ---------- WebSocket ----------
const wss = new WebSocketServer({ noServer: true });
server.on("upgrade", (req, socket, head) => {
  if (req.url !== "/ws" || geoBlocked(req) || !originOk(req.headers.origin as string | undefined)) { socket.destroy(); return; }
  wss.handleUpgrade(req, socket, head, (ws) => wss.emit("connection", ws));
});

type Conn = { addr?: string; gid?: number; nonce: string; win: number; n: number };

wss.on("connection", (ws: WebSocket) => {
  const c: Conn = { nonce: crypto.randomBytes(16).toString("hex"), win: Date.now(), n: 0 };
  const send = (o: unknown) => ws.readyState === WebSocket.OPEN && ws.send(JSON.stringify(o));
  const err = (m: string) => send({ t: "error", message: m });
  send({ t: "challenge", nonce: c.nonce });

  ws.on("message", (raw) => {
    const now = Date.now();
    if (now - c.win > 1000) { c.win = now; c.n = 0; }
    if (++c.n > 15) return err("rate_limit");
    let m: any;
    try { m = JSON.parse(raw.toString()); } catch { return err("bad_json"); }

    if (m.t === "auth") {
      try {
        const addr = String(m.address ?? "").toLowerCase();
        const msg = String(m.message ?? "");
        const exp = `ChessBet login\nAddress: ${m.address}\nNonce: ${c.nonce}`;
        if (msg !== exp) return err("bad_message");
        if (ethers.verifyMessage(msg, String(m.sig)).toLowerCase() !== addr) return err("bad_signature");
        c.addr = addr;
        return send({ t: "authed", address: addr });
      } catch { return err("bad_signature"); }
    }
    if (!c.addr) return err("not_authed");

    if (m.t === "join") {
      const id = Number(m.id);
      const g = live.get(id);
      if (g) {
        if (c.addr !== g.white && c.addr !== g.black) return err("not_player");
        if (c.gid && c.gid !== id) live.get(c.gid)?.socks.delete(ws);
        c.gid = id; g.socks.add(ws);
        return send(snap(g));
      }
      const d = done.find((x) => x.id === id);
      if (d && (c.addr === d.white || c.addr === d.black)) {
        const chess = new Chess(); chess.loadPgn(d.pgn);
        const h = chess.history({ verbose: true }); const lm = h[h.length - 1];
        return send({
          t: "state", id, fen: chess.fen(), history: h.map((x) => x.san), lastMove: lm ? { from: lm.from, to: lm.to } : null,
          white: d.white, black: d.black, bet: d.bet, duration: 0, turn: chess.turn(), clock: { w: 0, b: 0 },
          over: true, reason: d.reason, winner: d.winner, drawOffer: null, feeBps,
        });
      }
      return err("game_not_found");
    }

    const g = c.gid ? live.get(c.gid) : undefined;
    if (!g) return err("no_game");
    const me = c.addr;
    if (me !== g.white && me !== g.black) return err("not_player");
    if (g.over) return err("game_over");

    if (m.t === "move") {
      const turn = g.chess.turn();
      if ((turn === "w" ? g.white : g.black) !== me) return err("not_your_turn");
      const t = Date.now();
      if (g.clock[turn] - (t - g.last) <= 0) { return finish(g, turn === "w" ? g.black : g.white, "timeout"); }
      try {
        g.chess.move({ from: String(m.from), to: String(m.to), promotion: m.promotion ? String(m.promotion) : undefined });
      } catch { return err("illegal_move"); }
      g.clock[turn] -= t - g.last;
      g.last = t;
      g.drawOffer = null;
      if (g.chess.isCheckmate()) finish(g, me, "checkmate");
      else if (g.chess.isStalemate()) finish(g, null, "stalemate");
      else if (g.chess.isInsufficientMaterial()) finish(g, null, "insufficient");
      else if (g.chess.isThreefoldRepetition()) finish(g, null, "repetition");
      else if (g.chess.isDraw()) finish(g, null, "draw_rule");
      else { broadcast(g); save(); }
      return;
    }
    if (m.t === "resign") return finish(g, me === g.white ? g.black : g.white, "resign");
    if (m.t === "draw_offer") { g.drawOffer = me; broadcast(g); return; }
    if (m.t === "draw_decline") { if (g.drawOffer && g.drawOffer !== me) { g.drawOffer = null; broadcast(g); } return; }
    if (m.t === "draw_accept") { if (g.drawOffer && g.drawOffer !== me) finish(g, null, "agreement"); return; }
    err("unknown_message");
  });

  ws.on("close", () => { if (c.gid) live.get(c.gid)?.socks.delete(ws); });
});

// ---------- запуск ----------
async function main() {
  load();
  try { feeBps = Number(await escrow.feeBps()); } catch (e) { console.error("feeBps:", (e as Error).message); }
  await sync();
  // для pending-отчётов после рестарта
  for (const g of live.values()) if (g.over && !g.reported) void report(g);
  escrow.on("GameCreated", (id: bigint, p1: string, bet: bigint, duration: bigint) => {
    open.set(Number(id), { id: Number(id), p1: lc(p1), bet: bet.toString(), duration: Number(duration) });
  });
  escrow.on("GameJoined", (id: bigint, p1: string, p2: string) => {
    const o = open.get(Number(id));
    if (o && !live.has(Number(id))) startLive(Number(id), lc(p1), lc(p2), o.bet, o.duration);
    else void sync().catch(console.error);
  });
  escrow.on("GameCancelled", (id: bigint) => { open.delete(Number(id)); });
  setInterval(() => void sync().catch((e) => console.error("sync:", e.message)), 60_000);
  server.listen(Number(PORT), () => console.log(`server :${PORT}, oracle ${wallet.address}, fee ${feeBps} bps`));
}
main().catch((e) => { console.error(e); process.exit(1); });
