"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  CalendarDays,
  Building2,
  TrendingUp,
  FolderOpen,
  Receipt,
  Tag,
  FileCheck2,
  FileText,
  BarChart3,
  Zap,
  Sunrise,
  Plug,
  CreditCard,
  Settings,
  Map,
  ShieldAlert,
  BookOpen,
  Handshake,
  ChevronDown,
  Anchor,
  Plane,
  Globe,
  DollarSign,
  Hash,
  Database,
  Train,
  Layers,
  FileStack,
  Truck,
  Route,
  AlertTriangle,
  ClipboardList,
  Timer,
  UserCircle,
  FileSearch,
  type LucideIcon,
} from "lucide-react";

import { Icon } from "@/components/icon";
import { OrgSwitcher } from "./org-switcher";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href?: string;
  icon: LucideIcon;
  soon?: boolean;
}

// ── Ítems fijos arriba (siempre visibles, sin accordion) ──────────────────────

const TOP_ITEMS: NavItem[] = [
  { label: "General",   href: "/dashboard", icon: LayoutDashboard },
  { label: "Briefing",  href: "/briefing",  icon: Sunrise },
  { label: "Autopilot", href: "/autopilot", icon: Zap },
];

// ── Secciones colapsables ─────────────────────────────────────────────────────

interface NavSection {
  key: string;
  label: string;
  items: NavItem[];
}

const SECTIONS: NavSection[] = [
  {
    key: "operaciones",
    label: "Operaciones",
    items: [
      { label: "Expedientes", href: "/expedientes",  icon: Package },
      { label: "Calendario",  href: "/calendar",     icon: CalendarDays },
      { label: "Documentos",  href: "/documentos",   icon: FolderOpen },
      { label: "Mapa",             href: "/mapa",               icon: Map },
      { label: "Ferroviario",      href: "/ferroviario",         icon: Train },
      { label: "Consolidaciones",  href: "/consolidaciones",     icon: Layers },
      { label: "Vuelos",           href: "/vuelos",              icon: Plane },
      { label: "Manifiestos",      href: "/manifiestos",         icon: FileStack },
      { label: "Transporte",       href: "/ordenes-transporte",  icon: Truck },
      { label: "Rutas",            href: "/rutas",               icon: Route },
      { label: "Aduanas",          icon: FileCheck2,             soon: true },
    ],
  },
  {
    key: "comercial",
    label: "Comercial",
    items: [
      { label: "Contactos",   href: "/contactos",   icon: Building2 },
      { label: "Cotizaciones",href: "/cotizaciones", icon: FileText },
      { label: "Pipeline",    href: "/pipeline",    icon: TrendingUp },
      { label: "Partners",    href: "/partners",     icon: Handshake },
      { label: "Mi perfil",   href: "/partners/perfil", icon: UserCircle },
      { label: "Red",         href: "/partners/red",    icon: Globe },
      { label: "Tender",      href: "/partners/tender", icon: FileSearch },
    ],
  },
  {
    key: "finanzas",
    label: "Finanzas",
    items: [
      { label: "Excepciones",   href: "/excepciones",   icon: ShieldAlert },
      { label: "Facturación",   href: "/facturas",      icon: Receipt },
      { label: "Contabilidad",  href: "/contabilidad",  icon: BookOpen },
      { label: "Gastos",        icon: CreditCard,       soon: true },
      { label: "Tarifas",       href: "/tarifas",       icon: Tag },
    ],
  },
  {
    key: "analisis",
    label: "Análisis",
    items: [
      { label: "Reportes", href: "/reportes", icon: BarChart3 },
    ],
  },
  {
    key: "maestros",
    label: "Maestros",
    items: [
      { label: "Puertos",       href: "/maestros/puertos",      icon: Anchor },
      { label: "Aeropuertos",   href: "/maestros/aeropuertos",  icon: Plane },
      { label: "Países",        href: "/maestros/paises",       icon: Globe },
      { label: "Monedas",       href: "/maestros/monedas",      icon: DollarSign },
      { label: "Conceptos",     href: "/maestros/conceptos",    icon: Tag },
      { label: "Regímenes",     href: "/maestros/regimenes",    icon: FileCheck2 },
      { label: "Parámetros",    href: "/maestros/parametros",   icon: Settings },
      { label: "Series",        href: "/maestros/series",       icon: Hash },
      { label: "Sucursales",    href: "/maestros/sucursales",   icon: Building2 },
    ],
  },
  {
    key: "calidad",
    label: "Calidad",
    items: [
      { label: "Incidencias",       href: "/calidad/incidencias",       icon: AlertTriangle },
      { label: "No conformidades",  href: "/calidad/no-conformidades",  icon: ClipboardList },
      { label: "SLA",               href: "/calidad/sla",               icon: Timer },
    ],
  },
  {
    key: "procesos",
    label: "Procesos",
    items: [
      { label: "Eventos webhook",  href: "/procesos/eventos",  icon: Zap },
    ],
  },
  {
    key: "integraciones",
    label: "Integraciones",
    items: [
      { label: "Conectores",  icon: Plug,     soon: true },
    ],
  },
];

