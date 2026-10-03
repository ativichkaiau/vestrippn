import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Auth error" };

// Auth.js error codes, in plain language. Unknown codes fall back to the
// generic reason and are still shown as-is.
const REASONS: Record<string, string> = {
  AccessDenied: "The account was not allowed to enter.",
  Configuration: "The server's authentication configuration is incomplete.",
  Verification: "The sign-in link has expired or was already used.",
  OAuthAccountNotLinked: "This email is already linked to a different sign-in method.",
};

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string | string[] }>;
}) {
  const { error } = await searchParams;
  const code = (Array.isArray(error) ? error[0] : error) || "AccessDenied";
  const reason = REASONS[code] ?? "The account was not allowed, or the provider did not return a usable email.";

  return (
    <main className="sys-auth" style={{ gridTemplateColumns: "minmax(0, 1fr)" }}>
      <section className="sys-auth-form-area">
        <div className="sys-auth-form">
          <div>
            <p className="sys-label">VESTRIPPN / auth_gate</p>
            <h1>Sign-in failed</h1>
          </div>
          <dl className="sys-meta" data-compact>
            <div>
              <dt>status</dt>
              <dd data-mono>AUTH_REJECTED</dd>
            </div>
            <div>
              <dt>error</dt>
              <dd data-mono>{code.slice(0, 64)}</dd>
            </div>
            <div>
              <dt>reason</dt>
              <dd>{reason}</dd>
            </div>
          </dl>
          <Link href="/auth/signin" className="sys-action" data-variant="primary">
            try again
          </Link>
        </div>
      </section>
    </main>
  );
}
