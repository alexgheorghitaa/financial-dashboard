"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Topbar } from "@/components/dashboard/topbar";
import { StatCards } from "@/components/dashboard/stat-cards";
import { StatisticsCard } from "@/components/dashboard/statistics-card";
import { AllExpenses } from "@/components/dashboard/all-expenses";
import { SavingsGoalCard } from "@/components/dashboard/savings-goal-card";
import { TransactionsCard } from "@/components/dashboard/transactions-card";
import { SettingsPanel } from "@/components/dashboard/settings-panel";
import { transactions as seedTransactions, savingsGoal, type Transaction } from "@/lib/mock-data";

const TABS = ["Overview", "Analytics", "Transactions", "Settings"] as const;
type Tab = (typeof TABS)[number];

export default function DashboardPage() {
  const [tab, setTab] = useState<Tab>("Overview");
  const [list, setList] = useState<Transaction[]>(seedTransactions);
  const [target, setTarget] = useState(savingsGoal.target);

  const addTransaction = (t: Transaction) => setList((prev) => [t, ...prev]);

  return (
    <div className="min-h-screen bg-db-bg text-db-text">
      <Topbar />

      <main className="mx-auto max-w-[1560px] px-6 pb-9 pt-[18px]">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="text-[27px] font-bold tracking-tight">Good morning, Jaylon</h1>
            <p className="mt-1 text-sm text-db-muted">This is your finance report</p>
          </div>
          <nav className="flex items-center gap-7 overflow-x-auto">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
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
                <StatCards onAddTransaction={() => setTab("Transactions")} />
                <StatisticsCard />
              </div>
              <div className="flex flex-col gap-4">
                <Card className="rounded-2xl border-db-line bg-db-card p-[18px]" style={{ boxShadow: "var(--db-shadow)" }}>
                  <AllExpenses />
                </Card>
                <SavingsGoalCard saved={savingsGoal.saved} target={target} />
              </div>
            </div>
            <TransactionsCard transactions={list} onAdd={addTransaction} />
          </div>
        )}

        {tab === "Analytics" && (
          <div className="space-y-4">
            <StatCards onAddTransaction={() => setTab("Transactions")} />
            <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
              <StatisticsCard />
              <Card className="rounded-2xl border-db-line bg-db-card p-6" style={{ boxShadow: "var(--db-shadow)" }}>
                <AllExpenses size={200} />
              </Card>
            </div>
          </div>
        )}

        {tab === "Transactions" && (
          <TransactionsCard transactions={list} onAdd={addTransaction} />
        )}

        {tab === "Settings" && (
          <SettingsPanel saved={savingsGoal.saved} target={target} onTargetChange={setTarget} />
        )}
      </main>
    </div>
  );
}
