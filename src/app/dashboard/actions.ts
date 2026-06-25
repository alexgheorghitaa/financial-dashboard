"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { getTransactionsForUser, getActiveAccountId } from "@/server/transactions";
import { generateDailyTip } from "@/server/groq";
import { buildTipSnapshot } from "@/lib/tip-context";
import { monthKeyOf, computeBalanceUntil, computeSaved } from "@/lib/derive";

const schema = z.object({
  description: z.string().min(2),
  amount: z.coerce.number().positive(),
  type: z.enum(["income", "expense"]),
  category: z.string().min(1),
  date: z.string().min(1),
  repeat: z.enum(["none", "monthly"]),
});

export async function createTransaction(input: {
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
  repeat: "none" | "monthly";
}): Promise<{ success?: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated." };

  const parsed = schema.safeParse(input);
  if (!parsed.success) return { error: "Invalid data." };

  const accountId = await getActiveAccountId(session.user.id);
  if (!accountId) return { error: "No account found." };

  await prisma.transaction.create({
    data: {
      description: parsed.data.description,
      amount: Math.abs(parsed.data.amount),
      category: parsed.data.category,
      type: parsed.data.type,
      repeat: parsed.data.repeat,
      date: new Date(parsed.data.date),
      accountId,
    },
  });

  revalidatePath("/dashboard");
  return { success: true };
}

const savingsSchema = z.object({
  amount: z.coerce.number().positive(),
  repeat: z.enum(["none", "monthly"]),
});

export async function addSavingsContribution(input: {
  amount: number;
  repeat: "none" | "monthly";
}): Promise<{ success?: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated." };

  const parsed = savingsSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid data." };

  const accountId = await getActiveAccountId(session.user.id);
  if (!accountId) return { error: "No account found." };

  const data = await getTransactionsForUser(session.user.id);
  const nowKey = monthKeyOf(new Date().toISOString());
  const available = data
    ? computeBalanceUntil(data.transactions, nowKey) - computeSaved(data.contributions, nowKey)
    : 0;
  if (parsed.data.amount > available) return { error: "Not enough available balance." };

  await prisma.savingsContribution.create({
    data: {
      amount: parsed.data.amount,
      repeat: parsed.data.repeat,
      accountId,
    },
  });

  revalidatePath("/dashboard");
  return { success: true };
}

const withdrawSchema = z.object({ amount: z.coerce.number().positive() });

