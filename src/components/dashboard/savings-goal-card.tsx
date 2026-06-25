"use client";

import { usd } from "@/lib/mock-data";
import { AddSavingsDialog } from "@/components/dashboard/add-savings-dialog";
import { WithdrawSavingsDialog } from "@/components/dashboard/withdraw-savings-dialog";

export function SavingsGoalCard({
  saved, target, available, onAddSavings, onWithdraw,
}: {
  saved: number;
  target: number;
  available: number;
  onAddSavings: (input: { amount: number; repeat: "none" | "monthly" }) => void;
  onWithdraw: (input: { amount: number }) => void;
}) {
  const goalPct = target > 0 ? Math.min(100, Math.round((saved / target) * 100)) : 0;
  const reached = target > 0 && saved >= target;
  return (
    <div className="relative flex flex-col justify-between gap-[18px] overflow-hidden rounded-2xl p-5 text-white" style={{ background: "linear-gradient(135deg,#1f9e4a 0%,#127a39 48%,#0a5a2a 100%)" }}>
      <div className="pointer-events-none absolute -bottom-16 -right-10 size-[220px] rounded-full" style={{ background: "radial-gradient(circle,rgba(255,255,255,.18),transparent 70%)" }} />
      <div className="relative">
        <p className="text-[13px] font-semibold opacity-90">Savings goal</p>
        <h3 className="text-[20px] font-bold tracking-tight">Emergency fund</h3>
      </div>
      <div className="relative">
        <div className="mb-2.5 flex items-baseline justify-between text-[13.5px]">
          <span className="font-bold">{usd(saved).replace(".00", "")}</span>
          {target > 0 && <span className="opacity-80">of {usd(target).replace(".00", "")}</span>}
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/30">
          <span className="block h-full rounded-full bg-white transition-all duration-500" style={{ width: `${goalPct}%` }} />
        </div>
        <p className="mt-2 text-[12.5px] opacity-80">
          {target > 0
            ? reached
              ? "🎉 Goal reached · raise your target in Settings"
              : `${goalPct}% funded · adjust the target in Settings`
            : "Set a savings target in Settings"}
        </p>
      </div>
      <div className="relative flex gap-2">
        <AddSavingsDialog onAdd={onAddSavings} available={available} />
        <WithdrawSavingsDialog onWithdraw={onWithdraw} saved={saved} />
      </div>
    </div>
  );
}
