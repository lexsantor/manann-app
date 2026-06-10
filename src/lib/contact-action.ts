"use server";

import { sendContactEmail } from "@/lib/email";

export type ContactResult = { ok: true } | { ok: false; error: string };

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function sendContactMessage(
  formData: FormData,
): Promise<ContactResult> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const honeypot = String(formData.get("website") ?? ""); // campo trampa

  // Bot: fingimos éxito sin enviar nada.
  if (honeypot) return { ok: true };

  if (!name || !email || !message) {
    return { ok: false, error: "Completa todos los campos." };
  }
  if (!EMAIL_RE.test(email)) {
    return { ok: false, error: "El correo no es válido." };
  }
  if (message.length > 4000) {
    return { ok: false, error: "El mensaje es demasiado largo." };
  }

  try {
    await sendContactEmail({ name, email, message });
    return { ok: true };
  } catch {
    return {
      ok: false,
      error: "No hemos podido enviar el mensaje. Inténtalo más tarde.",
    };
  }
}
