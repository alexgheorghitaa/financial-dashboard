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
