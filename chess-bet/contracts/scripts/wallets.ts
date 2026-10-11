// Создаёт тестовые кошельки и сохраняет их в wallets.json (файл в .gitignore). Запуск: npx hardhat run scripts/wallets.ts
import { ethers } from "ethers";
import fs from "node:fs";

const N = Number(process.env.COUNT || 4);
const file = "wallets.json";
const list: { name: string; address: string; privateKey: string }[] = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : [];
for (let i = 0; i < N; i++) {
  const w = ethers.Wallet.createRandom();
  list.push({ name: `player${list.length + 1}`, address: w.address, privateKey: w.privateKey });
}
fs.writeFileSync(file, JSON.stringify(list, null, 2));
console.log("Адреса (приватные ключи — в wallets.json, никому не отправляйте):");
for (const w of list) console.log(w.name, w.address);
