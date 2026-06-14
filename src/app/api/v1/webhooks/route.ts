import { NextRequest } from "next/server";
import dns from "node:dns/promises";
import net from "node:net";
import { validateApiKey, apiError } from "@/lib/api-auth";
import { db } from "@/db";
import { webhook } from "@/db/schema";
import { eq } from "drizzle-orm";

const VALID_EVENTS = ["shipment.created", "shipment.status_changed", "invoice.issued", "tracking.updated"];

function isPrivateIp(addr: string): boolean {
  if (net.isIPv4(addr)) {
    const [a, b] = addr.split(".").map(Number);
    return (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 100 && b >= 64 && b <= 127) || // CGNAT RFC 6598
      (a === 169 && b === 254) ||            // link-local
      (a === 172 && b >= 16 && b <= 31) ||   // RFC 1918
      (a === 192 && b === 168) ||            // RFC 1918
      a >= 224                                // multicast (224-239) + reserved (240-255)
    );
  }
  if (net.isIPv6(addr)) {
    const n = addr.toLowerCase();
    if (n.startsWith("::ffff:")) {
      const embedded = n.slice(7);
      if (net.isIPv4(embedded)) return isPrivateIp(embedded);
    }
    return (
      n === "::" ||
      n === "::1" ||
      n.startsWith("fc") ||       // ULA
      n.startsWith("fd") ||       // ULA
      n.startsWith("fe80") ||     // link-local
      n.startsWith("2002:") ||    // 6to4
      n.startsWith("64:ff9b:") || // NAT64
      n.startsWith("ff")          // multicast
    );
  }
  return false;
}

async function isAllowedWebhookUrl(raw: string): Promise<{ ok: boolean; reason?: string }> {
  let u: URL;
  try { u = new URL(raw); } catch { return { ok: false, reason: "URL inválida" }; }
  if (u.protocol !== "https:") return { ok: false, reason: "Solo se permiten URLs https" };

  const host = u.hostname.replace(/\.+$/, "").toLowerCase();

  // If already a numeric IP, check directly (blocks decimal/hex/octal bypass attempts)
  if (net.isIP(host)) {
    if (isPrivateIp(host)) return { ok: false, reason: "IPs privadas o reservadas no están permitidas" };
    return { ok: true };
  }

  // Resolve all A/AAAA records and reject if any resolves to a private range
  let records: { address: string; family: number }[];
  try {
    records = await dns.lookup(host, { all: true });
  } catch {
    return { ok: false, reason: "No se pudo resolver el host" };
  }

  for (const { address } of records) {
    if (isPrivateIp(address)) {
      return { ok: false, reason: "El host resuelve a una dirección privada o reservada" };
    }
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

  const urlCheck = await isAllowedWebhookUrl(body.url ?? "");
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
