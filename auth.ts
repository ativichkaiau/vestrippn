import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

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
  ],

  callbacks: {
    /**
     * GMAIL DOMAIN LOCK
     * Allows any @gmail.com user to auto-register.
     */
    async signIn({ user, account, profile }) {
      if (!user.email) return false;

      const isGmail = user.email.endsWith("@gmail.com");
      const isPrimary = user.email === "ativichkaiau2549@gmail.com";

      // Allow the connection only if it's Gmail or your primary account
      return isGmail || isPrimary;
    },

    /**
     * JWT TELEMETRY PIPE
     * Passes the Google Access Token from the account into the session.
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
     * Makes the Gmail token and User ID available to the Dashboard components.
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
    signIn: '/auth/signin', // Optional: Redirect to a custom AMG-themed sign-in page
    error: '/auth/error',   // Error handling for the "Access Denied" state
  },

  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  basePath: "/api/auth",
});