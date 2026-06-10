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
    // eslint-disable-next-line no-console
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
