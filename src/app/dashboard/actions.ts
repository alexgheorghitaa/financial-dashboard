"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

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
