// Resumen ejecutivo IA del expediente — 3.2.
import { generateText } from "ai";
import { google } from "@ai-sdk/google";

const SYSTEM_PROMPT =
  "Eres un jefe de tráfico senior de un transitario español. " +
  "Resume este expediente en un único párrafo de máximo 120 palabras, en español de España. " +
  "Estructura: situación actual → riesgo principal si lo hay (ETA vencida, documentos faltantes, discrepancias) → próximo hito. " +
  "Usa SOLO los datos proporcionados; si un dato no está, no lo menciones. " +
  "Tono sobrio, sin exclamaciones.";

export interface ShipmentContext {
  reference: string;
  status: string;
  pol?: string | null;
  pod?: string | null;
  carrier?: string | null;
  vessel?: string | null;
  blNumber?: string | null;
  incoterm?: string | null;
  etd?: string | null;
  eta?: string | null;
  priority: string;
  parties?: { role: string; name: string }[];
  containers?: { containerNumber: string; isoType?: string | null }[];
  cargoLines?: { description: string; packages?: number | null; grossWeightKg?: number | null }[];
  trackingEvents?: { type: string; location?: string | null; description?: string | null; occurredAt: string }[];
  charges?: { type: string; amount: string; currency: string }[];
  notes?: string | null;
}

function hasEnoughData(ctx: ShipmentContext): boolean {
  const substantive = [
    ctx.pol, ctx.pod, ctx.carrier, ctx.blNumber, ctx.eta,
    ctx.parties?.length, ctx.cargoLines?.length, ctx.trackingEvents?.length,
  ].filter(Boolean);
  return substantive.length >= 3;
}

export function buildContext(ctx: ShipmentContext): string {
  const lines: string[] = [`Expediente: ${ctx.reference}`, `Estado: ${ctx.status}`, `Prioridad: ${ctx.priority}`];
  if (ctx.pol) lines.push(`POL: ${ctx.pol}`);
  if (ctx.pod) lines.push(`POD: ${ctx.pod}`);
  if (ctx.carrier) lines.push(`Naviera: ${ctx.carrier}`);
  if (ctx.vessel) lines.push(`Buque: ${ctx.vessel}`);
  if (ctx.blNumber) lines.push(`BL: ${ctx.blNumber}`);
  if (ctx.incoterm) lines.push(`Incoterm: ${ctx.incoterm}`);
  if (ctx.etd) lines.push(`ETD: ${ctx.etd}`);
  if (ctx.eta) lines.push(`ETA: ${ctx.eta}`);
  if (ctx.parties?.length) {
    lines.push("Partes: " + ctx.parties.map((p) => `${p.role}: ${p.name}`).join("; "));
  }
  if (ctx.containers?.length) {
    lines.push("Contenedores: " + ctx.containers.map((c) => `${c.containerNumber}${c.isoType ? ` (${c.isoType})` : ""}`).join(", "));
  }
  if (ctx.cargoLines?.length) {
    lines.push(
      "Mercancía: " +
        ctx.cargoLines
          .map((l) => `${l.description}${l.packages ? ` x${l.packages}` : ""}${l.grossWeightKg ? ` ${l.grossWeightKg}kg` : ""}`)
          .join("; "),
    );
  }
  if (ctx.trackingEvents?.length) {
    const recent = ctx.trackingEvents.slice(-5);
    lines.push("Últimos eventos: " + recent.map((e) => `${e.occurredAt} ${e.type}${e.location ? ` ${e.location}` : ""}${e.description ? ` — ${e.description}` : ""}`).join("; "));
  }
  if (ctx.charges?.length) {
    const total = ctx.charges.reduce((s, c) => s + parseFloat(c.amount), 0);
    lines.push(`Cargos totales: ${total.toFixed(2)} EUR`);
  }
  if (ctx.notes) lines.push(`Notas: ${ctx.notes}`);
  return lines.join("\n");
}

export async function generateSummary(ctx: ShipmentContext): Promise<string | null> {
  if (!hasEnoughData(ctx)) return null;

  const { text } = await generateText({
    model: google("gemini-2.0-flash"),
    system: SYSTEM_PROMPT,
    prompt: buildContext(ctx),
    maxOutputTokens: 250,
  });

  // Sanity check: rechaza respuesta que mencione puertos/navieras no presentes en el contexto
  const contextText = buildContext(ctx).toLowerCase();
  const suspiciousWords = text
    .split(/\s+/)
    .filter((w) => w.length > 5 && /^[A-Z]/.test(w))
    .filter((w) => !contextText.includes(w.toLowerCase()));
  if (suspiciousWords.length > 5) return null; // demasiados términos ajenos al contexto

  return text.trim();
}
