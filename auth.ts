import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  // 1. THE DATABASE UPLINK
  adapter: PrismaAdapter(prisma), 
  
  // 2. CRITICAL OVERRIDE: Keep JWT strategy active so Gmail tokens don't break
  session: {
    strategy: "jwt", 
  },

  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/gmail.readonly",
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      // If the user object exists (initial login), attach the database ID to the token
      if (user) {
        token.id = user.id;
      }
      // Pass the Google access token for your Gmail API calls
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }: any) {
      // Pipe both the Gmail token and the Database ID into your frontend session
      session.accessToken = token.accessToken;
      if (session.user) {
        session.user.id = token.id;
      }
      return session;
    },
    async signIn({ user }) {
      // Bouncer Whitelist: Only you are granted access to the system.
      const allowedEmails = ["ativichkaiau2549@gmail.com"]; 
      return !!(user.email && allowedEmails.includes(user.email));
    },
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  basePath: "/api/auth",
});