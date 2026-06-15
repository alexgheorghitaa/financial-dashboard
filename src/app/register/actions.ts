"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const SALT_ROUNDS = 12;

const registerSchema = z.object({
  name: z.string().min(1).transform((v) => v.trim()),
  email: z.string().email().transform((v) => v.trim().toLowerCase()),
  password: z.string().min(8),
});

export async function registerUser(
  input: { name: string; email: string; password: string }
): Promise<{ success?: boolean; error?: string }> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid data." };

  const passwordHash = await bcrypt.hash(parsed.data.password, SALT_ROUNDS);

  try {
    await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        password: passwordHash,
      },
    });
    return { success: true };
  } catch (e) {
    if (e && typeof e === "object" && "code" in e && e.code === "P2002") {
      return { error: "An account with this email already exists." };
    }
    throw e;
  }
}
