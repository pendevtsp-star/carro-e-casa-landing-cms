import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { z } from "zod";

import {
  buildLoginRateLimitKey,
  clearLoginFailures,
  getClientIp,
  isLoginBlocked,
  recordLoginFailure,
} from "@/lib/login-rate-limit";
import { prisma } from "@/lib/prisma";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/admin/login",
  },
  providers: [
    Credentials({
      name: "E-mail e senha",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials, request) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const email = parsed.data.email.toLowerCase();
        const rateLimitKey = buildLoginRateLimitKey(getClientIp(request.headers), email);
        if (isLoginBlocked(rateLimitKey)) {
          return null;
        }

        const user = await prisma.adminUser.findUnique({
          where: { email },
        });

        if (!user?.isActive) {
          recordLoginFailure(rateLimitKey);
          return null;
        }

        const passwordMatches = await compare(
          parsed.data.password,
          user.passwordHash,
        );

        if (!passwordMatches) {
          recordLoginFailure(rateLimitKey);
          return null;
        }

        clearLoginFailures(rateLimitKey);

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          institutionalEmail: user.institutionalEmail,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = "role" in user ? user.role : "admin";
        token.institutionalEmail =
          "institutionalEmail" in user ? user.institutionalEmail : null;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.sub || "");
        session.user.role = String(token.role || "admin");
        session.user.institutionalEmail =
          typeof token.institutionalEmail === "string"
            ? token.institutionalEmail
            : null;
      }
      return session;
    },
  },
});
