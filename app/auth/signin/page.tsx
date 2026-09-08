import type { Metadata } from "next";
import SignInClient from "./SignInClient";

export const metadata: Metadata = { title: "Sign in · VESTRIPPN" };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string | string[] }>;
}) {
  const { callbackUrl } = await searchParams;
  const destination = Array.isArray(callbackUrl) ? callbackUrl[0] : callbackUrl;

  return <SignInClient callbackUrl={destination || "/"} />;
}
