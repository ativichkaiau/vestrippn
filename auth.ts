import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Line from "next-auth/providers/line";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";

const PRIMARY_EMAIL = "ativichkaiau2549@gmail.com";

function isAllowedEmail(email?: string | null) {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  const ownerEmail = process.env.OWNER_EMAIL?.trim().toLowerCase() || PRIMARY_EMAIL;
  return normalized === ownerEmail || normalized.endsWith("@gmail.com");
}

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
      async authorize(credentials) {
        const email = String(credentials?.email ?? "").trim().toLowerCase();
        const password = String(credentials?.password ?? "");
        if (!email || !password) return null;

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
     * - Google remains Gmail/owner-locked for continuity.
     * - LINE requires an email claim and follows the same allow-list.
     */
    async signIn({ user, account }) {
      if (account?.provider === "credentials") return true;
      return isAllowedEmail(user.email);
    },

    /**
     * JWT TELEMETRY PIPE
     * Passes the OAuth access token from the account into the session.
     */
    async jwt({ token, account, user }) {
      // Initial login
      if (user && account) {
        return {
          ...token,
          id: user.id,
          accessToken: account.access_token,
          // Store the refresh token in the DB via Prisma, but keep the current AT in the JWT
          accessTokenExpires: account.expires_at ? account.expires_at * 1000 : 0,
        };
      }
      return token;
    },

    /**
     * SESSION UPLINK
     * Makes the provider token and User ID available to the Dashboard components.
     */
    async session({ session, token }: any) {
      if (token) {
        session.accessToken = token.accessToken;
        session.user.id = token.id;
      }
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
