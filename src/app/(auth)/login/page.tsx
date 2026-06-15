"use client";

import { useState } from "react";
import { MailCheck } from "lucide-react";
import Link from "next/link";

import { signIn } from "@/lib/auth-client";
import { enterDemo } from "@/lib/demo-login";
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

  return (
    <div className="w-full max-w-3xl">
      <div className="overflow-hidden rounded-2xl border border-border shadow-sm">
        <div className="grid md:grid-cols-[1fr_1.15fr]">

          {/* Panel de marca — solo visible en md+ */}
          <div className="hidden flex-col justify-between bg-surface-2 p-8 md:flex lg:p-10">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Manann ERP
            </p>
            <div className="space-y-1.5">
              <p className="font-display text-[1.6rem] font-medium leading-snug tracking-tight text-foreground">
                El sistema conoce la ruta.
              </p>
              <p className="font-display text-[1.6rem] font-medium leading-snug tracking-tight text-primary">
                Tú mantienes el rumbo.
              </p>
            </div>
            <p className="text-xs text-ink-subtle">
              Demo sin fines comerciales · datos simulados
            </p>
          </div>

          {/* Panel del formulario */}
          <div className="bg-card p-8 lg:p-10">
            {status === "sent" ? (
              <div className="flex min-h-[260px] flex-col items-center justify-center gap-4 text-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon icon={MailCheck} />
                </div>
                <div>
                  <h1 className="font-display text-xl font-medium tracking-tight text-foreground">
                    Revisa tu correo
                  </h1>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Enlace enviado a{" "}
                    <span className="font-medium text-foreground">{email}</span>.
                    {" "}Caduca en 5 minutos.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStatus("idle")}
                  className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                >
                  Usar otro correo
                </button>
              </div>
            ) : (
              <>
                <h1 className="font-display text-2xl font-medium tracking-tight text-foreground">
                  Entrar en Manann
                </h1>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Sin contraseñas. Te enviamos un enlace directo de acceso.
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

                <div className="my-5 flex items-center gap-3">
                  <span className="h-px flex-1 bg-border" />
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    o
                  </span>
                  <span className="h-px flex-1 bg-border" />
                </div>

                <form action={enterDemo}>
                  <Button type="submit" variant="secondary" size="lg" className="w-full">
                    Entrar a la demo
                  </Button>
                </form>
                <p className="mt-2 text-center text-[11px] text-muted-foreground">
                  Acceso directo a una cuenta de demostración con datos simulados.
                </p>

                <p className="mt-6 text-center text-xs text-muted-foreground">
                  ¿Primera vez?{" "}
                  <Link
                    href="/contacto"
                    prefetch={false}
                    className="text-foreground underline-offset-2 hover:underline"
                  >
                    Solicita acceso
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
