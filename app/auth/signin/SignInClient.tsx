"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";

type Mode = "signin" | "register";

export default function SignInClient({ callbackUrl }: { callbackUrl: string }) {
  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      if (mode === "register") {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => null)) as { error?: string } | null;
          throw new Error(data?.error || "Registration failed");
        }
      }

      const result = await signIn("credentials", {
        email,
        password,
        callbackUrl,
        redirect: false,
      });
      if (result?.error) throw new Error("Invalid email or password");

      window.location.href = result?.url || callbackUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="flex h-full flex-col items-center overflow-y-auto bg-[var(--w09-bg)] px-5 py-10 text-[color:var(--w09-text)]">
      <div className="my-auto w-full max-w-md shrink-0 rounded-[32px] border border-[color:var(--w09-border)] bg-[var(--w09-surface)] p-6 shadow-2xl backdrop-blur-xl">
        <div className="mb-7">
          <div className="text-[10px] font-black uppercase tracking-[0.28em] text-[#00A598]">
            VESTRIPPN W85 · Auth
          </div>
          <h1 className="mt-3 text-3xl font-black tracking-tight">
            {mode === "signin" ? "Sign in" : "Create local account"}
          </h1>
          <p className="mt-2 text-sm text-[color:var(--w09-text-muted)]">
            Google stays online. LINE and local email/password are now available.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl })}
            className="rounded-2xl border border-[color:var(--w09-border)] bg-[var(--w09-surface-raised)] px-4 py-3 text-sm font-black transition hover:bg-[var(--w09-bg)]"
          >
            Google
          </button>
          <button
            type="button"
            onClick={() => signIn("line", { callbackUrl })}
            className="rounded-2xl border border-[#06C755]/30 bg-[#06C755]/20 px-4 py-3 text-sm font-black text-[#066b2e] transition hover:bg-[#06C755]/30 dark:text-[#8cffb0]"
          >
            LINE
          </button>
        </div>

        <div className="my-6 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.22em] text-[color:var(--w09-text-muted)]">
          <span className="h-px flex-1 bg-[var(--w09-border)]" />
          Local
          <span className="h-px flex-1 bg-[var(--w09-border)]" />
        </div>

        <form onSubmit={submit} className="space-y-3">
          {mode === "register" && (
            <label className="block">
              <span className="mb-1 block text-[10px] font-black uppercase tracking-widest text-[color:var(--w09-text-muted)]">
                Name
              </span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-2xl border border-[color:var(--w09-border)] bg-[var(--w09-surface-raised)] px-4 py-3 text-sm outline-none transition placeholder:text-[color:var(--w09-text-muted)] focus:border-[#00A598]"
                placeholder="Operator"
              />
            </label>
          )}
          <label className="block">
            <span className="mb-1 block text-[10px] font-black uppercase tracking-widest text-[color:var(--w09-text-muted)]">
              Email
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-2xl border border-[color:var(--w09-border)] bg-[var(--w09-surface-raised)] px-4 py-3 text-sm outline-none transition placeholder:text-[color:var(--w09-text-muted)] focus:border-[#00A598]"
              placeholder="you@example.com"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[10px] font-black uppercase tracking-widest text-[color:var(--w09-text-muted)]">
              Password
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
              className="w-full rounded-2xl border border-[color:var(--w09-border)] bg-[var(--w09-surface-raised)] px-4 py-3 text-sm outline-none transition placeholder:text-[color:var(--w09-text-muted)] focus:border-[#00A598]"
              placeholder="8+ characters"
            />
          </label>

          {error && (
            <div role="alert" className="rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-700 dark:text-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-2xl bg-[#00A598] px-4 py-3 text-sm font-black text-black transition hover:bg-[#12c7b8] disabled:cursor-wait disabled:opacity-60"
          >
            {busy ? "Working..." : mode === "signin" ? "Sign in locally" : "Create + sign in"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setError("");
            setMode(mode === "signin" ? "register" : "signin");
          }}
          className="mt-5 w-full text-center text-xs font-bold text-[color:var(--w09-text-muted)] transition hover:text-[color:var(--w09-text)]"
        >
          {mode === "signin" ? "Need a local account?" : "Already have a local account?"}
        </button>
      </div>
    </main>
  );
}
