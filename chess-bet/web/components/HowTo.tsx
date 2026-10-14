"use client";
import { useTx, TxKey } from "@/lib/txt";

const STEPS: TxKey[] = ["how1", "how2", "how3", "how4", "how5", "how6"];

export default function HowTo() {
  const tx = useTx();
  return (
    <details className="card group" open>
      <summary className="cursor-pointer list-none flex items-center justify-between text-lg font-bold">
        <span>🎓 {tx("howTitle")}</span>
        <span className="opacity-50 transition group-open:rotate-180" aria-hidden>▾</span>
      </summary>
      <ol className="mt-3 space-y-2">
        {STEPS.map((k, i) => (
          <li key={k} className="flex gap-3 items-start text-sm">
            <span className="shrink-0 w-6 h-6 grid place-items-center rounded-full bg-gradient-to-r from-brand-600 to-brand-violet text-white text-xs font-bold">{i + 1}</span>
            <span className="opacity-90">{tx(k)}</span>
          </li>
        ))}
      </ol>
    </details>
  );
}
