"use client";

import { useState, useOptimistic, startTransition } from "react";
import { Card } from "@/components/ui/card";
import { Topbar } from "@/components/dashboard/topbar";
import { StatCards } from "@/components/dashboard/stat-cards";
import { StatisticsCard } from "@/components/dashboard/statistics-card";
import { AllExpenses } from "@/components/dashboard/all-expenses";
import { SavingsGoalCard } from "@/components/dashboard/savings-goal-card";
import { TransactionsCard } from "@/components/dashboard/transactions-card";
import { SettingsPanel } from "@/components/dashboard/settings-panel";
import { savingsGoal, type Transaction } from "@/lib/mock-data";
import { createTransaction } from "@/app/dashboard/actions";
import { PeriodSwitcher } from "@/components/dashboard/period-switcher";
import { monthKeyOf, shiftMonth, computeMonthly, computeBalanceUntil, daysInMonth, computeChangePct, computeAllExpenses, computeExpenseShares, monthLabel } from "@/lib/derive";

const TABS = ["Overview", "Analytics", "Transactions", "Settings"] as const;
type Tab = (typeof TABS)[number];

type DashUser = { name?: string | null; email?: string | null; image?: string | null };

export function DashboardClient({ user, transactions, now }: { user: DashUser; transactions: Transaction[]; now: string }) {
  const [tab, setTab] = useState<Tab>("Overview");
  const [optimisticTx, addOptimistic] = useOptimistic(
    transactions,
    (current: Transaction[], tx: Transaction) => [tx, ...current],
  );
  function handleAdd(ui: Transaction, raw: Parameters<typeof createTransaction>[0]) {
    startTransition(async () => {
      addOptimistic(ui);
      await createTransaction(raw);
    });
  }
  const [target, setTarget] = useState(savingsGoal.target);

  const nowKey = monthKeyOf(now);
  const [selectedMonth, setSelectedMonth] = useState(() => nowKey);

  const selMonth = computeMonthly(optimisticTx, selectedMonth);
  const prevOfSel = computeMonthly(optimisticTx, shiftMonth(selectedMonth, -1));
  const balance = computeBalanceUntil(optimisticTx, selectedMonth);
  const prevClosing = computeBalanceUntil(optimisticTx, shiftMonth(selectedMonth, -1));

  const stats = {
    balance,
    balanceChange: computeChangePct(balance, prevClosing),
    dailySpend: selMonth.expenses / daysInMonth(selectedMonth),
    savings: selMonth.savings,
    savingsChange: computeChangePct(selMonth.savings, prevOfSel.savings),
  };

  const monthTx = optimisticTx.filter((t) => monthKeyOf(t.dateISO) === selectedMonth);
  const shares = computeExpenseShares(monthTx);
  const expenses = computeAllExpenses(optimisticTx, selectedMonth);

  return (
    <div className="min-h-screen bg-db-bg text-db-text">
      <Topbar user={user} />

      <main className="mx-auto max-w-[1560px] px-6 pb-9 pt-[18px]">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="text-[27px] font-bold tracking-tight">Good morning, {user.name ?? "there"}</h1>
            <p className="mt-1 text-sm text-db-muted">This is your finance report</p>
            {(tab === "Overview" || tab === "Analytics") && (
              <div className="mt-3">
                <PeriodSwitcher selectedMonth={selectedMonth} nowKey={nowKey} onSelect={setSelectedMonth} />
              </div>
            )}
          </div>
          <nav className="flex items-center gap-7 overflow-x-auto">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setSelectedMonth(nowKey); }}
                className={`border-b-2 pb-2.5 text-[14.5px] transition ${
                  tab === t
                    ? "border-db-accent font-semibold text-db-text"
                    : "border-transparent font-medium text-db-muted hover:text-db-text2"
                }`}
              >
                {t}
              </button>
            ))}
          </nav>
        </div>

        {tab === "Overview" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
              <div className="flex flex-col gap-4">
                <StatCards stats={stats} onAddTransaction={() => setTab("Transactions")} />
                <StatisticsCard />
              </div>
              <div className="flex flex-col gap-4">
                <Card className="rounded-2xl border-db-line bg-db-card p-[18px]" style={{ boxShadow: "var(--db-shadow)" }}>
                  <AllExpenses shares={shares} expenses={expenses} periodLabel={monthLabel(selectedMonth)} />
                </Card>
                <SavingsGoalCard saved={savingsGoal.saved} target={target} />
              </div>
            </div>
            <TransactionsCard transactions={optimisticTx} onAdd={handleAdd} />
          </div>
        )}

        {tab === "Analytics" && (
          <div className="space-y-4">
            <StatCards stats={stats} onAddTransaction={() => setTab("Transactions")} />
            <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
              <StatisticsCard />
              <Card className="rounded-2xl border-db-line bg-db-card p-6" style={{ boxShadow: "var(--db-shadow)" }}>
                <AllExpenses size={200} shares={shares} expenses={expenses} periodLabel={monthLabel(selectedMonth)} />
              </Card>
            </div>
          </div>
        )}

        {tab === "Transactions" && (
          <TransactionsCard transactions={optimisticTx} onAdd={handleAdd} />
        )}

        {tab === "Settings" && (
          <SettingsPanel saved={savingsGoal.saved} target={target} onTargetChange={setTarget} />
        )}
      </main>
    </div>
  );
}
