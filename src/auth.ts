import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const credentialsSchema = z.object({
  email: z.string().email().transform((v) => v.trim().toLowerCase()),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },

  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
        if (!user) return null;
        const passwordOk = await bcrypt.compare(parsed.data.password, user.password);
        if (!passwordOk) return null;
        return { id: user.id, name: user.name, email: user.email };
      },
    }),
  ],

  callbacks: {
    authorized({ request, auth }) {
      const isLoggedIn = !!auth;
      const { pathname } = request.nextUrl;
      if (pathname.startsWith("/dashboard")) return isLoggedIn;
      if (isLoggedIn && (pathname === "/" || pathname === "/login" || pathname === "/register"))
        return Response.redirect(new URL("/dashboard", request.nextUrl.origin));
      return true;
    },
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      return session;
    },
  },
});
