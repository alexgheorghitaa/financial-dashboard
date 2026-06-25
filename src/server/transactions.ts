import { prisma } from "@/lib/prisma";
import type { Transaction as UiTransaction, SavingsContributionUi } from "@/lib/mock-data";
import { relativeTime } from "@/server/notifications";

export type NotificationUi = {
  id: string;
  type: string;
  title: string;
  body: string;
  when: string;
  unread: boolean;
};

function fmtDate(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}
const TINT = {
  income:  { tint: "#eaf7ef", fg: "#16a34a" },
  expense: { tint: "#fdecec", fg: "#e11d48" },
};
function toUiTransaction(t: {
  id: string; amount: number; category: string; description: string;
  type: "income" | "expense"; date: Date;
  repeat: "none" | "monthly"; endDate: Date | null;
}): UiTransaction {
  const c = TINT[t.type];
  return {
    id: t.id,
    name: t.description,
    detail: t.type === "income" ? "Income" : t.category,
    initial: t.description.charAt(0).toUpperCase(),
    tint: c.tint,
    fg: c.fg,
    date: fmtDate(t.date),
    dateISO: t.date.toISOString().slice(0, 10),
    category: t.category,
    amount: t.type === "income" ? t.amount : -t.amount,
    type: t.type,
    status: "Completed",
    repeat: t.repeat,
    endISO: t.endDate ? t.endDate.toISOString().slice(0, 10) : null,
  };
}
function toUiContribution(c: { id: string; amount: number; date: Date; repeat: "none" | "monthly"; endDate: Date | null }): SavingsContributionUi {
  return {
    id: c.id,
    amount: c.amount,
    dateISO: c.date.toISOString().slice(0, 10),
    repeat: c.repeat,
    endISO: c.endDate ? c.endDate.toISOString().slice(0, 10) : null,
  };
}

export async function getActiveAccountId(userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      activeAccountId: true,
      accounts: { orderBy: { createdAt: "asc" }, select: { id: true } },
    },
  });
  if (!user || user.accounts.length === 0) return null;
  return user.accounts.find((a) => a.id === user.activeAccountId)?.id ?? user.accounts[0].id;
}

export async function getTransactionsForUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      activeAccountId: true,
      accounts: { orderBy: { createdAt: "asc" }, select: { id: true, name: true } },
    },
  });
  if (!user || user.accounts.length === 0) return null;

  const activeId = user.accounts.find((a) => a.id === user.activeAccountId)?.id ?? user.accounts[0].id;

  const account = await prisma.account.findUnique({
    where: { id: activeId },
    include: {
      transactions: { orderBy: { date: "desc" } },
      savingsContributions: { orderBy: { date: "desc" } },
      notifications: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
  if (!account) return null;

  const nowISO = new Date().toISOString();
  const notifications: NotificationUi[] = account.notifications.map((n) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    body: n.body,
    when: relativeTime(n.createdAt.toISOString(), nowISO),
    unread: n.readAt === null,
  }));
  const unreadCount = notifications.filter((n) => n.unread).length;

  return {
    account: { id: account.id, name: account.name, createdAt: account.createdAt.toISOString() },
    transactions: account.transactions.map(toUiTransaction),
    contributions: account.savingsContributions.map(toUiContribution),
    savingsGoal: account.savingsGoal,
    tip: account.tipText,
    tipUpdatedAt: account.tipUpdatedAt ? account.tipUpdatedAt.toISOString() : null,
    notifications,
    unreadCount,
    accounts: user.accounts,
    activeId,
    userName: user.name,
    userEmail: user.email,
  };
}
