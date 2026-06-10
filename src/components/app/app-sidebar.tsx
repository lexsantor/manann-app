"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  MapPin,
  Menu,
  X,
  type LucideIcon,
} from "lucide-react";

import { Icon } from "@/components/icon";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogoutButton } from "./logout-button";
import { cn } from "@/lib/utils";

const NAV: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Panel", href: "/dashboard", icon: LayoutDashboard },
  { label: "Expedientes", href: "/expedientes", icon: Package },
];

const SOON: { label: string; icon: LucideIcon }[] = [
  { label: "Tracking", icon: MapPin },
];

interface AppSidebarProps {
  userEmail: string;
  orgName: string;
}

export function AppSidebar({ userEmail, orgName }: AppSidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const Content = (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center px-5">
        <Link
          href="/dashboard"
          onClick={() => setOpen(false)}
          className="font-display text-xl font-medium tracking-tight text-foreground"
        >
          Manann
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {NAV.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              onClick={() => setOpen(false)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-surface-2 font-medium text-foreground"
                  : "text-muted-foreground hover:bg-surface-2/60 hover:text-foreground",
              )}
            >
              <Icon icon={item.icon} size={18} />
              {item.label}
            </Link>
          );
        })}

        {SOON.map((item) => (
          <span
            key={item.label}
            className="flex cursor-default items-center gap-3 rounded-md px-3 py-2 text-sm text-ink-subtle/70"
            title="Disponible en una próxima fase"
          >
            <Icon icon={item.icon} size={18} />
            {item.label}
            <span className="ml-auto rounded-full border border-border px-1.5 py-0.5 font-mono text-[10px] text-ink-subtle">
              pronto
            </span>
          </span>
        ))}
      </nav>

      <div className="border-t border-border p-3">
        <div className="px-2 pb-2">
          <p className="truncate text-sm font-medium text-foreground">{orgName}</p>
          <p className="truncate text-xs text-muted-foreground">{userEmail}</p>
        </div>
        <div className="flex items-center justify-between gap-2 px-1">
          <ThemeToggle />
          <LogoutButton />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop: columna fija */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 border-r border-border bg-background/80 backdrop-blur-md lg:block">
        {Content}
      </aside>

      {/* Móvil: barra superior */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-md lg:hidden">
        <Link
          href="/dashboard"
          className="font-display text-xl font-medium tracking-tight text-foreground"
        >
          Manann
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Abrir menú"
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          <Icon icon={Menu} />
        </button>
      </header>

      {/* Móvil: drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-background/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-64 border-r border-border bg-card">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar menú"
              className="absolute right-3 top-4 text-muted-foreground transition-colors hover:text-foreground"
            >
              <Icon icon={X} />
            </button>
            {Content}
          </aside>
        </div>
      )}
    </>
  );
}
