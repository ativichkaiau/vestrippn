import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Line from "next-auth/providers/line";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { isAllowedEmail } from "@/lib/auth/allow-list";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const { handlers, auth, signIn, signOut } = NextAuth({
  // 1. DATABASE UPLINK
  // PrismaAdapter manages auto-registration of new friends in your database.
  adapter: PrismaAdapter(prisma),

  // 2. SESSION STRATEGY
  // JWT is required to pass the Gmail access tokens to the frontend.
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 Days
  },

  providers: [
    Credentials({
      id: "credentials",
      name: "Email password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        const email = String(credentials?.email ?? "").trim().toLowerCase();
        const password = String(credentials?.password ?? "");
        if (!email || !password) return null;
        // Blunt password guessing: per address+account, and per address overall.
        const ip = request instanceof Request ? clientIp(request.headers) : "unknown";
        if (!rateLimit(`signin:${ip}:${email}`, 8, 15 * 60_000).ok || !rateLimit(`signin:${ip}`, 30, 15 * 60_000).ok) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.passwordHash) return null;
        if (!(await verifyPassword(password, user.passwordHash))) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          // Keep the Gmail scope for your integrated mail telemetry
          scope: "openid email profile https://www.googleapis.com/auth/gmail.readonly",
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    Line({
      clientId: process.env.LINE_CLIENT_ID!,
      clientSecret: process.env.LINE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "profile openid email",
        },
      },
    }),
  ],

  callbacks: {
    /**
     * Access lock.
     * - Credentials users are validated in authorize().
     * - Google and LINE follow the allow-list (lib/auth/allow-list,
     *   AUTH_ALLOWED_EMAILS); LINE needs an email claim.
     */
    async signIn({ user, account }) {
      if (account?.provider === "credentials") return true;
      return isAllowedEmail(user.email);
    },

    /**
     * Only the user id travels in the JWT. Provider access tokens stay in the
     * Account table (the Gmail feed refreshes its own); they are never copied
     * into the session, which the browser can read from /api/auth/session.
     */
    async jwt({ token, user }) {
      if (user?.id) return { ...token, id: user.id };
      return token;
    },

    async session({ session, token }) {
      if (typeof token?.id === "string") session.user.id = token.id;
      return session;
    },
  },

  // UI CUSTOMIZATION
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },

  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  basePath: "/api/auth",
});
