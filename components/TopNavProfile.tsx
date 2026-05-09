'use client';

import { useSession, signOut } from "next-auth/react";
import Image from "next/image";

export default function TopNavProfile() {
  // This hook pulls the active session from the AuthProvider
  const { data: session, status } = useSession();

  // STATE 1: Loading (Checking the cookie)
  if (status === "loading") {
    return (
      <div className="animate-pulse bg-gray-700 h-8 w-24 rounded"></div>
    );
  }

  // STATE 2: Authenticated Operator
  if (session?.user) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex flex-col text-right">
          <span className="text-sm font-bold text-textPri">Operator Active</span>
          <span className="text-xs text-green-400">{session.user.name}</span>
        </div>
        
        {/* Displays your Google Profile Picture */}
        {session.user.image && (
          <Image 
            src={session.user.image} 
            alt="Profile Picture" 
            width={36} 
            height={36} 
            className="rounded-full border border-green-500"
          />
        )}
        
        {/* Optional: A subtle way to sign out */}
        <button 
          onClick={() => signOut()}
          className="ml-2 text-xs text-red-500 hover:text-red-400"
        >
          [DISCONNECT]
        </button>
      </div>
    );
  }

  // STATE 3: Unauthenticated (Fallback)
  return (
    <div className="text-sm text-red-500 font-mono">
      SYSTEM LOCKED
    </div>
  );
}