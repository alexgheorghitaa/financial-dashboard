"use client";

import { useState, useEffect, useOptimistic, startTransition } from "react";
import { Card } from "@/components/ui/card";
import { Topbar } from "@/components/dashboard/topbar";
import { type SearchItem } from "@/components/dashboard/search-command";
import { StatCards } from "@/components/dashboard/stat-cards";
import { StatisticsCard } from "@/components/dashboard/statistics-card";
import { AllExpenses } from "@/components/dashboard/all-expenses";
import { SavingsGoalCard } from "@/components/dashboard/savings-goal-card";
import { TransactionsCard } from "@/components/dashboard/transactions-card";
import { SettingsPanel } from "@/components/dashboard/settings-panel";
import { TipCard } from "@/components/dashboard/tip-card";
import { usd, type Transaction } from "@/lib/mock-data";
import {
  createTransaction,
  addSavingsContribution,
  withdrawSavings,
  stopRecurringTransaction,
  deleteTransaction,
  stopRecurringSavings,
  deleteSavings,
  updateSavingsGoal,
  updateUserName,
  setActiveAccount,
  createAccount,
  renameAccount,
  deleteAccount,
} from "@/app/dashboard/actions";
import { PeriodSwitcher } from "@/components/dashboard/period-switcher";
import { monthKeyOf, shiftMonth, computeMonthly, computeMonthlySeries, computeWeeklySeries, computeSaved, computeAverages, computeBalanceUntil, daysInMonth, computeChangePct, computeAllExpenses, computeExpenseShares, monthLabel, occursInMonth } from "@/lib/derive";

const TABS = ["Overview", "Analytics", "Transactions", "Settings"] as const;
type Tab = (typeof TABS)[number];

type DashUser = { name?: string | null; email?: string | null; image?: string | null };

type AccountRef = { id: string; name: string };

