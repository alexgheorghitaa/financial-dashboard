import type { Transaction } from "@/lib/mock-data";

export function monthKeyOf(iso: string): string {
  return iso.slice(0, 7);
}

export function dayKeyOf(iso: string): string {
  return iso.slice(0, 10);
}

export function shiftMonth(monthKey: string, delta: number): string {
  const [y, m] = monthKey.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${d.getFullYear()}-${mm}`;
}

export function computeBalance(txs: Transaction[]): number {
  return txs.reduce((sum, t) => sum + t.amount, 0);
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

export function computeDailySpend(txs: Transaction[], dayKey: string): number {
  return txs
    .filter((t) => t.type === "expense" && dayKeyOf(t.dateISO) === dayKey)
    .reduce((s, t) => s + Math.abs(t.amount), 0);
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

export function computeAllExpenses(txs: Transaction[], now: string): {
  daily: number; weekly: number; monthly: number; highlight: { label: string; amount: number };
} {
  const expenses = txs.filter((t) => t.type === "expense");
  const sum = (list: Transaction[]) => list.reduce((s, t) => s + Math.abs(t.amount), 0);
  const today = dayKeyOf(now);
  const d = new Date(now);
  d.setDate(d.getDate() - 7);
  const weekAgo = d.toISOString().slice(0, 10);
  const daily = sum(expenses.filter((t) => dayKeyOf(t.dateISO) === today));
  const weekly = sum(expenses.filter((t) => dayKeyOf(t.dateISO) > weekAgo && dayKeyOf(t.dateISO) <= today));
  const monthly = sum(expenses.filter((t) => monthKeyOf(t.dateISO) === monthKeyOf(now)));
  const top = computeExpenseShares(txs)[0];
  const highlight = top
    ? { label: top.label, amount: sum(expenses.filter((t) => t.category === top.label)) }
    : { label: "—", amount: 0 };
  return { daily, weekly, monthly, highlight };
}