// ── Ítem fijo abajo ───────────────────────────────────────────────────────────

const AJUSTES: NavItem = { label: "Ajustes", href: "/settings", icon: Settings };

// ── Helpers ───────────────────────────────────────────────────────────────────

function sectionForPath(pathname: string): string | null {
  for (const s of SECTIONS) {
    if (s.items.some((i) => i.href && (pathname === i.href || pathname.startsWith(`${i.href}/`)))) {
      return s.key;
    }
  }
  return null;
}

// ── Sub-componentes ───────────────────────────────────────────────────────────

function NavLink({
  item,
  indent = false,
  onClick,
  pathname,
}: {
  item: NavItem;
  indent?: boolean;
  onClick?: () => void;
  pathname: string;
}) {
  const active = !!item.href && (pathname === item.href || pathname.startsWith(`${item.href}/`));

  if (item.soon || !item.href) {
    return (
      <span
        className={cn(
          "flex cursor-default items-center gap-3 whitespace-nowrap rounded-md px-3 py-2 text-base text-muted-foreground/40",
          indent && "pl-9",
        )}
        title="Disponible en una próxima fase"
      >
        <Icon icon={item.icon} size={15} className="shrink-0" />
        {item.label}
        <span className="ml-auto rounded border border-border/50 px-1.5 py-0.5 font-mono text-sm text-muted-foreground/40">
          pronto
        </span>
      </span>
    );
  }

  return (
    <Link
      href={item.href}
      prefetch={false}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 whitespace-nowrap rounded-md px-3 py-2 text-base transition-colors duration-150",
        indent && "pl-9",
        active
          ? "bg-primary/10 font-medium text-foreground shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.2)]"
          : "text-muted-foreground hover:bg-surface-2 hover:text-foreground",
      )}
    >
      <Icon icon={item.icon} size={15} className="shrink-0" />
      {item.label}
    </Link>
  );
}