export async function withdrawSavings(input: { amount: number }): Promise<{ success?: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated." };

  const parsed = withdrawSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid data." };

  const accountId = await getActiveAccountId(session.user.id);
  if (!accountId) return { error: "No account found." };

  const data = await getTransactionsForUser(session.user.id);
  const nowKey = monthKeyOf(new Date().toISOString());
  const saved = data ? computeSaved(data.contributions, nowKey) : 0;
  if (parsed.data.amount > saved) return { error: "You can't withdraw more than you've saved." };

  await prisma.savingsContribution.create({
    data: {
      amount: -parsed.data.amount,
      repeat: "none",
      accountId,
    },
  });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function stopRecurringTransaction(id: string): Promise<{ success?: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated." };

  const accountId = await getActiveAccountId(session.user.id);
  if (!accountId) return { error: "No account found." };

  const row = await prisma.transaction.findUnique({ where: { id } });
  if (!row || row.accountId !== accountId) return { error: "Not found." };

  await prisma.transaction.update({ where: { id }, data: { endDate: new Date() } });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteTransaction(id: string): Promise<{ success?: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated." };

  const accountId = await getActiveAccountId(session.user.id);
  if (!accountId) return { error: "No account found." };

  const row = await prisma.transaction.findUnique({ where: { id } });
  if (!row || row.accountId !== accountId) return { error: "Not found." };

  await prisma.transaction.delete({ where: { id } });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function stopRecurringSavings(id: string): Promise<{ success?: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated." };

  const accountId = await getActiveAccountId(session.user.id);
  if (!accountId) return { error: "No account found." };

  const row = await prisma.savingsContribution.findUnique({ where: { id } });
  if (!row || row.accountId !== accountId) return { error: "Not found." };

  await prisma.savingsContribution.update({ where: { id }, data: { endDate: new Date() } });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteSavings(id: string): Promise<{ success?: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated." };

  const accountId = await getActiveAccountId(session.user.id);
  if (!accountId) return { error: "No account found." };

  const row = await prisma.savingsContribution.findUnique({ where: { id } });
  if (!row || row.accountId !== accountId) return { error: "Not found." };

  await prisma.savingsContribution.delete({ where: { id } });

  revalidatePath("/dashboard");
  return { success: true };
}

const targetSchema = z.object({ target: z.coerce.number().min(0) });

export async function updateSavingsGoal(target: number): Promise<{ success?: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated." };

  const parsed = targetSchema.safeParse({ target });
  if (!parsed.success) return { error: "Invalid data." };

  const accountId = await getActiveAccountId(session.user.id);
  if (!accountId) return { error: "No account found." };

  await prisma.account.update({
    where: { id: accountId },
    data: { savingsGoal: parsed.data.target },
  });

  revalidatePath("/dashboard");
  return { success: true };
}

const nameSchema = z.object({ name: z.string().trim().min(2) });

export async function updateUserName(name: string): Promise<{ success?: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated." };

  const parsed = nameSchema.safeParse({ name });
  if (!parsed.success) return { error: "Invalid data." };

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: parsed.data.name },
  });

  revalidatePath("/dashboard");
  return { success: true };
}

const accountNameSchema = z.object({ name: z.string().trim().min(1).max(40) });

export async function setActiveAccount(accountId: string): Promise<{ success?: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated." };

  const account = await prisma.account.findUnique({ where: { id: accountId }, select: { userId: true } });
  if (!account || account.userId !== session.user.id) return { error: "Not found." };

  await prisma.user.update({ where: { id: session.user.id }, data: { activeAccountId: accountId } });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function createAccount(name: string): Promise<{ success?: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated." };

  const parsed = accountNameSchema.safeParse({ name });
  if (!parsed.success) return { error: "Invalid name." };

  const account = await prisma.account.create({
    data: { name: parsed.data.name, userId: session.user.id },
  });
  await prisma.user.update({ where: { id: session.user.id }, data: { activeAccountId: account.id } });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function renameAccount(accountId: string, name: string): Promise<{ success?: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated." };

  const parsed = accountNameSchema.safeParse({ name });
  if (!parsed.success) return { error: "Invalid name." };

  const account = await prisma.account.findUnique({ where: { id: accountId }, select: { userId: true } });
  if (!account || account.userId !== session.user.id) return { error: "Not found." };

  await prisma.account.update({ where: { id: accountId }, data: { name: parsed.data.name } });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteAccount(accountId: string): Promise<{ success?: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated." };

  const accounts = await prisma.account.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  if (accounts.length <= 1) return { error: "You can't delete your only account." };
  if (accounts[0].id === accountId) return { error: "You can't delete your primary account." };
  if (!accounts.some((a) => a.id === accountId)) return { error: "Not found." };

  await prisma.account.delete({ where: { id: accountId } });

  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { activeAccountId: true } });
  if (user?.activeAccountId === accountId) {
    await prisma.user.update({ where: { id: session.user.id }, data: { activeAccountId: accounts[0].id } });
  }

  revalidatePath("/dashboard");
  return { success: true };
}

export async function generateTip(): Promise<{ tip?: string; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated." };

  const accountId = await getActiveAccountId(session.user.id);
  if (!accountId) return { error: "No account found." };

  const data = await getTransactionsForUser(session.user.id);
  if (!data) return { error: "No data to analyze yet." };

  const acct = await prisma.account.findUnique({
    where: { id: accountId },
    select: { tipText: true, tipMemory: true, tipUpdatedAt: true },
  });

  // One generation per 24h.
  const DAY_MS = 24 * 60 * 60 * 1000;
  if (acct?.tipUpdatedAt) {
    const elapsed = Date.now() - acct.tipUpdatedAt.getTime();
    if (elapsed < DAY_MS) {
      const hoursLeft = Math.ceil((DAY_MS - elapsed) / 3_600_000);
      return { error: `Your tip is set — you can refresh again in about ${hoursLeft}h.` };
    }
  }

  const nowISO = new Date().toISOString();
  const nowKey = monthKeyOf(nowISO);
  const today = nowISO.slice(0, 10);

  const daysSince = acct?.tipUpdatedAt ? Math.floor((Date.now() - acct.tipUpdatedAt.getTime()) / DAY_MS) : null;
  const gapNote =
    daysSince === null
      ? "This is the first tip for this account."
      : daysSince <= 1
        ? "About a day has passed since the last tip."
        : `${daysSince} days have passed since the last tip — welcome the user back.`;

  const snapshot = gapNote + "\n" + buildTipSnapshot({
    accountName: data.account.name,
    accountCreatedAt: data.account.createdAt,
    transactions: data.transactions,
    contributions: data.contributions,
    savingsGoal: data.savingsGoal,
    nowKey,
    today,
  });

  let result: { tip: string; memory: string };
  try {
    result = await generateDailyTip({
      snapshot,
      memory: acct?.tipMemory ?? "",
      previousTip: acct?.tipText ?? "",
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not generate a tip." };
  }

  // Each generation is at least 24h apart, so the rolling memory always advances.
  await prisma.account.update({
    where: { id: accountId },
    data: { tipText: result.tip, tipMemory: result.memory, tipUpdatedAt: new Date() },
  });

  revalidatePath("/dashboard");
  return { tip: result.tip };
}
