"use client";

import Link from "next/link";
import { Logo } from "@/components/logo";
import { useState } from "react";
import { Menu, X } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Icon } from "@/components/icon";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LINKS = [
  { label: "Cómo funciona", href: "/como-funciona" },
  { label: "El expediente", href: "/el-expediente" },
  { label: "Precios", href: "/precios" },
  { label: "Nosotros", href: "/nosotros" },
];

export function TopNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1080px] items-center justify-between px-5 sm:px-6">
        <Link href="/" aria-label="Manann — inicio"><Logo /></Link>

        <nav aria-label="Principal" className="hidden items-center gap-7 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              prefetch={false}
              className="font-sans text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <ThemeToggle />
          <Link
            href="/login"
            prefetch={false}
            className={cn(
              buttonVariants({ variant: "secondary", size: "sm" }),
              "hidden sm:inline-flex",
            )}
          >
            Entrar
          </Link>
          <Link
            href="/#demo"
            className={cn(
              buttonVariants({ variant: "primary", size: "sm" }),
              "rounded-full px-4 max-sm:hidden",
            )}
          >
            Ver la demo
          </Link>
          <button
            type="button"
            className="text-muted-foreground transition-colors hover:text-foreground md:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Menú"
            aria-expanded={open}
          >
            <Icon icon={open ? X : Menu} />
          </button>
        </div>
      </div>

      {open && (
        <nav aria-label="Navegación móvil" className="border-t border-border bg-background px-5 py-3 md:hidden">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block py-2.5 font-sans text-sm text-foreground"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/login"
            prefetch={false}
            onClick={() => setOpen(false)}
            className="block py-2.5 font-sans text-sm font-medium text-primary"
          >
            Entrar
          </Link>
        </nav>
      )}
    </header>
  );
}
