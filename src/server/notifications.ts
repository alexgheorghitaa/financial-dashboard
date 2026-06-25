import type { Transaction, SavingsContributionUi } from "@/lib/mock-data";
import {
  monthKeyOf,
  monthLabel,
  occursInMonth,
  computeMonthly,
  computeBalanceUntil,
  computeSaved,
} from "@/lib/derive";

const DAY_MS = 24 * 60 * 60 * 1000;

function money(n: number): string {
  return `$${Math.round(Math.abs(n)).toLocaleString("en-US")}`;
}

export type NotificationCandidate = {
  accountId: string;
  type: string;
  title: string;
  body: string;
  dedupeKey: string;
};

// Pure: derives the notifications that SHOULD exist right now from the account's
// real data. Caller inserts them idempotently (createMany + skipDuplicates on dedupeKey),
// so each event materializes exactly once no matter how many times the page loads.
export function buildNotificationCandidates(params: {
  accountId: string;
  transactions: Transaction[];
  contributions: SavingsContributionUi[];
  savingsGoal: number;
  tipUpdatedAt: string | null;
  nowISO: string;
}): NotificationCandidate[] {
  const { accountId, transactions, contributions, savingsGoal, tipUpdatedAt, nowISO } = params;
  const nowKey = monthKeyOf(nowISO);
  const out: NotificationCandidate[] = [];

  // 1) Recurring payment posted this month — skip the first-occurrence month
  //    (start === now) so the user is only nudged from the 2nd month onward.
  for (const t of transactions) {
    if (t.repeat !== "monthly") continue;
    if (!occursInMonth(t, nowKey)) continue;
    if (monthKeyOf(t.dateISO) === nowKey) continue;
    out.push({
      accountId,
      type: "recurring",
      title: t.type === "income" ? "Income received" : "Recurring payment due",
      body: `${t.name} — ${money(t.amount)} (${monthLabel(nowKey)})`,
      dedupeKey: `recurring:${t.id}:${nowKey}`,
    });
  }

  // 2) Daily tip available again — once per tip cycle (keyed by the timestamp of the
  //    last generation), so it fires once after 24h and not again until a new tip is made.
  if (tipUpdatedAt) {
    const elapsed = new Date(nowISO).getTime() - new Date(tipUpdatedAt).getTime();
    if (elapsed >= DAY_MS) {
      out.push({
        accountId,
        type: "tip-ready",
        title: "Your daily tip is ready",
        body: "A fresh, data-grounded tip is waiting in your dashboard.",
        dedupeKey: `tip-ready:${accountId}:${tipUpdatedAt}`,
      });
    }
  }

  // 3) Savings goal reached — once per goal value.
  if (savingsGoal > 0) {
    const saved = computeSaved(contributions, nowKey);
    if (saved >= savingsGoal) {
      out.push({
        accountId,
        type: "goal-reached",
        title: "Savings goal reached 🎉",
        body: `You've saved ${money(saved)} of your ${money(savingsGoal)} goal. Nice work!`,
        dedupeKey: `goal-reached:${accountId}:${savingsGoal}`,
      });
    }
  }

  // 4) Negative balance (more severe) or overspending this month — once per month.
  const balance = computeBalanceUntil(transactions, nowKey);
  const monthlyNet = computeMonthly(transactions, nowKey).savings;
  if (balance < 0) {
    out.push({
      accountId,
      type: "low-balance",
      title: "Negative balance",
      body: `Your balance is -${money(balance)}. Time to review your spending.`,
      dedupeKey: `low-balance:${accountId}:${nowKey}`,
    });
  } else if (monthlyNet < 0) {
    out.push({
      accountId,
      type: "overspend",
      title: "Spending over income",
      body: `You spent ${money(monthlyNet)} more than you earned in ${monthLabel(nowKey)}.`,
      dedupeKey: `overspend:${accountId}:${nowKey}`,
    });
  }

  return out;
}

// Short relative-time label for the bell list. Runs in the DAL (server), never in render.
export function relativeTime(iso: string, nowISO: string): string {
  const diff = Math.max(0, new Date(nowISO).getTime() - new Date(iso).getTime());
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
