"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  CalendarDays,
  Building2,
  FolderOpen,
  Receipt,
  Tag,
  Satellite,
  FileCheck2,
  FileText,
  BarChart3,
  Zap,
  Plug,
  CreditCard,
  Settings,
  type LucideIcon,
} from "lucide-react";

import { Icon } from "@/components/icon";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogoutButton } from "./logout-button";
import { NotificationsBell } from "./notifications-bell";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href?: string;
  icon: LucideIcon;
  soon?: boolean;
}

interface NavGroup {
  section: string | null;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    section: null,
    items: [
      { label: "General", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    section: "Operaciones",
    items: [
      { label: "Expedientes", href: "/expedientes", icon: Package },
      { label: "Calendario", href: "/calendar", icon: CalendarDays },
      { label: "Documentos", href: "/documentos", icon: FolderOpen },
      { label: "Aduanas", icon: FileCheck2, soon: true },
      { label: "Tracking", icon: Satellite, soon: true },
    ],
  },
  {
    section: "Comercial",
    items: [
      { label: "Contactos", href: "/contactos", icon: Building2 },
      { label: "Cotizaciones", href: "/cotizaciones", icon: FileText },
    ],
  },
  {
    section: "Finanzas",
    items: [
      { label: "Facturación", href: "/facturas", icon: Receipt },
      { label: "Gastos", icon: CreditCard, soon: true },
      { label: "Tarifas", href: "/tarifas", icon: Tag },
    ],
  },
  {
    section: "Análisis",
    items: [
      { label: "Reportes", icon: BarChart3, soon: true },
      { label: "Automatizaciones", icon: Zap, soon: true },
    ],
  },
];

const BOTTOM_NAV: NavItem[] = [
  { label: "Integraciones", icon: Plug, soon: true },
  { label: "Configuración", icon: Settings, soon: true },
];

interface AppSidebarProps {
  userEmail: string;
  orgName: string;
}

export function AppSidebar({ userEmail, orgName }: AppSidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href?: string) =>
    !!href && (pathname === href || pathname.startsWith(`${href}/`));

  const Content = (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center px-5">
        <Link
          href="/dashboard"
          onClick={() => setOpen(false)}
          aria-label="Manann"
        >
          <Logo className="h-7" />
        </Link>
      </div>

      <nav aria-label="Navegación principal" className="flex-1 overflow-y-auto px-3 py-2">
        {NAV_GROUPS.map((group, gi) => (
          <div key={gi} className={cn(gi > 0 ? "mt-4" : "")}>
            {group.section && (
              <p className="mb-1 px-3 font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground/40">
                {group.section}
              </p>
            )}
            {group.items.map((item) => {
              const active = isActive(item.href);
              if (item.soon || !item.href) {
                return (
                  <span
                    key={item.label}
                    className="flex cursor-default items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground/40"
                    title="Disponible en una próxima fase"
                  >
                    <Icon icon={item.icon} size={16} />
                    {item.label}
                    <span className="ml-auto rounded border border-border/50 px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground/40">
                      pronto
                    </span>
                  </span>
                );
              }
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={false}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors duration-150",
                    active
                      ? "bg-primary/10 font-medium text-foreground shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.2)]"
                      : "text-muted-foreground hover:bg-surface-2 hover:text-foreground",
                  )}
                >
                  <Icon icon={item.icon} size={16} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}

        <NotificationsBell />
      </nav>

      <div className="border-t border-border">
        {/* Bottom utilities */}
        <div className="px-3 pt-2 pb-1">
          {BOTTOM_NAV.map((item) => (
            <span
              key={item.label}
              className="flex cursor-default items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground/40"
              title="Disponible en una próxima fase"
            >
              <Icon icon={item.icon} size={16} />
              {item.label}
              <span className="ml-auto rounded border border-border/50 px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground/40">
                pronto
              </span>
            </span>
          ))}
        </div>

        <div className="px-3 pb-3">
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
    </div>
  );

  return (
    <>
      {/* Desktop: columna fija */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 border-r border-border bg-background/80 backdrop-blur-md lg:block">
        {Content}
      </aside>

      {/* Móvil: barra superior */}
      <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-md lg:hidden">
        <Link href="/dashboard" aria-label="Manann" onClick={() => setOpen(false)}>
          <Logo />
        </Link>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
          className="relative h-8 w-8 text-muted-foreground transition-colors hover:text-foreground"
        >
          <span
            className={cn(
              "absolute left-1/2 top-1/2 block h-0.5 w-[18px] -translate-x-1/2 rounded-full bg-current transition-all duration-200 ease-out",
              open ? "-translate-y-px rotate-45" : "-translate-y-[6px]",
            )}
          />
          <span
            className={cn(
              "absolute left-1/2 top-1/2 block h-0.5 w-[18px] -translate-x-1/2 -translate-y-px rounded-full bg-current transition-all duration-200 ease-out",
              open ? "scale-x-0 opacity-0" : "scale-x-100 opacity-100",
            )}
          />
          <span
            className={cn(
              "absolute left-1/2 top-1/2 block h-0.5 w-[18px] -translate-x-1/2 rounded-full bg-current transition-all duration-200 ease-out",
              open ? "-translate-y-px -rotate-45" : "translate-y-[4px]",
            )}
          />
        </button>
      </header>

      {/* Móvil: drawer */}
      <div
        aria-hidden={!open}
        className={cn(
          "fixed inset-x-0 bottom-0 top-14 z-40 lg:hidden",
          open ? "pointer-events-auto visible" : "pointer-events-none invisible",
        )}
      >
        <div
          className={cn(
            "absolute inset-0 bg-background/70 backdrop-blur-sm transition-opacity duration-300 ease-out",
            open ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setOpen(false)}
        />
        <aside
          className={cn(
            "absolute inset-y-0 left-0 w-64 border-r border-border bg-card transition-transform duration-300 ease-out",
            open ? "translate-x-0" : "-translate-x-full",
          )}
        >
          {Content}
        </aside>
      </div>
    </>
  );
}
