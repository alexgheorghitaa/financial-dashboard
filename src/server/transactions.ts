import { prisma } from "@/lib/prisma";
import type { Transaction as UiTransaction } from "@/lib/mock-data";

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
  };
}
export async function getTransactionsForUser(userId: string) {
  const account = await prisma.account.findFirst({
    where: { userId },
    orderBy: { createdAt: "asc" },
    include: { transactions: { orderBy: { date: "desc" } } },
  });

  if (!account) return null;

  return {
    account: { id: account.id, name: account.name },
    transactions: account.transactions.map(toUiTransaction),
  };
}
