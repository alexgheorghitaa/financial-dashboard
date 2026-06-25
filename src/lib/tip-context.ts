import {
  monthKeyOf, shiftMonth, computeMonthly, computeMonthlySeries,
  computeAllExpenses, computeSaved, occursInMonth, monthLabel,
} from "@/lib/derive";
import type { Transaction, SavingsContributionUi } from "@/lib/mock-data";

const f = (n: number) => Math.round(n).toString();

export function buildTipSnapshot(params: {
  accountName: string;
  accountCreatedAt: string;
  transactions: Transaction[];
  contributions: SavingsContributionUi[];
  savingsGoal: number;
  nowKey: string;
  today: string;
}): string {
  const { accountName, accountCreatedAt, transactions: txs, contributions, savingsGoal, nowKey, today } = params;

  const month = computeMonthly(txs, nowKey);
  const prev = computeMonthly(txs, shiftMonth(nowKey, -1));
  const exp = computeAllExpenses(txs, nowKey);
  const saved = computeSaved(contributions, nowKey);
  const rate = month.income > 0 ? Math.round((month.savings / month.income) * 100) : null;

  const year = Number(nowKey.slice(0, 4));
  const trend = computeMonthlySeries(txs, year, nowKey)
    .filter((m) => m.income > 0 || m.expenses > 0)
    .map((m) => `${m.month} in ${f(m.income)}/out ${f(m.expenses)}`)
    .join(", ");

  const monthExp = txs.filter((t) => t.type === "expense" && occursInMonth(t, nowKey));
  const catMap: Record<string, number> = {};
  for (const t of monthExp) catMap[t.category] = (catMap[t.category] ?? 0) + Math.abs(t.amount);
  const catTotal = Object.values(catMap).reduce((s, v) => s + v, 0);
  const cats = Object.entries(catMap)
    .sort((a, b) => b[1] - a[1])
    .map(([c, v]) => `${c} ${f(v)} (${catTotal ? Math.round((v / catTotal) * 100) : 0}%)`)
    .join(", ");

  const recurring = txs.filter((t) => t.repeat === "monthly" && !t.endISO);
  const recList = recurring.map((t) => `${t.name} ${t.amount >= 0 ? "+" : "-"}${f(Math.abs(t.amount))}`).join(", ");
  const recTotal = recurring.reduce((s, t) => s + t.amount, 0);

  const biggest = [...monthExp]
    .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
    .slice(0, 5)
    .map((t) => `${t.name} ${f(Math.abs(t.amount))}`)
    .join(", ");

  const recentSavings = contributions
    .slice(0, 5)
    .map((c) => `${c.amount >= 0 ? "+" : "-"}${f(Math.abs(c.amount))} on ${c.dateISO}`)
    .join(", ");
  const goalPct = savingsGoal > 0 ? Math.round((saved / savingsGoal) * 100) : null;

  const lines = [
    `Account "${accountName}", currency USD. Opened ${monthLabel(monthKeyOf(accountCreatedAt))}. Today is ${today}.`,
    `Totals so far: ${txs.length} transactions, ${contributions.length} savings entries.`,
    `This month (${monthLabel(nowKey)}): income ${f(month.income)}, expenses ${f(month.expenses)}, net ${f(month.savings)}${rate !== null ? `, savings rate ${rate}%` : ", no income recorded yet"}.`,
    prev.income > 0 || prev.expenses > 0
      ? `Last month: income ${f(prev.income)}, expenses ${f(prev.expenses)}, net ${f(prev.savings)}.`
      : `No previous-month data.`,
    trend ? `Monthly trend ${year} (in/out): ${trend}.` : `No multi-month history yet.`,
    cats ? `Spending by category this month: ${cats}.` : `No expenses recorded this month.`,
    recList ? `Recurring monthly commitments: ${recList} (net ${f(recTotal)}/mo).` : `No recurring commitments.`,
    biggest ? `Biggest single expenses this month: ${biggest}.` : ``,
    `Average daily spend this month: ${f(exp.daily)}.`,
    `Savings: ${f(saved)} put aside${savingsGoal > 0 ? ` of a ${f(savingsGoal)} goal (${goalPct}%)` : " (no goal set)"}.`,
    recentSavings ? `Recent savings moves: ${recentSavings}.` : ``,
  ].filter(Boolean);

  return lines.join("\n");
}
