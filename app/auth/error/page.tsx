import Link from "next/link";

export default function AuthErrorPage() {
  return (
    <main className="flex h-full flex-col items-center overflow-y-auto bg-[var(--w09-bg)] px-5 py-10 text-[color:var(--w09-text)]">
      <div className="w85-panel-accent my-auto w-full max-w-md shrink-0 rounded-[32px] border border-[color:var(--w09-border)] bg-[var(--w09-surface)] p-6 text-center shadow-2xl backdrop-blur-xl">
        <div className="text-[10px] font-black uppercase tracking-[0.28em] text-red-700 dark:text-red-300">
          Auth error
        </div>
        <h1 className="mt-3 text-3xl font-black tracking-tight">Access denied</h1>
        <p className="mt-3 text-sm leading-relaxed text-[color:var(--w09-text-muted)]">
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
