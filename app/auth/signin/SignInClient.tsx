"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

type Mode = "signin" | "register";

export default function SignInClient() {
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/";
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
    <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-md rounded-[32px] border border-white/10 bg-white/[0.06] p-6 shadow-2xl backdrop-blur-xl">
        <div className="mb-7">
          <div className="text-[10px] font-black uppercase tracking-[0.28em] text-[#00A598]">
            VESTRIPPN Auth
          </div>
          <h1 className="mt-3 text-3xl font-black tracking-tight">
            {mode === "signin" ? "Sign in" : "Create local account"}
          </h1>
          <p className="mt-2 text-sm text-white/55">
            Google stays online. LINE and local email/password are now available.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl })}
            className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-black transition hover:bg-white/15"
          >
            Google
          </button>
          <button
            type="button"
            onClick={() => signIn("line", { callbackUrl })}
            className="rounded-2xl border border-[#06C755]/30 bg-[#06C755]/20 px-4 py-3 text-sm font-black text-[#8cffb0] transition hover:bg-[#06C755]/30"
          >
            LINE
          </button>
        </div>

        <div className="my-6 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.22em] text-white/35">
          <span className="h-px flex-1 bg-white/10" />
          Local
          <span className="h-px flex-1 bg-white/10" />
        </div>

        <form onSubmit={submit} className="space-y-3">
          {mode === "register" && (
            <label className="block">
              <span className="mb-1 block text-[10px] font-black uppercase tracking-widest text-white/45">
                Name
              </span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm outline-none transition focus:border-[#00A598]"
                placeholder="Operator"
              />
            </label>
          )}
          <label className="block">
            <span className="mb-1 block text-[10px] font-black uppercase tracking-widest text-white/45">
              Email
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm outline-none transition focus:border-[#00A598]"
              placeholder="you@example.com"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[10px] font-black uppercase tracking-widest text-white/45">
              Password
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
              className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm outline-none transition focus:border-[#00A598]"
              placeholder="8+ characters"
            />
          </label>

          {error && (
            <div className="rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200">
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
          className="mt-5 w-full text-center text-xs font-bold text-white/50 transition hover:text-white"
        >
          {mode === "signin" ? "Need a local account?" : "Already have a local account?"}
        </button>
      </div>
    </main>
  );
}

