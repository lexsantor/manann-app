// Envío de correo vía Resend. Único punto de salida de email de la app.
import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const from = process.env.EMAIL_FROM ?? "Manann <onboarding@resend.dev>";

// Colores de marca para el HTML del email (no puede consumir tokens CSS).
const BRAND_GREEN = "#137a63";
const INK = "#1a1a1a";
const INK_MUTED = "#555";
const INK_FAINT = "#999";

// Cliente perezoso: si falta la key, no reventamos el import (build/preview
// sin secreto siguen compilando); fallamos en el momento del envío.
const resend = apiKey ? new Resend(apiKey) : null;

interface SendMagicLinkEmailParams {
  to: string;
  url: string;
}

export async function sendMagicLinkEmail({
  to,
  url,
}: SendMagicLinkEmailParams): Promise<void> {
  // Defensa: solo incrustamos URLs http(s). Aunque la genera Better Auth (no el
  // usuario), evita que un esquema raro (javascript:) acabe en el href del email.
  if (!/^https?:\/\//i.test(url)) {
    throw new Error("URL de magic link inválida");
  }

  // Fallback de desarrollo: imprime el enlace para poder probar sin entrega real
  // (Resend sin dominio verificado solo entrega al email de la cuenta).
  if (process.env.NODE_ENV !== "production") {
    console.log(`\n[dev] Magic link para ${to}:\n${url}\n`);
  }

  if (!resend) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("RESEND_API_KEY no está configurada");
    }
    return; // en dev, el log de arriba basta para probar
  }

  const { error } = await resend.emails.send({
    from,
    to,
    subject: "Tu acceso a Manann",
    text: `Entra en Manann con este enlace (caduca en 5 minutos):\n\n${url}\n\nSi no lo has solicitado, ignora este correo.`,
    html: magicLinkHtml(url),
  });

  if (error) {
    throw new Error(`Resend no pudo enviar el magic link: ${error.message}`);
  }
}

// Destinatario interno de los mensajes del formulario de contacto.
const CONTACT_TO = "lexsantor@gmail.com";

interface SendContactEmailParams {
  name: string;
  email: string;
  message: string;
}

export async function sendContactEmail({
  name,
  email,
  message,
}: SendContactEmailParams): Promise<void> {
  if (process.env.NODE_ENV !== "production") {
    console.log(`\n[dev] Contacto de ${name} <${email}>:\n${message}\n`);
  }
  if (!resend) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("RESEND_API_KEY no está configurada");
    }
    return;
  }

  const { error } = await resend.emails.send({
    from,
    to: CONTACT_TO,
    replyTo: email,
    subject: `Contacto Manann — ${name}`,
    text: `De: ${name} <${email}>\n\n${message}`,
  });

  if (error) {
    throw new Error(`Resend no pudo enviar el mensaje: ${error.message}`);
  }
}

// ─── Bienvenida ──────────────────────────────────────────────────────────────

export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  if (process.env.NODE_ENV !== "production") {
    console.log(`\n[dev] Bienvenida → ${to} (${name})\n`);
  }
  if (!resend) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("RESEND_API_KEY no está configurada");
    }
    return;
  }

  const { error } = await resend.emails.send({
    from,
    to,
    subject: "Bienvenido a Manann",
    text: [
      `Hola ${name},`,
      "",
      "Ya tienes acceso a Manann.",
      "",
      "Para empezar, arrastra un Bill of Lading (BL), AWB o CMR a cualquier expediente.",
      "La IA rellena los campos en segundos — tú solo confirmas.",
      "",
      "Si tienes dudas, el tour interactivo en el dashboard te guía en 2 minutos.",
      "",
      "— El equipo de Manann",
    ].join("\n"),
    html: welcomeHtml(name),
  });

  if (error) throw new Error(`Resend no pudo enviar la bienvenida: ${error.message}`);
}

