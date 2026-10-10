import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";

const U = (n: number) => BigInt(Math.round(n * 1e6));

describe("ChessEscrow", () => {
  async function setup() {
    const [owner, oracle, fee, a, b, c] = await ethers.getSigners();
    const usdc = await (await ethers.getContractFactory("MockUSDC")).deploy();
    const esc = await (await ethers.getContractFactory("ChessEscrow")).deploy(
      await usdc.getAddress(), oracle.address, fee.address, 600
    );
    for (const s of [a, b, c]) {
      await usdc.mint(s.address, U(100));
      await usdc.connect(s).approve(await esc.getAddress(), U(100));
    }
    return { owner, oracle, fee, a, b, c, usdc, esc };
  }

  it("принимает корректные ставки и время", async () => {
    const { esc, a } = await setup();
    for (const d of [900, 1800, 2700, 3600, 10800, 86400]) await esc.connect(a).createGame(U(0.05), d);
    await esc.connect(a).createGame(U(5), 900);
    await esc.connect(a).createGame(U(1.35), 900);
  });

  it("отклоняет неверные ставки и время", async () => {
    const { esc, a } = await setup();
    for (const bad of [0n, U(0.04), U(0.07), U(5.05), U(6)])
      await expect(esc.connect(a).createGame(bad, 900)).to.be.revertedWithCustomError(esc, "BadBet");
    for (const d of [0, 60, 1000, 7200])
      await expect(esc.connect(a).createGame(U(1), d)).to.be.revertedWithCustomError(esc, "BadDuration");
  });

  it("победитель получает 94%, комиссия 6% на кошелёк владельца", async () => {
    const { esc, usdc, oracle, fee, a, b } = await setup();
    await esc.connect(a).createGame(U(5), 900);
    await esc.connect(b).joinGame(1);
    const aBefore = await usdc.balanceOf(a.address);
    await expect(esc.connect(oracle).reportResult(1, a.address))
      .to.emit(esc, "GameFinished").withArgs(1, a.address, U(9.4), U(0.6));
    expect((await usdc.balanceOf(a.address)) - aBefore).to.equal(U(9.4));
    expect(await usdc.balanceOf(fee.address)).to.equal(U(0.6));
    expect(await usdc.balanceOf(await esc.getAddress())).to.equal(0n);
  });

  it("ничья возвращает ставки без комиссии", async () => {
    const { esc, usdc, oracle, fee, a, b } = await setup();
    await esc.connect(a).createGame(U(2), 900);
    await esc.connect(b).joinGame(1);
    await esc.connect(oracle).reportResult(1, ethers.ZeroAddress);
    expect(await usdc.balanceOf(a.address)).to.equal(U(100));
    expect(await usdc.balanceOf(b.address)).to.equal(U(100));
    expect(await usdc.balanceOf(fee.address)).to.equal(0n);
  });

  it("только oracle сообщает результат; победитель должен быть игроком", async () => {
    const { esc, oracle, a, b, c } = await setup();
    await esc.connect(a).createGame(U(1), 900);
    await esc.connect(b).joinGame(1);
    await expect(esc.connect(a).reportResult(1, a.address)).to.be.revertedWithCustomError(esc, "NotAllowed");
    await expect(esc.connect(oracle).reportResult(1, c.address)).to.be.revertedWithCustomError(esc, "BadWinner");
    await esc.connect(oracle).reportResult(1, b.address);
    await expect(esc.connect(oracle).reportResult(1, b.address)).to.be.revertedWithCustomError(esc, "BadStatus");
  });

  it("нельзя играть с самим собой; отмена только создателем и только до принятия", async () => {
    const { esc, usdc, a, b } = await setup();
    await esc.connect(a).createGame(U(1), 900);
    await expect(esc.connect(a).joinGame(1)).to.be.revertedWithCustomError(esc, "NotAllowed");
    await expect(esc.connect(b).cancelGame(1)).to.be.revertedWithCustomError(esc, "NotAllowed");
    await esc.connect(a).cancelGame(1);
    expect(await usdc.balanceOf(a.address)).to.equal(U(100));
    await expect(esc.connect(b).joinGame(1)).to.be.revertedWithCustomError(esc, "BadStatus");
    await esc.connect(a).createGame(U(1), 900);
    await esc.connect(b).joinGame(2);
    await expect(esc.connect(a).cancelGame(2)).to.be.revertedWithCustomError(esc, "BadStatus");
  });

  it("refundStuck: рано нельзя, после срока возврат обоим без комиссии", async () => {
    const { esc, usdc, fee, a, b, c } = await setup();
    await esc.connect(a).createGame(U(3), 900);
    await esc.connect(b).joinGame(1);
    await expect(esc.connect(c).refundStuck(1)).to.be.revertedWithCustomError(esc, "TooEarly");
    await time.increase(2 * 900 + 3 * 86400 + 5);
    await esc.connect(c).refundStuck(1);
    expect(await usdc.balanceOf(a.address)).to.equal(U(100));
    expect(await usdc.balanceOf(b.address)).to.equal(U(100));
    expect(await usdc.balanceOf(fee.address)).to.equal(0n);
  });

  it("админ: потолок комиссии и права", async () => {
    const { esc, owner, oracle, fee, a } = await setup();
    await expect(esc.connect(a).setFee(100, fee.address)).to.be.reverted;
    await expect(esc.connect(a).setOracle(a.address)).to.be.reverted;
    await expect(esc.connect(owner).setFee(1001, fee.address)).to.be.revertedWithCustomError(esc, "FeeTooHigh");
    await esc.connect(owner).setFee(500, fee.address);
    await esc.connect(owner).setOracle(oracle.address);
  });
});
