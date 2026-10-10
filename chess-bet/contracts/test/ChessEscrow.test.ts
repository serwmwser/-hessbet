import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";

const U = (n: number) => BigInt(Math.round(n * 1e6));
const ZERO = ethers.ZeroAddress;

describe("ChessEscrow v2", () => {
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

  // подпись ключа приглашения, привязанная к адресу присоединяющегося
  async function inviteSig(esc: any, invite: any, id: number, joiner: string) {
    const { chainId } = await ethers.provider.getNetwork();
    const hash = ethers.solidityPackedKeccak256(
      ["address", "uint256", "uint256", "address"],
      [await esc.getAddress(), chainId, id, joiner]
    );
    return invite.signMessage(ethers.getBytes(hash));
  }

  it("принимает корректные ставки и время", async () => {
    const { esc, a } = await setup();
    for (const d of [900, 1800, 2700, 3600, 10800, 86400]) await esc.connect(a).createGame(U(0.05), d, ZERO);
    await esc.connect(a).createGame(U(5), 900, ZERO);
    await esc.connect(a).createGame(U(1.35), 900, ZERO);
  });

  it("отклоняет неверные ставки и время", async () => {
    const { esc, a } = await setup();
    for (const bad of [0n, U(0.04), U(0.07), U(5.05), U(6)])
      await expect(esc.connect(a).createGame(bad, 900, ZERO)).to.be.revertedWithCustomError(esc, "BadBet");
    for (const d of [0, 60, 1000, 7200])
      await expect(esc.connect(a).createGame(U(1), d, ZERO)).to.be.revertedWithCustomError(esc, "BadDuration");
  });

  it("победитель забирает 94% через claim, комиссия 6% приходит сразу", async () => {
    const { esc, usdc, oracle, fee, a, b } = await setup();
    await esc.connect(a).createGame(U(5), 900, ZERO);
    await esc.connect(b).joinGame(1, "0x");
    await expect(esc.connect(oracle).reportResult(1, a.address))
      .to.emit(esc, "GameFinished").withArgs(1, a.address, U(9.4), U(0.6));
    expect(await usdc.balanceOf(fee.address)).to.equal(U(0.6));
    expect((await esc.claimInfo(1, a.address)).amount).to.equal(U(9.4));
    const before = await usdc.balanceOf(a.address);
    await expect(esc.connect(a).claim(1)).to.emit(esc, "Claimed").withArgs(1, a.address, U(9.4));
    expect((await usdc.balanceOf(a.address)) - before).to.equal(U(9.4));
    expect(await usdc.balanceOf(await esc.getAddress())).to.equal(0n);
    // повторно и проигравшим забрать нельзя
    await expect(esc.connect(a).claim(1)).to.be.revertedWithCustomError(esc, "NothingToClaim");
    await expect(esc.connect(b).claim(1)).to.be.revertedWithCustomError(esc, "NothingToClaim");
  });

  it("ничья: оба забирают свою ставку, комиссии нет", async () => {
    const { esc, usdc, oracle, fee, a, b } = await setup();
    await esc.connect(a).createGame(U(2), 900, ZERO);
    await esc.connect(b).joinGame(1, "0x");
    await esc.connect(oracle).reportResult(1, ZERO);
    await esc.connect(a).claim(1);
    await esc.connect(b).claim(1);
    expect(await usdc.balanceOf(a.address)).to.equal(U(100));
    expect(await usdc.balanceOf(b.address)).to.equal(U(100));
    expect(await usdc.balanceOf(fee.address)).to.equal(0n);
  });

  it("только oracle сообщает результат; победитель должен быть игроком", async () => {
    const { esc, oracle, a, b, c } = await setup();
    await esc.connect(a).createGame(U(1), 900, ZERO);
    await esc.connect(b).joinGame(1, "0x");
    await expect(esc.connect(a).reportResult(1, a.address)).to.be.revertedWithCustomError(esc, "NotAllowed");
    await expect(esc.connect(oracle).reportResult(1, c.address)).to.be.revertedWithCustomError(esc, "BadWinner");
    await esc.connect(oracle).reportResult(1, b.address);
    await expect(esc.connect(oracle).reportResult(1, b.address)).to.be.revertedWithCustomError(esc, "BadStatus");
  });

  it("нельзя играть с самим собой; отмена только создателем и только до принятия", async () => {
    const { esc, usdc, a, b } = await setup();
    await esc.connect(a).createGame(U(1), 900, ZERO);
    await expect(esc.connect(a).joinGame(1, "0x")).to.be.revertedWithCustomError(esc, "NotAllowed");
    await expect(esc.connect(b).cancelGame(1)).to.be.revertedWithCustomError(esc, "NotAllowed");
    await esc.connect(a).cancelGame(1);
    expect(await usdc.balanceOf(a.address)).to.equal(U(100));
    await expect(esc.connect(b).joinGame(1, "0x")).to.be.revertedWithCustomError(esc, "BadStatus");
    await esc.connect(a).createGame(U(1), 900, ZERO);
    await esc.connect(b).joinGame(2, "0x");
    await expect(esc.connect(a).cancelGame(2)).to.be.revertedWithCustomError(esc, "BadStatus");
  });

  it("приватная игра: без подписи и с чужой подписью войти нельзя", async () => {
    const { esc, a, b, c } = await setup();
    const invite = ethers.Wallet.createRandom();
    await esc.connect(a).createGame(U(1), 900, invite.address);
    await expect(esc.connect(b).joinGame(1, "0x")).to.be.revertedWithCustomError(esc, "BadInvite");
    const stranger = ethers.Wallet.createRandom();
    const bad = await inviteSig(esc, stranger, 1, b.address);
    await expect(esc.connect(b).joinGame(1, bad)).to.be.revertedWithCustomError(esc, "BadInvite");
    // подпись, выданная для b, не работает для c (защита от перехвата из мемпула)
    const forB = await inviteSig(esc, invite, 1, b.address);
    await expect(esc.connect(c).joinGame(1, forB)).to.be.revertedWithCustomError(esc, "BadInvite");
    await expect(esc.connect(b).joinGame(1, forB)).to.emit(esc, "GameJoined");
  });

  it("подпись приглашения не переносится на другую игру", async () => {
    const { esc, a, b } = await setup();
    const invite = ethers.Wallet.createRandom();
    await esc.connect(a).createGame(U(1), 900, invite.address);
    await esc.connect(a).createGame(U(1), 900, invite.address);
    const sig1 = await inviteSig(esc, invite, 1, b.address);
    await expect(esc.connect(b).joinGame(2, sig1)).to.be.revertedWithCustomError(esc, "BadInvite");
    await esc.connect(b).joinGame(1, sig1);
  });

  it("refundStuck: рано нельзя; после срока оба забирают ставки без комиссии", async () => {
    const { esc, usdc, fee, a, b, c } = await setup();
    await esc.connect(a).createGame(U(3), 900, ZERO);
    await esc.connect(b).joinGame(1, "0x");
    await expect(esc.connect(c).refundStuck(1)).to.be.revertedWithCustomError(esc, "TooEarly");
    await time.increase(2 * 900 + 3 * 86400 + 5);
    await esc.connect(c).refundStuck(1);
    await esc.connect(a).claim(1);
    await esc.connect(b).claim(1);
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
