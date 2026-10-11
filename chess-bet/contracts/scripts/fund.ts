// Раздаёт кошелькам из wallets.json немного POL и тестовые USDC.
// Нужны: DEPLOYER_PK (с POL из крана) и MOCK (адрес MockUSDC). Запуск:
//   MOCK=0x... npx hardhat run scripts/fund.ts --network amoy
import { ethers } from "hardhat";
import fs from "node:fs";

async function main() {
  const [from] = await ethers.getSigners();
  const mock = process.env.MOCK;
  if (!mock) throw new Error("Задайте MOCK=адрес MockUSDC");
  const pol = process.env.POL || "0.05";
  const usd = process.env.USDC || "50";
  const list: { name: string; address: string }[] = JSON.parse(fs.readFileSync("wallets.json", "utf8"));
  const token = await ethers.getContractAt("MockUSDC", mock);
  console.log("Баланс отправителя:", ethers.formatEther(await ethers.provider.getBalance(from.address)), "POL");
  for (const w of list) {
    await (await from.sendTransaction({ to: w.address, value: ethers.parseEther(pol) })).wait();
    await (await token.mint(w.address, ethers.parseUnits(usd, 6))).wait();
    console.log(`${w.name} ${w.address}: +${pol} POL, +${usd} USDC`);
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
