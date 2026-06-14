import { db } from "@/db";
import { apiKey } from "@/db/schema";
import { eq } from "drizzle-orm";

async function sha256hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function validateApiKey(request: Request): Promise<string | null> {
  const raw = request.headers.get("x-api-key");
  if (!raw) return null;

  const hash = await sha256hex(raw);
  const [key] = await db
    .select({ organizationId: apiKey.organizationId, id: apiKey.id })
    .from(apiKey)
    .where(eq(apiKey.keyHash, hash));

  if (!key) return null;

  // Fire-and-forget last used update
  db.update(apiKey).set({ lastUsedAt: new Date() }).where(eq(apiKey.id, key.id)).catch(() => {});

  return key.organizationId;
}

export function apiError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export function generateApiKey(): { raw: string; prefix: string } {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  const raw = "mn_" + Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
  return { raw, prefix: raw.slice(0, 10) };
}

export { sha256hex };
