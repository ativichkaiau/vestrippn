import { handlers } from "@/auth"; // If using '@' alias, otherwise use "../../../../auth"
export const { GET, POST } = handlers;

// This forces the route to use the standard Node.js environment
// which prevents the 'openid-client' crash you saw earlier.
export const runtime = "nodejs";