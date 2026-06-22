import type { Transaction } from "@/lib/mock-data";

export function monthKeyOf(iso: string): string {
  return iso.slice(0, 7);
}

export function shiftMonth(monthKey: string, delta: number): string {
  const [y, m] = monthKey.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${d.getFullYear()}-${mm}`;
}

export function daysInMonth(monthKey: string): number {
  const [y, m] = monthKey.split("-").map(Number);
  return new Date(y, m, 0).getDate();
}

export function monthLabel(monthKey: string): string {
  const d = new Date(monthKey + "-01T00:00:00");
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function computeBalanceUntil(txs: Transaction[], monthKey: string): number {
  return txs
    .filter((t) => monthKeyOf(t.dateISO) <= monthKey)
    .reduce((sum, t) => sum + t.amount, 0);
}

export function computeMonthly(
  txs: Transaction[],
  monthKey: string,
): { income: number; expenses: number; savings: number } {
  const inMonth = txs.filter((t) => monthKeyOf(t.dateISO) === monthKey);
  const income = inMonth
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);
  const expenses = inMonth
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + Math.abs(t.amount), 0);
  return { income, expenses, savings: income - expenses };
}

export function computeChangePct(current: number, previous: number): number | null {
  if (!previous) return null;
  return ((current - previous) / previous) * 100;
}

const SHARE_COLORS = ["#3b9be3", "#22c55e", "#f59e0b", "#ef4444", "#7c3aed", "#14b8a6", "#ec4899", "#64748b"];

export function computeExpenseShares(txs: Transaction[]): { label: string; value: number; color: string }[] {
  const expenses = txs.filter((t) => t.type === "expense");
  const total = expenses.reduce((s, t) => s + Math.abs(t.amount), 0);
  if (total === 0) return [];
  const byCategory = expenses.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] ?? 0) + Math.abs(t.amount);
    return acc;
  }, {} as Record<string, number>);
  return Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .map(([label, sum], i) => ({
      label,
      value: Math.round((sum / total) * 100),
      color: SHARE_COLORS[i % SHARE_COLORS.length],
    }));
}

export function computeAllExpenses(txs: Transaction[], monthKey: string): {
  daily: number; weekly: number; monthly: number; highlight: { label: string; amount: number };
} {
  const monthTx = txs.filter((t) => t.type === "expense" && monthKeyOf(t.dateISO) === monthKey);
  const monthly = monthTx.reduce((s, t) => s + Math.abs(t.amount), 0);
  const days = daysInMonth(monthKey);
  const daily = monthly / days;
  const weekly = monthly / (days / 7);
  const top = computeExpenseShares(monthTx)[0];
  const highlight = top
    ? { label: top.label, amount: monthTx.filter((t) => t.category === top.label).reduce((s, t) => s + Math.abs(t.amount), 0) }
    : { label: "—", amount: 0 };
  return { daily, weekly, monthly, highlight };
}
