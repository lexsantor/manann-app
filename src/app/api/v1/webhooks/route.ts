import { NextRequest } from "next/server";
import { validateApiKey, apiError } from "@/lib/api-auth";
import { db } from "@/db";
import { webhook } from "@/db/schema";
import { eq } from "drizzle-orm";

const VALID_EVENTS = ["shipment.created", "shipment.status_changed", "invoice.issued", "tracking.updated"];

// SSRF prevention: block private/loopback/reserved hosts
const BLOCKED_HOST_RE = /^(localhost|.*\.local|.*\.internal|.*\.localdomain)$/i;
const PRIVATE_IP_RE = /^(127\.|10\.|192\.168\.|169\.254\.|0\.0\.0\.0|::1$|fc[0-9a-f]{2}:|fe[89ab][0-9a-f]:)/i;
const RFC1918_172_RE = /^172\.(1[6-9]|2[0-9]|3[01])\./;

function isAllowedWebhookUrl(raw: string): { ok: boolean; reason?: string } {
  let u: URL;
  try { u = new URL(raw); } catch { return { ok: false, reason: "URL inválida" }; }
  if (u.protocol !== "https:") return { ok: false, reason: "Solo se permiten URLs https" };

  const host = u.hostname.replace(/\.+$/, "").toLowerCase();
  if (BLOCKED_HOST_RE.test(host)) return { ok: false, reason: "Host no permitido" };
  if (PRIVATE_IP_RE.test(host) || RFC1918_172_RE.test(host)) {
    return { ok: false, reason: "IPs privadas o de loopback no están permitidas" };
  }

  return { ok: true };
}

function generateSecret(): string {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  return "whsec_" + Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function GET(req: NextRequest) {
  const orgId = await validateApiKey(req);
  if (!orgId) return apiError("API key inválida o ausente", 401);

  const rows = await db
    .select({ id: webhook.id, url: webhook.url, events: webhook.events, active: webhook.active, createdAt: webhook.createdAt })
    .from(webhook)
    .where(eq(webhook.organizationId, orgId));

  return Response.json({ data: rows });
}

export async function POST(req: NextRequest) {
  const orgId = await validateApiKey(req);
  if (!orgId) return apiError("API key inválida o ausente", 401);

  let body: { url?: string; events?: string[] };
  try { body = await req.json(); } catch { return apiError("Body JSON inválido", 400); }

  const urlCheck = isAllowedWebhookUrl(body.url ?? "");
  if (!urlCheck.ok) return apiError(urlCheck.reason ?? "URL inválida", 400);

  if (!Array.isArray(body.events) || body.events.some((e) => !VALID_EVENTS.includes(e))) {
    return apiError(`Eventos válidos: ${VALID_EVENTS.join(", ")}`, 400);
  }

  const [row] = await db.insert(webhook).values({
    organizationId: orgId,
    url: body.url!,
    events: body.events,
    secret: generateSecret(),
  }).returning({ id: webhook.id, secret: webhook.secret });

  return Response.json({ data: row, _note: "Guarda el secret — no se mostrará de nuevo" }, { status: 201 });
}
