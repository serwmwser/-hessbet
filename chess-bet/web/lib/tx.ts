"use client";
import { prepareContractCall, readContract, waitForReceipt } from "thirdweb";
import { useActiveAccount, useSendTransaction } from "thirdweb/react";
import { escrowContract, ESCROW_ADDRESS, usdcContract } from "./config";

export type Step = "idle" | "approve" | "confirm";

export function useEscrow() {
  const account = useActiveAccount();
  const { mutateAsync: send } = useSendTransaction();

  const run = async (tx: Parameters<typeof send>[0]) => {
    const r = await send(tx);
    await waitForReceipt(r);
  };

  const ensureAllowance = async (amount: bigint, onStep?: (s: Step) => void) => {
    if (!account) throw new Error("no wallet");
    if (!ESCROW_ADDRESS) throw new Error("ESCROW address is not configured");
    const allowance = await readContract({
      contract: usdcContract,
      method: "function allowance(address owner, address spender) view returns (uint256)",
      params: [account.address, ESCROW_ADDRESS],
    });
    if (allowance >= amount) return;
    onStep?.("approve");
    await run(prepareContractCall({
      contract: usdcContract,
      method: "function approve(address spender, uint256 amount) returns (bool)",
      params: [ESCROW_ADDRESS, amount],
    }));
  };

  return {
    account,
    async create(bet: number, duration: number, onStep?: (s: Step) => void) {
      await ensureAllowance(BigInt(bet), onStep);
      onStep?.("confirm");
      await run(prepareContractCall({
        contract: escrowContract,
        method: "function createGame(uint256 bet, uint32 duration) returns (uint256)",
        params: [BigInt(bet), duration],
      }));
    },
    async join(id: number, bet: number, onStep?: (s: Step) => void) {
      await ensureAllowance(BigInt(bet), onStep);
      onStep?.("confirm");
      await run(prepareContractCall({
        contract: escrowContract,
        method: "function joinGame(uint256 id)",
        params: [BigInt(id)],
      }));
    },
    async cancel(id: number) {
      await run(prepareContractCall({
        contract: escrowContract,
        method: "function cancelGame(uint256 id)",
        params: [BigInt(id)],
      }));
    },
  };
}