function SectionAccordion({
  section,
  isOpen,
  onToggle,
  onNav,
  pathname,
}: {
  section: NavSection;
  isOpen: boolean;
  onToggle: () => void;
  onNav: () => void;
  pathname: string;
}) {
  const hasActive = section.items.some(
    (i) => i.href && (pathname === i.href || pathname.startsWith(`${i.href}/`)),
  );

  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "flex w-full items-center gap-3 rounded-md px-3 py-2 text-base transition-colors duration-150",
          hasActive
            ? "font-medium text-foreground"
            : "text-muted-foreground hover:bg-surface-2 hover:text-foreground",
        )}
      >
        <span className="flex-1 text-left font-mono text-sm uppercase tracking-[0.14em]">
          {section.label}
        </span>
        <ChevronDown
          className={cn(
            "size-3.5 shrink-0 text-muted-foreground/50 transition-transform duration-200",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {/* Smooth height transition via grid trick */}
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-out",
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div className="pb-1 pt-0.5">
            {section.items.map((item) => (
              <NavLink
                key={item.href ?? item.label}
                item={item}
                indent
                onClick={onNav}
                pathname={pathname}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

interface OrgOption {
  orgId: string;
  orgName: string;
}

interface AppSidebarProps {
  orgName: string;
  activeOrgId: string;
  orgs: OrgOption[];
  memberCount: number;
  city: string | null;
}

export function AppSidebar({ orgName, activeOrgId, orgs, memberCount, city }: AppSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Sección activa por pathname; las demás cerradas por defecto
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const active = sectionForPath(pathname);
    const init: Record<string, boolean> = {};
    for (const s of SECTIONS) init[s.key] = s.key === active;
    return init;
  });

  // Cuando cambia la ruta, abre la sección activa (sin cerrar las que el usuario abrió)
  useEffect(() => {
    const active = sectionForPath(pathname);
    if (active) {
      setOpenSections((prev) => ({ ...prev, [active]: true }));
    }
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMobileOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  const toggleSection = useCallback((key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const closeMenu = useCallback(() => setMobileOpen(false), []);

  // El botón "Menú" del topbar abre/cierra el drawer móvil.
  useEffect(() => {
    function onToggle() { setMobileOpen((v) => !v); }
    window.addEventListener("manann:toggle-sidebar", onToggle);
    return () => window.removeEventListener("manann:toggle-sidebar", onToggle);
  }, []);

  const isActive = (href?: string) =>
    !!href && (pathname === href || pathname.startsWith(`${href}/`));

  const Content = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-14 shrink-0 items-center px-5">
        <Link href="/dashboard" onClick={closeMenu} aria-label="Manann">
          <Logo className="h-7" />
        </Link>
      </div>

      {/* Scroll container */}
      <div className="flex-1 overflow-y-auto">
        <nav aria-label="Navegación principal" className="px-3 py-2">

          {/* ── Ítems fijos superiores ─────────────────────────────────── */}
          <div className="space-y-0.5">
            {TOP_ITEMS.map((item) => (
              <NavLink key={item.href} item={item} onClick={closeMenu} pathname={pathname} />
            ))}
          </div>

          {/* ── Divider ────────────────────────────────────────────────── */}
          <div className="my-3 border-t border-border/60" />

          {/* ── Secciones accordion ────────────────────────────────────── */}
          <div className="space-y-0.5">
            {SECTIONS.map((section, i) => (
              <div key={section.key}>
                <SectionAccordion
                  section={section}
                  isOpen={openSections[section.key] ?? false}
                  onToggle={() => toggleSection(section.key)}
                  onNav={closeMenu}
                  pathname={pathname}
                />
                {/* Divider entre secciones (no after last) */}
                {i < SECTIONS.length - 1 && (
                  <div className="my-1.5 border-t border-border/40" />
                )}
              </div>
            ))}
          </div>
        </nav>
      </div>

      {/* ── Footer fijo ────────────────────────────────────────────────── */}
      <div className="shrink-0 border-t border-border">
        <div className="px-3 pt-2 pb-1">
          <NavLink item={AJUSTES} onClick={closeMenu} pathname={pathname} />
        </div>

        {/* Info de empresa */}
        <div className="border-t border-border px-3 py-3">
          {orgs.length >= 2 ? (
            <OrgSwitcher orgs={orgs} activeOrgId={activeOrgId} activeOrgName={orgName} />
          ) : (
            <div className="flex items-center gap-2.5 px-1">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/15 font-mono text-xs font-semibold text-primary">
                {orgName.slice(0, 2).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{orgName}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {city ? `${city} · ` : ""}{memberCount} usuario{memberCount !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop: columna fija */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-border bg-background/80 backdrop-blur-md lg:block">
        {Content}
      </aside>

      {/* Móvil: drawer (lo abre el botón "Menú" del topbar vía evento) */}
      <div
        aria-hidden={!mobileOpen}
        className={cn("fixed inset-x-0 bottom-0 top-14 z-40 lg:hidden", mobileOpen ? "pointer-events-auto visible" : "pointer-events-none invisible")}
      >
        <div
          className={cn("absolute inset-0 bg-background/70 backdrop-blur-sm transition-opacity duration-300 ease-out", mobileOpen ? "opacity-100" : "opacity-0")}
          onClick={closeMenu}
        />
        <aside className={cn("absolute inset-y-0 left-0 w-64 border-r border-border bg-card transition-transform duration-300 ease-out", mobileOpen ? "translate-x-0" : "-translate-x-full")}>
          {Content}
        </aside>
      </div>
    </>
  );
}
