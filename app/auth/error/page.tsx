import Link from "next/link";

export default function AuthErrorPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center px-5">
      <div className="max-w-md rounded-[32px] border border-white/10 bg-white/[0.06] p-6 text-center shadow-2xl backdrop-blur-xl">
        <div className="text-[10px] font-black uppercase tracking-[0.28em] text-red-300">
          Auth error
        </div>
        <h1 className="mt-3 text-3xl font-black tracking-tight">Access denied</h1>
        <p className="mt-3 text-sm leading-relaxed text-white/55">
          The account was not allowed or the provider did not return a usable email.
        </p>
        <Link
          href="/auth/signin"
          className="mt-6 inline-flex rounded-2xl bg-[#00A598] px-5 py-3 text-sm font-black text-black transition hover:bg-[#12c7b8]"
        >
          Try again
        </Link>
      </div>
    </main>
  );
}