function welcomeHtml(name: string): string {
  return `
    <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:${INK}">
      <div style="margin-bottom:28px">
        <span style="font-size:15px;font-weight:700;color:${BRAND_GREEN};letter-spacing:-0.3px">Manann</span>
      </div>
      <h1 style="font-size:22px;font-weight:700;margin:0 0 8px;letter-spacing:-0.4px">
        Hola, ${esc(name)}
      </h1>
      <p style="font-size:14px;line-height:1.65;color:${INK_MUTED};margin:0 0 24px">
        Ya tienes acceso a Manann. Aquí va lo único que necesitas saber para empezar:
      </p>

      <div style="background:#f6faf8;border-left:3px solid ${BRAND_GREEN};border-radius:0 8px 8px 0;padding:16px 20px;margin-bottom:24px">
        <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:${INK}">El momento clave</p>
        <p style="margin:0;font-size:13px;line-height:1.6;color:${INK_MUTED}">
          Arrastra un BL, AWB o CMR a cualquier expediente.<br>
          La IA rellena los campos en segundos. Tú solo confirmas.
        </p>
      </div>

      <p style="font-size:13px;line-height:1.6;color:${INK_MUTED};margin:0 0 24px">
        Si quieres una guía rápida, activa el tour interactivo desde el dashboard.
        En 2 minutos verás todo lo que Manann puede hacer.
      </p>

      <p style="margin:0;font-size:12px;color:${INK_FAINT};border-top:1px solid #f0f0f0;padding-top:16px">
        Manann ERP · Para transitarios que prefieren confirmar a teclear
      </p>
    </div>
  `;
}

// ─── Factura ─────────────────────────────────────────────────────────────────

interface InvoiceLine {
  concept: string;
  quantity: string;
  unitPrice: string;
  subtotal: string;
}

interface SendInvoiceEmailParams {
  to: string;
  orgName: string;
  reference: string;
  clientName: string;
  issueDate: string;
  dueDate?: string | null;
  lines: InvoiceLine[];
  subtotal: string;
  taxRate: string;
  total: string;
  currency: string;
  notes?: string | null;
}

export async function sendInvoiceEmail(params: SendInvoiceEmailParams): Promise<void> {
  if (process.env.NODE_ENV !== "production") {
    console.log(`\n[dev] Factura ${params.reference} → ${params.to}\n`);
  }
  if (!resend) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("RESEND_API_KEY no está configurada");
    }
    return;
  }

  const taxAmount = (Number(params.total) - Number(params.subtotal)).toFixed(2);
  const fmt = (n: string) =>
    new Intl.NumberFormat("es-ES", { style: "currency", currency: params.currency }).format(Number(n));

  const { error } = await resend.emails.send({
    from,
    to: params.to,
    subject: `Factura ${params.reference} de ${params.orgName}`,
    text: [
      `Factura: ${params.reference}`,
      `De: ${params.orgName}`,
      `Para: ${params.clientName}`,
      `Emisión: ${params.issueDate}`,
      params.dueDate ? `Vencimiento: ${params.dueDate}` : "",
      "",
      ...params.lines.map((l) => `${l.concept}  ${l.quantity} × ${fmt(l.unitPrice)}  ${fmt(l.subtotal)}`),
      "",
      `Base imponible: ${fmt(params.subtotal)}`,
      `IVA ${params.taxRate}%: ${fmt(taxAmount)}`,
      `Total: ${fmt(params.total)}`,
      params.notes ? `\nNotas: ${params.notes}` : "",
    ].filter(Boolean).join("\n"),
    html: invoiceHtml({ ...params, taxAmount, fmt }),
  });

  if (error) throw new Error(`Resend no pudo enviar la factura: ${error.message}`);
}

