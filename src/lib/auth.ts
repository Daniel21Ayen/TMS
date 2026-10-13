import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { audit } from "@/lib/audit";

const DUMMY = bcrypt.hashSync("timing-equalizer", 10); // compared when the email doesn't exist, so response time doesn't reveal accounts
const ipOf = (h?: Record<string, unknown>) => String(h?.["x-forwarded-for"] ?? "unknown").split(",")[0].trim();

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      name: "credentials",
      credentials: { email: {}, password: {} },
      async authorize(c, req) {
        if (!c?.email || !c?.password) return null;
        const email = c.email.toLowerCase();
        const [a, b] = await Promise.all([rateLimit(`login:${email}`, 5, 900), rateLimit(`login-ip:${ipOf(req?.headers)}`, 30, 900)]);
        if (!a.ok || !b.ok) throw new Error("RATE_LIMITED");
        const u = await prisma.user.findUnique({ where: { email } });
        const valid = await bcrypt.compare(c.password, u?.passwordHash ?? DUMMY);
        if (!u || !valid) { if (u) await audit(u.id, "auth.login_failed"); return null; }
        if (u.status === "SUSPENDED") return null;
        if (!u.emailVerified) throw new Error("EMAIL_NOT_VERIFIED");
        await prisma.rateLimit.deleteMany({ where: { key: `login:${email}` } }); // successful login clears the counter
        await audit(u.id, "auth.login");
        return { id: u.id, name: u.name, email: u.email, role: u.role, tokenVersion: u.tokenVersion };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) { token.role = user.role; token.id = user.id; token.tv = user.tokenVersion; return token; }
      if (token.id) { // re-check on every request: suspended users and password changes take effect immediately
        const u = await prisma.user.findUnique({ where: { id: token.id }, select: { tokenVersion: true, status: true, role: true } });
        token.revoked = !u || u.status === "SUSPENDED" || u.tokenVersion !== token.tv;
        if (u) token.role = u.role;
      }
      return token;
    },
    session({ session, token }) {
      if (token.revoked) return { expires: session.expires } as typeof session; // no user => treated as signed out
      session.user.role = token.role!; session.user.id = token.id!;
      return session;
    },
  },
};
