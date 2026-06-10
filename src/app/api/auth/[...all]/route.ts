// Endpoint catch-all de Better Auth (sign-in, callback magic-link, sesión, etc.).
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
