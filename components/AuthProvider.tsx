'use client';

import { SessionProvider } from "next-auth/react";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  // By forcing the basePath, we stop NextAuth from relying on hidden environment 
  // variables on the frontend, fixing the "malformed string" fetch error.
  return (
    <SessionProvider basePath="/api/auth">
      {children}
    </SessionProvider>
  );
}