export function DashboardClient({ user, transactions, now, accountCreatedAt, contributions = [], savingsGoal = 0, accounts = [], activeId = "", tip = null, canRefreshTip = true, tipHoursLeft = 0 }: {
  user: DashUser;
  transactions: Transaction[];
  now: string;
  accountCreatedAt: string;
  contributions?: { id: string; amount: number; dateISO: string; repeat: "none" | "monthly"; endISO: string | null }[];
  savingsGoal?: number;
  accounts?: AccountRef[];
  activeId?: string;
  tip?: string | null;
  canRefreshTip?: boolean;
  tipHoursLeft?: number;
}) {
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

  function handleAddSavings(input: { amount: number; repeat: "none" | "monthly" }) {
    startTransition(async () => {
      await addSavingsContribution(input);
    });
  }

  function handleWithdraw(input: { amount: number }) {
    startTransition(async () => {
      await withdrawSavings(input);
    });
  }

  function handleStopRecurring(id: string, kind: "transaction" | "savings") {
    startTransition(async () => {
      await (kind === "savings" ? stopRecurringSavings(id) : stopRecurringTransaction(id));
    });
  }

  function handleDelete(id: string, kind: "transaction" | "savings") {
    startTransition(async () => {
      await (kind === "savings" ? deleteSavings(id) : deleteTransaction(id));
    });
  }

  function handleTargetChange(n: number) {
    startTransition(async () => {
      await updateSavingsGoal(n);
    });
  }

  function handleSwitchAccount(id: string) {
    startTransition(async () => { await setActiveAccount(id); });
  }
  function handleCreateAccount(name: string) {
    startTransition(async () => { await createAccount(name); });
  }
  function handleRenameAccount(name: string) {
    startTransition(async () => { await renameAccount(activeId, name); });
  }
  function handleDeleteAccount() {
    startTransition(async () => { await deleteAccount(activeId); });
  }

  const activeAccount = accounts.find((a) => a.id === activeId);
  const accountName = activeAccount?.name ?? "Account";
  const isPrimaryAccount = accounts.length > 0 && accounts[0].id === activeId;

  function handleNameChange(name: string) {
    startTransition(async () => {
      await updateUserName(name);
    });
  }

  const [highlightId, setHighlightId] = useState<string | null>(null);
  useEffect(() => {
    if (!highlightId) return;
    const t = setTimeout(() => setHighlightId(null), 2200);
    return () => clearTimeout(t);
  }, [highlightId]);
  function goToTransaction(id: string) {
    setTab("Transactions");
    setHighlightId(id);
  }

  const nowKey = monthKeyOf(now);
  const [selectedMonth, setSelectedMonth] = useState(() => nowKey);

  const createdMonth = monthKeyOf(accountCreatedAt);
  const minMonth = [...optimisticTx, ...contributions].reduce(
    (min, t) => (monthKeyOf(t.dateISO) < min ? monthKeyOf(t.dateISO) : min),
    createdMonth,
  );

  const selMonth = computeMonthly(optimisticTx, selectedMonth);
  const prevOfSel = computeMonthly(optimisticTx, shiftMonth(selectedMonth, -1));
  const balance = computeBalanceUntil(optimisticTx, selectedMonth);
  const prevClosing = computeBalanceUntil(optimisticTx, shiftMonth(selectedMonth, -1));

  const saved = computeSaved(contributions, selectedMonth);
  const savedNow = computeSaved(contributions, nowKey);
  const available = balance - saved;
  const availableNow = computeBalanceUntil(optimisticTx, nowKey) - savedNow;

  const stats = {
    balance: available,
    balanceChange: computeChangePct(balance, prevClosing),
    dailySpend: selMonth.expenses / daysInMonth(selectedMonth),
    savings: selMonth.savings,
    savingsChange: computeChangePct(selMonth.savings, prevOfSel.savings),
    saved: savedNow,
  };

  const monthTx = optimisticTx.filter((t) => occursInMonth(t, selectedMonth));
  const shares = computeExpenseShares(monthTx);
  const expenses = computeAllExpenses(optimisticTx, selectedMonth);

  const selectedYear = Number(selectedMonth.slice(0, 4));
  const monthlySeries = computeMonthlySeries(optimisticTx, selectedYear, nowKey);
  const weeklySeries = computeWeeklySeries(optimisticTx, selectedMonth);
  const averages = computeAverages(optimisticTx, selectedYear, nowKey);
  const referenceMonth = new Date(selectedMonth + "-01T00:00:00").toLocaleDateString("en-US", { month: "short" });

  const searchItems: SearchItem[] = [
    ...optimisticTx.map((t) => ({
      id: `tx-${t.id}`,
      group: "Transactions",
      title: t.name,
      subtitle: `${usd(t.amount, true)} · ${t.date}`,
      path: `${accountName} › Transactions`,
      keywords: `${t.name} ${t.category} ${t.detail}`.toLowerCase(),
      onSelect: () => goToTransaction(t.id),
    })),
    ...contributions.map((c) => {
      const isWithdrawal = c.amount < 0;
      return {
        id: `sv-${c.id}`,
        group: "Savings",
        title: isWithdrawal ? "Savings withdrawal" : "Savings deposit",
        subtitle: `${usd(-c.amount, true)} · ${c.dateISO}`,
        path: `${accountName} › Savings`,
        keywords: `savings ${isWithdrawal ? "withdrawal" : "deposit"} ${Math.abs(c.amount)}`.toLowerCase(),
        onSelect: () => goToTransaction(c.id),
      };
    }),
    ...TABS.map((t) => ({
      id: `page-${t}`,
      group: "Pages",
      title: t,
      path: "Go to page",
      keywords: t.toLowerCase(),
      onSelect: () => setTab(t),
    })),
    ...accounts.map((a) => ({
      id: `acct-${a.id}`,
      group: "Accounts",
      title: a.name,
      subtitle: a.id === activeId ? "Current" : undefined,
      path: a.id === activeId ? "Current account" : "Switch account",
      keywords: `${a.name} account`.toLowerCase(),
      onSelect: () => { if (a.id !== activeId) handleSwitchAccount(a.id); },
    })),
    { id: "act-add", group: "Actions", title: "Add transaction", path: "Action", keywords: "add transaction new income expense", onSelect: () => setTab("Transactions") },
    { id: "act-goal", group: "Actions", title: "Set savings goal", path: "Action", keywords: "savings goal target", onSelect: () => setTab("Settings") },
  ];

  return (
    <div className="min-h-screen bg-db-bg text-db-text">
      <Topbar
        user={user}
        accounts={accounts}
        activeId={activeId}
        accountName={accountName}
        onSwitchAccount={handleSwitchAccount}
        onCreateAccount={handleCreateAccount}
        tab={tab}
        onHome={() => setTab("Overview")}
        searchItems={searchItems}
      />

      <main className="mx-auto max-w-[1560px] px-6 pb-9 pt-[18px]">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="text-[27px] font-bold tracking-tight">Good morning, {user.name ?? "there"}</h1>
            <p className="mt-1 text-sm text-db-muted">This is your finance report</p>
            {(tab === "Overview" || tab === "Analytics") && (
              <div className="mt-3">
                <PeriodSwitcher selectedMonth={selectedMonth} nowKey={nowKey} onSelect={setSelectedMonth} minMonth={minMonth} />
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
                <StatCards stats={stats} onAddTransaction={() => setTab("Transactions")} tipCard={<TipCard tip={tip} canRefresh={canRefreshTip} hoursLeft={tipHoursLeft} />} />
                <StatisticsCard
                  monthlyData={monthlySeries}
                  weeklyData={weeklySeries}
                  averages={averages}
                  referenceMonth={referenceMonth}
                  year={selectedYear}
                />
              </div>
              <div className="flex flex-col gap-4">
                <Card className="rounded-2xl border-db-line bg-db-card p-[18px]" style={{ boxShadow: "var(--db-shadow)" }}>
                  <AllExpenses shares={shares} expenses={expenses} periodLabel={monthLabel(selectedMonth)} />
                </Card>
                <SavingsGoalCard saved={savedNow} target={savingsGoal} available={availableNow} onAddSavings={handleAddSavings} onWithdraw={handleWithdraw} />
              </div>
            </div>
            <TransactionsCard transactions={optimisticTx} contributions={contributions} onAdd={handleAdd} onStopRecurring={handleStopRecurring} onDelete={handleDelete} />
          </div>
        )}

        {tab === "Analytics" && (
          <div className="space-y-4">
            <StatCards stats={stats} onAddTransaction={() => setTab("Transactions")} tipCard={<TipCard tip={tip} canRefresh={canRefreshTip} hoursLeft={tipHoursLeft} />} />
            <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
              <StatisticsCard
                monthlyData={monthlySeries}
                weeklyData={weeklySeries}
                averages={averages}
                referenceMonth={referenceMonth}
                year={selectedYear}
              />
              <Card className="rounded-2xl border-db-line bg-db-card p-6" style={{ boxShadow: "var(--db-shadow)" }}>
                <AllExpenses size={200} shares={shares} expenses={expenses} periodLabel={monthLabel(selectedMonth)} />
              </Card>
            </div>
          </div>
        )}

        {tab === "Transactions" && (
          <TransactionsCard
            transactions={optimisticTx}
            contributions={contributions}
            onAdd={handleAdd}
            withControls
            nowKey={nowKey}
            minMonth={minMonth}
            onStopRecurring={handleStopRecurring}
            onDelete={handleDelete}
            highlightId={highlightId}
          />
        )}

        {tab === "Settings" && (
          <SettingsPanel
            key={activeId}
            saved={savedNow}
            target={savingsGoal}
            onTargetChange={handleTargetChange}
            name={user.name ?? ""}
            email={user.email ?? ""}
            onNameChange={handleNameChange}
            accountName={accountName}
            canDeleteAccount={!isPrimaryAccount}
            onRenameAccount={handleRenameAccount}
            onDeleteAccount={handleDeleteAccount}
          />
        )}
      </main>
    </div>
  );
}