const ESC_MAP: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const esc = (s: string | null | undefined) => String(s ?? "").replace(/[&<>"']/g, (c) => ESC_MAP[c] ?? c);

function invoiceHtml({
  orgName,
  reference,
  clientName,
  issueDate,
  dueDate,
  lines,
  subtotal,
  taxRate,
  total,
  taxAmount,
  notes,
  fmt,
}: SendInvoiceEmailParams & { taxAmount: string; fmt: (n: string) => string }): string {
  const linesRows = lines.map((l) => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #e8e8e8;font-size:13px;color:${INK}">${esc(l.concept)}</td>
      <td style="padding:8px 0;border-bottom:1px solid #e8e8e8;font-size:13px;color:${INK_MUTED};text-align:right">${esc(l.quantity)}</td>
      <td style="padding:8px 0;border-bottom:1px solid #e8e8e8;font-size:13px;color:${INK_MUTED};text-align:right">${fmt(l.unitPrice)}</td>
      <td style="padding:8px 0;border-bottom:1px solid #e8e8e8;font-size:13px;color:${INK};text-align:right;font-weight:600">${fmt(l.subtotal)}</td>
    </tr>
  `).join("");

  return `
    <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;max-width:600px;margin:0 auto;background:#fff;color:${INK}">
      <!-- Header -->
      <div style="background:#0d1117;padding:28px 32px;border-radius:12px 12px 0 0">
        <table style="width:100%;border-collapse:collapse">
          <tr>
            <td>
              <span style="font-size:16px;font-weight:700;color:#fff;letter-spacing:-0.3px">${esc(orgName)}</span>
            </td>
            <td style="text-align:right">
              <span style="font-size:11px;font-family:monospace;color:#6b7280;text-transform:uppercase;letter-spacing:0.12em">Factura</span><br>
              <span style="font-size:20px;font-weight:700;color:#fff;font-family:monospace">${esc(reference)}</span>
            </td>
          </tr>
        </table>
      </div>

      <!-- Body -->
      <div style="padding:28px 32px;border:1px solid #e8e8e8;border-top:none;border-radius:0 0 12px 12px">

        <!-- Cliente + fechas -->
        <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
          <tr>
            <td style="vertical-align:top;width:50%">
              <p style="margin:0 0 4px;font-size:10px;font-family:monospace;text-transform:uppercase;letter-spacing:0.12em;color:${INK_FAINT}">Facturado a</p>
              <p style="margin:0;font-size:14px;font-weight:600;color:${INK}">${esc(clientName)}</p>
            </td>
            <td style="vertical-align:top;text-align:right">
              <p style="margin:0 0 4px;font-size:10px;font-family:monospace;text-transform:uppercase;letter-spacing:0.12em;color:${INK_FAINT}">Fecha de emisión</p>
              <p style="margin:0 0 8px;font-size:13px;font-family:monospace;color:${INK}">${esc(issueDate)}</p>
              ${dueDate ? `<p style="margin:0 0 4px;font-size:10px;font-family:monospace;text-transform:uppercase;letter-spacing:0.12em;color:${INK_FAINT}">Vencimiento</p><p style="margin:0;font-size:13px;font-family:monospace;color:${INK}">${esc(dueDate)}</p>` : ""}
            </td>
          </tr>
        </table>

        <!-- Líneas -->
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
          <thead>
            <tr>
              <th style="padding:6px 0;border-bottom:2px solid #e8e8e8;font-size:10px;font-family:monospace;text-transform:uppercase;letter-spacing:0.1em;color:${INK_FAINT};text-align:left;font-weight:600">Concepto</th>
              <th style="padding:6px 0;border-bottom:2px solid #e8e8e8;font-size:10px;font-family:monospace;text-transform:uppercase;letter-spacing:0.1em;color:${INK_FAINT};text-align:right;font-weight:600">Cant.</th>
              <th style="padding:6px 0;border-bottom:2px solid #e8e8e8;font-size:10px;font-family:monospace;text-transform:uppercase;letter-spacing:0.1em;color:${INK_FAINT};text-align:right;font-weight:600">Precio</th>
              <th style="padding:6px 0;border-bottom:2px solid #e8e8e8;font-size:10px;font-family:monospace;text-transform:uppercase;letter-spacing:0.1em;color:${INK_FAINT};text-align:right;font-weight:600">Subtotal</th>
            </tr>
          </thead>
          <tbody>${linesRows}</tbody>
        </table>

        <!-- Totales -->
        <div style="display:flex;justify-content:flex-end;margin-bottom:24px">
          <table style="border-collapse:collapse;min-width:220px">
            <tr>
              <td style="padding:4px 0;font-size:13px;color:${INK_MUTED}">Base imponible</td>
              <td style="padding:4px 0;font-size:13px;color:${INK_MUTED};text-align:right;font-family:monospace;padding-left:24px">${fmt(subtotal)}</td>
            </tr>
            <tr>
              <td style="padding:4px 0;font-size:13px;color:${INK_MUTED}">IVA ${esc(taxRate)}%</td>
              <td style="padding:4px 0;font-size:13px;color:${INK_MUTED};text-align:right;font-family:monospace;padding-left:24px">${fmt(taxAmount)}</td>
            </tr>
            <tr style="border-top:2px solid #e8e8e8">
              <td style="padding:8px 0 0;font-size:15px;font-weight:700;color:${INK}">Total</td>
              <td style="padding:8px 0 0;font-size:15px;font-weight:700;color:${BRAND_GREEN};text-align:right;font-family:monospace;padding-left:24px">${fmt(total)}</td>
            </tr>
          </table>
        </div>

        ${notes ? `<div style="background:#f8f9fa;border-radius:8px;padding:14px 16px;margin-bottom:20px"><p style="margin:0 0 4px;font-size:10px;font-family:monospace;text-transform:uppercase;letter-spacing:0.1em;color:${INK_FAINT}">Notas</p><p style="margin:0;font-size:13px;color:${INK_MUTED}">${esc(notes)}</p></div>` : ""}

        <!-- Footer -->
        <p style="margin:0;font-size:11px;color:${INK_FAINT};text-align:center;border-top:1px solid #f0f0f0;padding-top:16px">
          ${esc(orgName)} · ${esc(reference)} · Generado con Manann ERP
        </p>
      </div>
    </div>
  `;
}

// ─── Cotización ──────────────────────────────────────────────────────────────

interface QuotationLine {
  concept: string;
  quantity: string;
  unitPrice: string;
  subtotal: string;
}

interface SendQuotationEmailParams {
  to: string;
  orgName: string;
  reference: string;
  clientName: string;
  validUntil?: string | null;
  lines: QuotationLine[];
  subtotal: string;
  taxRate: string;
  total: string;
  currency: string;
  notes?: string | null;
}

export async function sendQuotationEmail(params: SendQuotationEmailParams): Promise<void> {
  if (process.env.NODE_ENV !== "production") {
    console.log(`\n[dev] Cotización ${params.reference} → ${params.to}\n`);
  }
  if (!resend) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("RESEND_API_KEY no está configurada");
    }
    return;
  }

  const taxAmount = (Number(params.total) - Number(params.subtotal)).toFixed(2);
  const fmt = (n: string) =>
    new Intl.NumberFormat("es-ES", { style: "currency", currency: params.currency }).format(Number(n));

  const { error } = await resend.emails.send({
    from,
    to: params.to,
    subject: `Cotización ${params.reference} de ${params.orgName}`,
    text: [
      `Cotización: ${params.reference}`,
      `De: ${params.orgName}`,
      `Para: ${params.clientName}`,
      params.validUntil ? `Válida hasta: ${params.validUntil}` : "",
      "",
      ...params.lines.map((l) => `${l.concept}  ${l.quantity} × ${fmt(l.unitPrice)}  ${fmt(l.subtotal)}`),
      "",
      `Base imponible: ${fmt(params.subtotal)}`,
      `IVA ${params.taxRate}%: ${fmt(taxAmount)}`,
      `Total: ${fmt(params.total)}`,
      params.notes ? `\nNotas: ${params.notes}` : "",
    ].filter(Boolean).join("\n"),
    html: quotationHtml({ ...params, taxAmount, fmt }),
  });

  if (error) throw new Error(`Resend no pudo enviar la cotización: ${error.message}`);
}

function quotationHtml({
  orgName,
  reference,
  clientName,
  validUntil,
  lines,
  subtotal,
  taxRate,
  total,
  taxAmount,
  notes,
  fmt,
}: SendQuotationEmailParams & { taxAmount: string; fmt: (n: string) => string }): string {
  const linesRows = lines.map((l) => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #e8e8e8;font-size:13px;color:${INK}">${esc(l.concept)}</td>
      <td style="padding:8px 0;border-bottom:1px solid #e8e8e8;font-size:13px;color:${INK_MUTED};text-align:right">${esc(l.quantity)}</td>
      <td style="padding:8px 0;border-bottom:1px solid #e8e8e8;font-size:13px;color:${INK_MUTED};text-align:right">${fmt(l.unitPrice)}</td>
      <td style="padding:8px 0;border-bottom:1px solid #e8e8e8;font-size:13px;color:${INK};text-align:right;font-weight:600">${fmt(l.subtotal)}</td>
    </tr>
  `).join("");

  return `
    <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;max-width:600px;margin:0 auto;background:#fff;color:${INK}">
      <div style="background:#0d1117;padding:28px 32px;border-radius:12px 12px 0 0">
        <table style="width:100%;border-collapse:collapse">
          <tr>
            <td><span style="font-size:16px;font-weight:700;color:#fff;letter-spacing:-0.3px">${esc(orgName)}</span></td>
            <td style="text-align:right">
              <span style="font-size:11px;font-family:monospace;color:#6b7280;text-transform:uppercase;letter-spacing:0.12em">Cotización</span><br>
              <span style="font-size:20px;font-weight:700;color:#fff;font-family:monospace">${esc(reference)}</span>
            </td>
          </tr>
        </table>
      </div>
      <div style="padding:28px 32px;border:1px solid #e8e8e8;border-top:none;border-radius:0 0 12px 12px">
        <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
          <tr>
            <td style="vertical-align:top;width:50%">
              <p style="margin:0 0 4px;font-size:10px;font-family:monospace;text-transform:uppercase;letter-spacing:0.12em;color:${INK_FAINT}">Dirigido a</p>
              <p style="margin:0;font-size:14px;font-weight:600;color:${INK}">${esc(clientName)}</p>
            </td>
            <td style="vertical-align:top;text-align:right">
              ${validUntil ? `<p style="margin:0 0 4px;font-size:10px;font-family:monospace;text-transform:uppercase;letter-spacing:0.12em;color:${INK_FAINT}">Válida hasta</p><p style="margin:0 0 8px;font-size:13px;font-family:monospace;color:${INK}">${esc(validUntil)}</p>` : ""}
            </td>
          </tr>
        </table>
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
          <thead>
            <tr>
              <th style="padding:6px 0;border-bottom:2px solid #e8e8e8;font-size:10px;font-family:monospace;text-transform:uppercase;letter-spacing:0.1em;color:${INK_FAINT};text-align:left;font-weight:600">Concepto</th>
              <th style="padding:6px 0;border-bottom:2px solid #e8e8e8;font-size:10px;font-family:monospace;text-transform:uppercase;letter-spacing:0.1em;color:${INK_FAINT};text-align:right;font-weight:600">Cant.</th>
              <th style="padding:6px 0;border-bottom:2px solid #e8e8e8;font-size:10px;font-family:monospace;text-transform:uppercase;letter-spacing:0.1em;color:${INK_FAINT};text-align:right;font-weight:600">Precio</th>
              <th style="padding:6px 0;border-bottom:2px solid #e8e8e8;font-size:10px;font-family:monospace;text-transform:uppercase;letter-spacing:0.1em;color:${INK_FAINT};text-align:right;font-weight:600">Subtotal</th>
            </tr>
          </thead>
          <tbody>${linesRows}</tbody>
        </table>
        <div style="display:flex;justify-content:flex-end;margin-bottom:24px">
          <table style="border-collapse:collapse;min-width:220px">
            <tr>
              <td style="padding:4px 0;font-size:13px;color:${INK_MUTED}">Base imponible</td>
              <td style="padding:4px 0;font-size:13px;color:${INK_MUTED};text-align:right;font-family:monospace;padding-left:24px">${fmt(subtotal)}</td>
            </tr>
            <tr>
              <td style="padding:4px 0;font-size:13px;color:${INK_MUTED}">IVA ${esc(taxRate)}%</td>
              <td style="padding:4px 0;font-size:13px;color:${INK_MUTED};text-align:right;font-family:monospace;padding-left:24px">${fmt(taxAmount)}</td>
            </tr>
            <tr style="border-top:2px solid #e8e8e8">
              <td style="padding:8px 0 0;font-size:15px;font-weight:700;color:${INK}">Total estimado</td>
              <td style="padding:8px 0 0;font-size:15px;font-weight:700;color:${BRAND_GREEN};text-align:right;font-family:monospace;padding-left:24px">${fmt(total)}</td>
            </tr>
          </table>
        </div>
        ${notes ? `<div style="background:#f8f9fa;border-radius:8px;padding:14px 16px;margin-bottom:20px"><p style="margin:0 0 4px;font-size:10px;font-family:monospace;text-transform:uppercase;letter-spacing:0.1em;color:${INK_FAINT}">Notas</p><p style="margin:0;font-size:13px;color:${INK_MUTED}">${esc(notes)}</p></div>` : ""}
        <p style="margin:0;font-size:11px;color:${INK_FAINT};text-align:center;border-top:1px solid #f0f0f0;padding-top:16px">
          ${esc(orgName)} · ${esc(reference)} · Generado con Manann ERP
        </p>
      </div>
    </div>
  `;
}

function magicLinkHtml(url: string): string {
  return `
    <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:${INK}">
      <h1 style="font-size:20px;font-weight:600;margin:0 0 8px">Acceso a Manann</h1>
      <p style="font-size:14px;line-height:1.6;color:${INK_MUTED};margin:0 0 24px">
        Pulsa el botón para entrar. El enlace caduca en 5 minutos.
      </p>
      <a href="${url}"
         style="display:inline-block;background:${BRAND_GREEN};color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 20px;border-radius:10px">
        Entrar en Manann
      </a>
      <p style="font-size:12px;line-height:1.6;color:${INK_FAINT};margin:24px 0 0">
        Si no has solicitado este acceso, ignora este correo.
      </p>
    </div>
  `;
}
