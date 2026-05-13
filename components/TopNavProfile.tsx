'use client';

import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";

export default function TopNavProfile() {
  const { data: session, status } = useSession();

  // STATE 1: Glassmorphic Loading Skeleton
  if (status === "loading") {
    return (
      <div className="animate-pulse bg-black/5 dark:bg-white/5 h-[40px] w-[140px] rounded-full transition-colors duration-700"></div>
    );
  }

  // STATE 2: Authenticated W05 Operator
  if (session?.user) {
    return (
      <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 pl-4 pr-1 py-1 rounded-full border border-transparent dark:border-white/5 transition-colors duration-700">
        
        {/* User Info (Hidden on ultra-small mobile screens to save space) */}
        <div className="flex flex-col text-right hidden sm:flex pr-1">
          <span className="text-[11px] font-bold text-neutral-900 dark:text-white leading-none tracking-tight transition-colors duration-700">
            {session.user.name?.split(' ')[0] || "Operator"}
          </span>
          <span className="text-[9px] font-bold text-[#00A598] uppercase tracking-widest mt-0.5 transition-colors duration-700">
            Verified
          </span>
        </div>
        
        {/* Profile Avatar with Day/Night Adaptive Ring */}
        {session.user.image ? (
          <Image 
            src={session.user.image} 
            alt="Profile Picture" 
            width={32} 
            height={32} 
            className="rounded-full ring-2 ring-white dark:ring-[#111111] shadow-sm transition-all duration-700"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs font-bold transition-colors duration-700">
            {session.user.name?.charAt(0) || 'V'}
          </div>
        )}
        
        {/* Sleek Disconnect Button */}
        <button 
          onClick={() => signOut()}
          className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 dark:text-neutral-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-300 ml-1"
          title="Secure Disconnect"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>

      </div>
    );
  }

  // STATE 3: Unauthenticated (Interactive Ignition)
  return (
    <button 
      onClick={() => signIn('google')}
      className="flex items-center gap-2 px-5 py-2 rounded-full border border-blue-500/30 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-500 hover:border-transparent dark:hover:bg-blue-600 transition-all duration-300 group shadow-sm active:scale-95"
    >
      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 group-hover:bg-white animate-pulse transition-colors duration-300"></div>
      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 group-hover:text-white uppercase tracking-widest transition-colors duration-300">
        Sign In
      </span>
    </button>
  );
}