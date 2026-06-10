"use client";

import { useState, useTransition } from "react";
import { MailCheck, AlertCircle } from "lucide-react";

import { sendContactMessage } from "@/lib/contact-action";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icon";

const inputCls =
  "h-11 w-full rounded-md border border-border bg-background px-3.5 text-sm text-foreground placeholder:text-muted-foreground/70 transition-colors focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50";

export function ContactForm() {
  const [pending, start] = useTransition();
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError("");
    start(async () => {
      const res = await sendContactMessage(fd);
      if (res.ok) setDone(true);
      else setError(res.error);
    });
  }

  if (done) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icon icon={MailCheck} />
        </div>
        <h2 className="font-display text-xl font-medium tracking-tight text-foreground">
          Mensaje enviado
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Gracias. Te responderemos a tu correo lo antes posible.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {/* Honeypot anti-bot: invisible para humanos. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="sr-only">
            Nombre
          </label>
          <input
            id="name"
            name="name"
            required
            autoComplete="name"
            placeholder="Tu nombre"
            disabled={pending}
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="email" className="sr-only">
            Correo
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="tu@empresa.com"
            disabled={pending}
            className={inputCls}
          />
        </div>
      </div>

      <label htmlFor="message" className="sr-only">
        Mensaje
      </label>
      <textarea
        id="message"
        name="message"
        required
        rows={5}
        maxLength={4000}
        placeholder="¿En qué podemos ayudarte?"
        disabled={pending}
        className={`${inputCls} h-auto resize-y py-2.5 leading-relaxed`}
      />

      {error && (
        <p className="flex items-center gap-1.5 text-sm text-destructive" role="alert">
          <Icon icon={AlertCircle} size={14} /> {error}
        </p>
      )}

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Enviando…" : "Enviar mensaje"}
      </Button>
    </form>
  );
}
