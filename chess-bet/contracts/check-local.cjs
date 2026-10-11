const { ethers } = require("ethers");
const fs = require("fs");
const L = JSON.parse(fs.readFileSync(__dirname + "/local.json", "utf8"));
const FEE = process.env.FEE || "0x6404abDeb8a95817282B5f171D046211Db549Bd6";
const ST = ["None", "Open", "Active", "Finished", "Cancelled"];
(async () => {
  const p = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  const e = new ethers.Contract(L.escrow, [
    "function nextGameId() view returns (uint256)",
    "function games(uint256) view returns (address p1,address p2,uint128 bet,uint32 duration,uint64 startedAt,uint8 status,address inviteSigner)",
    "function claimInfo(uint256 id,address who) view returns (uint256 amount,bool isClaimed,uint8 status)",
    "event GameFinished(uint256 indexed id,address indexed winner,uint256 payout,uint256 fee)",
    "event Claimed(uint256 indexed id,address indexed who,uint256 amount)",
  ], p);
  const u = new ethers.Contract(L.usdc, ["function balanceOf(address) view returns (uint256)"], p);
  const f = (x) => ethers.formatUnits(x, 6);
  const next = Number(await e.nextGameId());
  const id = process.env.GAME ? Number(process.env.GAME) : next - 1;
  const g = await e.games(id);
  console.log("Игра #" + id, "статус:", ST[Number(g.status)], "ставка:", f(g.bet), "USDC");
  for (const [n, a] of [["игрок 1", g.p1], ["игрок 2", g.p2]]) {
    if (a === ethers.ZeroAddress) continue;
    const c = await e.claimInfo(id, a);
    console.log(n, a, "| можно забрать:", f(c.amount), "| уже забрал:", c.isClaimed, "| баланс USDC:", f(await u.balanceOf(a)));
  }
  console.log("В контракте сейчас USDC:", f(await u.balanceOf(L.escrow)));
  console.log("Владелец (получатель 6%)", FEE, "баланс USDC:", f(await u.balanceOf(FEE)));
  for (const ev of await e.queryFilter(e.filters.GameFinished(id))) console.log("GameFinished: победителю", f(ev.args.payout), "| комиссия владельцу", f(ev.args.fee));
  for (const ev of await e.queryFilter(e.filters.Claimed(id))) console.log("Claimed:", ev.args.who, f(ev.args.amount));
})().catch((x) => console.error("ERR", x.message));
