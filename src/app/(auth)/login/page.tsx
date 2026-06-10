"use client";

import { useState } from "react";
import { MailCheck } from "lucide-react";

import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icon";

type Status = "idle" | "loading" | "sent" | "error";

const CALLBACK_URL = "/dashboard";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const { error } = await signIn.magicLink({
      email,
      callbackURL: CALLBACK_URL,
    });

    if (error) {
      // No reenviamos error.message del servidor al UI (puede filtrar detalles
      // de Resend/infra). Mensaje genérico, el detalle queda en logs de server.
      setStatus("error");
      setErrorMsg("No hemos podido enviar el enlace. Inténtalo de nuevo.");
      return;
    }

    setStatus("sent");
  }

  if (status === "sent") {
    return (
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icon icon={MailCheck} />
        </div>
        <h1 className="font-display text-2xl font-medium tracking-tight text-foreground">
          Revisa tu correo
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Te hemos enviado un enlace de acceso a{" "}
          <span className="font-medium text-foreground">{email}</span>. Caduca en
          5 minutos.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-6 text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          Usar otro correo
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="font-display text-2xl font-medium tracking-tight text-foreground">
        Entrar en Manann
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Sin contraseñas. Introduce tu correo y te enviamos un enlace de acceso.
      </p>

      <form onSubmit={handleSubmit} className="mt-7 space-y-3">
        <label htmlFor="email" className="sr-only">
          Correo electrónico
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@empresa.com"
          disabled={status === "loading"}
          className="h-11 w-full rounded-md border border-border bg-background px-3.5 text-sm text-foreground placeholder:text-muted-foreground/70 transition-colors focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50"
        />

        {status === "error" && (
          <p className="text-sm text-destructive" role="alert">
            {errorMsg}
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={status === "loading"}
        >
          {status === "loading" ? "Enviando…" : "Enviar enlace de acceso"}
        </Button>
      </form>
    </div>
  );
}
