"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { getTransactionsForUser } from "@/server/transactions";
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

  const account = await prisma.account.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
  });
  if (!account) return { error: "No account found." };

  await prisma.transaction.create({
    data: {
      description: parsed.data.description,
      amount: Math.abs(parsed.data.amount),
      category: parsed.data.category,
      type: parsed.data.type,
      repeat: parsed.data.repeat,
      date: new Date(parsed.data.date),
      accountId: account.id,
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

  const account = await prisma.account.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
  });
  if (!account) return { error: "No account found." };

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
      accountId: account.id,
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

  const account = await prisma.account.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
  });
  if (!account) return { error: "No account found." };

  const data = await getTransactionsForUser(session.user.id);
  const nowKey = monthKeyOf(new Date().toISOString());
  const saved = data ? computeSaved(data.contributions, nowKey) : 0;
  if (parsed.data.amount > saved) return { error: "You can't withdraw more than you've saved." };

  await prisma.savingsContribution.create({
    data: {
      amount: -parsed.data.amount,
      repeat: "none",
      accountId: account.id,
    },
  });

  revalidatePath("/dashboard");
  return { success: true };
}

async function requireAccount(userId: string) {
  return prisma.account.findFirst({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });
}

export async function stopRecurringTransaction(id: string): Promise<{ success?: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated." };

  const account = await requireAccount(session.user.id);
  if (!account) return { error: "No account found." };

  const row = await prisma.transaction.findUnique({ where: { id } });
  if (!row || row.accountId !== account.id) return { error: "Not found." };

  await prisma.transaction.update({ where: { id }, data: { endDate: new Date() } });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteTransaction(id: string): Promise<{ success?: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated." };

  const account = await requireAccount(session.user.id);
  if (!account) return { error: "No account found." };

  const row = await prisma.transaction.findUnique({ where: { id } });
  if (!row || row.accountId !== account.id) return { error: "Not found." };

  await prisma.transaction.delete({ where: { id } });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function stopRecurringSavings(id: string): Promise<{ success?: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated." };

  const account = await requireAccount(session.user.id);
  if (!account) return { error: "No account found." };

  const row = await prisma.savingsContribution.findUnique({ where: { id } });
  if (!row || row.accountId !== account.id) return { error: "Not found." };

  await prisma.savingsContribution.update({ where: { id }, data: { endDate: new Date() } });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteSavings(id: string): Promise<{ success?: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated." };

  const account = await requireAccount(session.user.id);
  if (!account) return { error: "No account found." };

  const row = await prisma.savingsContribution.findUnique({ where: { id } });
  if (!row || row.accountId !== account.id) return { error: "Not found." };

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

  await prisma.user.update({
    where: { id: session.user.id },
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
