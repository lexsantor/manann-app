import Link from "next/link";
import { Logo } from "@/components/logo";

const NAV = [
  { name: "Cómo funciona", href: "/como-funciona" },
  { name: "El expediente", href: "/el-expediente" },
  { name: "Nosotros", href: "/nosotros" },
  { name: "Contacto", href: "/contacto" },
];

const LEGAL = [
  { name: "Aviso legal", href: "/legal/aviso-legal" },
  { name: "Privacidad", href: "/legal/privacidad" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface-2">
      <div className="mx-auto flex max-w-[1080px] flex-col gap-10 px-5 py-16 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-sm space-y-3">
            <Link href="/" aria-label="Manann"><Logo className="h-8" /></Link>
            <p className="font-sans text-sm text-ink-subtle">
              El sistema conoce la ruta. Tú mantienes el rumbo. ERP
              transitario con IA documental.
            </p>
          </div>
          {/* Etiqueta de honestidad — neutra a propósito (el ámbar es solo-IA). */}
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3 py-1 font-mono text-xs text-muted-foreground">
            <span className="size-1.5 rounded-full bg-muted-foreground" />
            DEMO · datos simulados
          </span>
        </div>

        <div className="flex flex-col gap-4 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            {NAV.map((i) => (
              <Link
                key={i.href}
                href={i.href}
                prefetch={false}
                className="font-sans text-sm text-muted-foreground transition-opacity hover:opacity-75"
              >
                {i.name}
              </Link>
            ))}
          </nav>
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            {LEGAL.map((i) => (
              <Link
                key={i.href}
                href={i.href}
                prefetch={false}
                className="font-sans text-xs text-ink-subtle transition-opacity hover:opacity-75"
              >
                {i.name}
              </Link>
            ))}
          </nav>
        </div>

        <p className="font-mono text-xs text-ink-subtle">
          © 2026 Manann · Demo sin fines comerciales
        </p>
      </div>
    </footer>
  );
}
