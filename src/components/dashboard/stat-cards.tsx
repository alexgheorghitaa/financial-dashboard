"use client";

import { Card } from "@/components/ui/card";
import { Wallet, TrendingDown, PiggyBank } from "lucide-react";
import { usd, pct } from "@/lib/mock-data";

type Stats = {
  balance: number;
  balanceChange: number | null;
  dailySpend: number;
  savings: number;
  savingsChange: number | null;
};

function Money({ value, className = "" }: { value: number; className?: string }) {
  const [int, dec] = usd(value).split(".");
  return <span className={className}>{int}<span className="text-db-soft">.{dec}</span></span>;
}

function ChangeBadge({ value }: { value: number | null }) {
  if (value === null) return <span className="font-bold text-db-soft">—</span>;
  const up = value >= 0;
  return (
    <span className={`font-bold ${up ? "text-[#16A34A] dark:text-[#4ade80]" : "text-[#e11d48] dark:text-[#fb7185]"}`}>
      {pct(Math.round(value))}
    </span>
  );
}

export function StatCards({ stats, onAddTransaction }: { stats: Stats; onAddTransaction?: () => void }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card className="rounded-2xl border-db-line bg-db-card p-[18px]" style={{ boxShadow: "var(--db-shadow)" }}>
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-db-muted">Total Balance</p>
          <span className="flex size-9 items-center justify-center rounded-full bg-db-accentweak text-db-accent"><Wallet className="size-[18px]" /></span>
        </div>
        <Money value={stats.balance} className="mt-3 block text-[28px] font-bold tracking-tight text-db-text" />
        <div className="mt-1.5 flex items-center gap-2 text-[13px]">
          <ChangeBadge value={stats.balanceChange} />
          <span className="text-db-soft">compare to last month</span>
        </div>
        <div className="mt-4 flex gap-2.5">
          <button onClick={onAddTransaction} className="flex-1 rounded-xl bg-db-accent py-2.5 text-sm font-semibold text-white transition hover:opacity-90">Add transaction</button>
          <button onClick={onAddTransaction} className="flex-1 rounded-xl border border-db-line py-2.5 text-sm font-semibold text-db-text2 transition hover:bg-db-card2">Add income</button>
        </div>
      </Card>

      <Card className="flex min-h-[186px] flex-col rounded-2xl border-db-line bg-db-card p-[18px]" style={{ boxShadow: "var(--db-shadow)" }}>
        <span className="flex size-[42px] items-center justify-center rounded-full bg-db-card2 text-[#F59E0B]"><TrendingDown className="size-5" /></span>
        <p className="mt-3.5 text-sm font-medium text-db-muted">Daily Spend</p>
        <Money value={stats.dailySpend} className="mt-3 text-[26px] font-bold tracking-tight text-db-text" />
        <p className="mt-3 text-[13px]"><span className="text-db-soft">spent today</span></p>
      </Card>

      <Card className="flex min-h-[186px] flex-col rounded-2xl border-db-line bg-db-card p-[18px]" style={{ boxShadow: "var(--db-shadow)" }}>
        <span className="flex size-[42px] items-center justify-center rounded-full bg-db-card2 text-[#16A34A]"><PiggyBank className="size-5" /></span>
        <p className="mt-3.5 text-sm font-medium text-db-muted">Monthly Savings</p>
        <Money value={stats.savings} className="mt-3 text-[26px] font-bold tracking-tight text-db-text" />
        <p className="mt-3 text-[13px]"><ChangeBadge value={stats.savingsChange} /> <span className="text-db-soft">income − expenses</span></p>
      </Card>
    </div>
  );
}
