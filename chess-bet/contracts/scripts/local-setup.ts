// Разворачивает контракты в ЛОКАЛЬНОЙ сети Hardhat и пишет адреса и ключи в local.json.
import { ethers } from "hardhat";
import fs from "node:fs";

// Общеизвестная тестовая фраза Hardhat — ключи годятся только для локальной сети, настоящих денег на них нет.
const MNEMONIC = "test test test test test test test test test test test junk";
const keyOf = (i: number) => ethers.HDNodeWallet.fromPhrase(MNEMONIC, "", `m/44'/60'/0'/0/${i}`).privateKey;

async function main() {
  const [, oracle] = await ethers.getSigners();
  const feeRecipient = process.env.FEE_RECIPIENT || "0x6404abDeb8a95817282B5f171D046211Db549Bd6";
  const usdc = await (await ethers.getContractFactory("MockUSDC")).deploy();
  await usdc.waitForDeployment();
  const escrow = await (await ethers.getContractFactory("ChessEscrow")).deploy(await usdc.getAddress(), oracle.address, feeRecipient, 600);
  await escrow.waitForDeployment();
  const out = { usdc: await usdc.getAddress(), escrow: await escrow.getAddress(), oraclePk: keyOf(1), faucetPk: keyOf(3) };
  fs.writeFileSync("local.json", JSON.stringify(out, null, 2));
  console.log("MockUSDC:", out.usdc);
  console.log("ChessEscrow:", out.escrow);
}
main().catch((e) => { console.error(e); process.exit(1); });
