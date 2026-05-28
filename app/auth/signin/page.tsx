import type { Metadata } from "next";
import SignInClient from "./SignInClient";

export const metadata: Metadata = { title: "Sign in · VESTRIPPN" };

export default function SignInPage() {
  return <SignInClient />;
}

