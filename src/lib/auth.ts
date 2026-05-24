import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "./db";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      roleId: string;
      roleName: string;
    } & DefaultSession["user"];
  }
}

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/admin/giris",
    error: "/admin/giris",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "E-posta", type: "email" },
        password: { label: "Şifre", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email.toLowerCase() },
          include: { role: { select: { id: true, name: true } } },
        });
        if (!user || !user.isActive) return null;

        const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!valid) return null;

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          roleId: user.roleId,
          roleName: user.role.name,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as { id: string; roleId: string; roleName: string };
        token.id = u.id;
        token.roleId = u.roleId;
        token.roleName = u.roleName;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        const t = token as Record<string, unknown>;
        session.user.id = t.id as string;
        session.user.roleId = t.roleId as string;
        session.user.roleName = t.roleName as string;
      }
      return session;
    },
  },
});
