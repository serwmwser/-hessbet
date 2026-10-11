const { ethers } = require("ethers");
const TO = process.env.TO;
const USDC = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
(async () => {
  const p = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  const s = await p.getSigner(0);
  const c = new ethers.Contract(USDC, ["function mint(address,uint256)", "function balanceOf(address) view returns (uint256)"], s);
  await (await c.mint(TO, ethers.parseUnits("1000", 6))).wait();
  console.log("USDC:", ethers.formatUnits(await c.balanceOf(TO), 6));
})().catch(e => console.error("ERR", e.message));
