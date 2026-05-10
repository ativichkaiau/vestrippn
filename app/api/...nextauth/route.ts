// export const runtime = "nodejs";

// import { handlers } from "@/auth"; // Use "../../../../auth" if @ alias isn't set
// export const { GET, POST } = handlers;
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Auth folder is reachable" });
}