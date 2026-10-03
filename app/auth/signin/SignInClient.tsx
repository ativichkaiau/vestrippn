"use client";

import { FormEvent, useId, useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { resolvePath } from "@/lib/system/navigation";

type Mode = "signin" | "register";
type Phase = "idle" | "authenticating" | "mounting" | "google" | "line";

const PHASE_LABEL: Record<Exclude<Phase, "idle">, string> = {
  authenticating: "resolving identity…",
  mounting: "mounting environment…",
  google: "redirecting to Google…",
  line: "redirecting to LINE…",
};

/* The entry boundary into VESTRIPPN. Providers and logic are unchanged:
   Google and LINE through Auth.js, local email/password through the
   credentials provider (with registration at /api/auth/register). */
export default function SignInClient({ callbackUrl }: { callbackUrl: string }) {
  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const ids = { name: useId(), email: useId(), password: useId(), status: useId() };
  const busy = phase !== "idle";
  const requested = resolvePath(safePath(callbackUrl)).display;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPhase("authenticating");
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

      setPhase("mounting");
      window.location.href = result?.url || callbackUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed");
      setPhase("idle");
    }
  };

  const provider = (id: "google" | "line") => {
    setError("");
    setPhase(id);
    void signIn(id, { callbackUrl });
  };

  return (
    <main className="sys-auth">
      <section className="sys-auth-boundary" aria-label="VESTRIPPN">
        <div>
          <p className="sys-label">VESTRIPPN / auth_gate</p>
          <p className="sys-auth-brand" style={{ marginTop: "var(--space-5)" }}>
            VESTRIPPN<span className="sys-cursor" aria-hidden="true">_</span>
          </p>
          <p className="sys-label" style={{ marginTop: "var(--space-6)" }}>
            root environment
          </p>
          <ul className="sys-auth-branches">
            <li>medicine</li>
            <li>research</li>
            <li>software</li>
            <li>archives</li>
          </ul>
        </div>
        <dl className="sys-meta sys-auth-detail" data-compact data-bare>
          <div>
            <dt>session</dt>
            <dd data-mono>not authenticated</dd>
          </div>
          <div>
            <dt>status</dt>
            <dd data-mono>restricted session</dd>
          </div>
          <div>
            <dt>requested</dt>
            <dd data-mono>{requested}</dd>
          </div>
        </dl>
      </section>

      <section className="sys-auth-form-area">
        <div className="sys-auth-form">
          <div>
            <p className="sys-label">{mode === "signin" ? "authenticate" : "local_auth / register"}</p>
            <h1>{mode === "signin" ? "Sign in" : "Create local account"}</h1>
          </div>

          <div className="sys-auth-providers" role="group" aria-label="Sign in with a provider">
            <button type="button" className="sys-auth-provider" onClick={() => provider("google")} disabled={busy}>
              <span>Google</span>
              <span>oauth</span>
            </button>
            <button type="button" className="sys-auth-provider" onClick={() => provider("line")} disabled={busy}>
              <span>LINE</span>
              <span>oauth</span>
            </button>
          </div>

          <div className="sys-auth-divider">
            <span className="sys-label">local_auth</span>
          </div>

          <form onSubmit={submit} className="sys-auth-fields" aria-describedby={ids.status}>
            {mode === "register" && (
              <div className="sys-field">
                <label htmlFor={ids.name}>name</label>
                <input id={ids.name} className="sys-input" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
              </div>
            )}
            <div className="sys-field">
              <label htmlFor={ids.email}>email</label>
              <input
                id={ids.email}
                className="sys-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
              />
            </div>
            <div className="sys-field">
              <label htmlFor={ids.password}>password</label>
              <input
                id={ids.password}
                className="sys-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                placeholder="8+ characters"
              />
            </div>

            {error && (
              <div role="alert" className="sys-alert">
                {error}
              </div>
            )}

            <button type="submit" className="sys-action sys-auth-submit" data-variant="primary" disabled={busy}>
              {mode === "signin" ? "authenticate" : "create + sign in"}
            </button>
          </form>

          <p id={ids.status} role="status" className="sys-auth-status">
            {phase === "idle" ? "" : PHASE_LABEL[phase]}
          </p>

          <button
            type="button"
            className="sys-auth-switch"
            onClick={() => {
              setError("");
              setMode(mode === "signin" ? "register" : "signin");
            }}
          >
            {mode === "signin" ? "need a local account? register →" : "have a local account? sign in →"}
          </button>

          <Link className="sys-auth-switch" href="/legal">
            privacy, terms & disclaimers
          </Link>
        </div>
      </section>
    </main>
  );
}

/** Only same-origin paths are shown as the requested location. */
function safePath(url: string): string {
  try {
    const parsed = new URL(url, "https://vestrippn.local");
    return parsed.origin === "https://vestrippn.local" ? parsed.pathname : "/";
  } catch {
    return "/";
  }
}
