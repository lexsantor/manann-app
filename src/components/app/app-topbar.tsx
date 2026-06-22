"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  Search,
  Sparkles,
  Plus,
  HelpCircle,
  Settings,
  ChevronRight,
  X,
  Package,
  FileText,
  Receipt,
  Building2,
  LogOut,
  Command,
} from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { NotificationsBell } from "./notifications-bell";
import { createDraftShipment } from "@/lib/erp-actions";
import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { helpForPath, ATAJOS } from "@/lib/help-content";
import { tourForPath } from "@/lib/tours";

// Etiquetas legibles por segmento de ruta (para el breadcrumb).
const LABELS: Record<string, string> = {
  dashboard: "Inicio", expedientes: "Expedientes", mapa: "Mapa", calendar: "Calendario",
  documentos: "Documentos", cotizaciones: "Cotizaciones", facturas: "Facturación",
  contactos: "Contactos", pipeline: "Pipeline", partners: "Partners",
  contabilidad: "Contabilidad", tarifas: "Tarifas", reportes: "Reportes",
  maestros: "Maestros", calidad: "Calidad", procesos: "Procesos",
  excepciones: "Excepciones", briefing: "Briefing", autopilot: "Autopilot",
  vuelos: "Vuelos", ferroviario: "Ferroviario", consolidaciones: "Consolidaciones",
  manifiestos: "Manifiestos", "ordenes-transporte": "Transporte", rutas: "Rutas",
  settings: "Ajustes", importar: "Importar", perfil: "Perfil", red: "Red", tender: "Tender",
};

function emit(name: string) {
  window.dispatchEvent(new CustomEvent(name));
}

interface AppTopbarProps {
  userName: string;
  userEmail: string;
}

export function AppTopbar({ userName, userEmail }: AppTopbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [menu, setMenu] = useState<"crear" | "avatar" | null>(null);
  const [help, setHelp] = useState(false);
  const ref = useRef<HTMLElement>(null);

  // Cierra dropdowns al hacer clic fuera del topbar.
  useEffect(() => {
    if (!menu) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setMenu(null);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [menu]);

  // Breadcrumb: "Inicio" + sección actual.
  const seg = pathname.split("/").filter(Boolean);
  const current = seg.length ? (LABELS[seg[0]] ?? seg[0]) : "Inicio";
  const isHome = seg[0] === "dashboard" || seg.length === 0;

  const initials = (userName || userEmail).slice(0, 2).toUpperCase();

  return (
    <header
      ref={ref}
      className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-background/80 px-3 backdrop-blur-md sm:px-5"
    >
      {/* Menú (móvil) */}
      <button
        type="button"
        onClick={() => emit("manann:toggle-sidebar")}
        aria-label="Abrir menú"
        className="flex size-9 min-h-11 min-w-11 sm:min-h-0 sm:min-w-0 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:text-foreground lg:hidden"
      >
        <Menu className="h-5 w-5" strokeWidth={1.5} />
      </button>

      {/* Breadcrumb */}
      <nav aria-label="Ruta" className="hidden min-w-0 shrink items-center gap-1.5 text-sm md:flex">
        <Link href="/dashboard" className="shrink-0 text-muted-foreground transition-colors hover:text-foreground">
          Inicio
        </Link>
        {!isHome && (
          <>
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/65" />
            <span className="truncate font-medium text-foreground">{current}</span>
          </>
        )}
      </nav>

      {/* Buscador (abre CommandPalette) */}
      <button
        type="button"
        onClick={() => emit("manann:open-command")}
        className="group flex h-9 min-w-0 flex-1 items-center gap-2 rounded-md border border-border bg-card px-3 text-sm text-muted-foreground transition-colors hover:border-primary/30 sm:max-w-xs"
      >
        <Search className="h-4 w-4 shrink-0" strokeWidth={1.5} />
        <span className="truncate">Buscar o ejecutar una acción…</span>
        <kbd className="ml-auto hidden shrink-0 items-center gap-0.5 rounded border border-border bg-background px-1.5 font-mono text-[10px] text-muted-foreground sm:flex">
          <Command className="h-3 w-3" /> K
        </kbd>
      </button>

      {/* Empuja el grupo de acciones al extremo derecho */}
      <div className="hidden flex-1 sm:block" aria-hidden />

      <div className="flex shrink-0 items-center gap-2">
      {/* Manann IA (abre Copiloto) */}
      <button
        type="button"
        onClick={() => emit("manann:open-copiloto")}
        className="flex h-9 shrink-0 items-center gap-1.5 rounded-md border border-border bg-card px-2.5 text-sm font-medium text-foreground transition-colors hover:border-primary/30"
        title="Asistente Manann IA (⌘J)"
      >
        <Sparkles className="h-4 w-4 text-accent" strokeWidth={1.5} />
        <span className="hidden sm:inline">Manann IA</span>
      </button>

      {/* +Crear */}
      <div className="relative shrink-0">
        <Button
          type="button"
          size="sm"
          onClick={() => setMenu(menu === "crear" ? null : "crear")}
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          <span className="hidden sm:inline">Crear</span>
        </Button>
        {menu === "crear" && (
          <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-card p-1 shadow-lg">
            <form action={createDraftShipment}>
              <button type="submit" className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-surface-2">
                <Package className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} /> Nuevo expediente
              </button>
            </form>
            <CreateLink href="/cotizaciones" icon={FileText} label="Nueva cotización" onClick={() => setMenu(null)} />
            <CreateLink href="/facturas" icon={Receipt} label="Nueva factura" onClick={() => setMenu(null)} />
            <CreateLink href="/contactos" icon={Building2} label="Nuevo contacto" onClick={() => setMenu(null)} />
          </div>
        )}
      </div>

      {/* Tema */}
      <div className="hidden shrink-0 sm:block">
        <ThemeToggle />
      </div>

      {/* Ajustes */}
      <Link
        href="/settings"
        className="hidden size-9 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:text-foreground sm:flex"
        aria-label="Ajustes"
      >
        <Settings className="h-[18px] w-[18px]" strokeWidth={1.5} />
      </Link>

      {/* Ayuda */}
      <button
        type="button"
        onClick={() => setHelp(true)}
        className="hidden size-9 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:text-foreground sm:flex"
        aria-label="Ayuda"
      >
        <HelpCircle className="h-[18px] w-[18px]" strokeWidth={1.5} />
      </button>

      {/* Notificaciones */}
      <div className="shrink-0">
        <NotificationsBell />
      </div>

      {/* Avatar */}
      <div className="relative shrink-0">
        <button
          type="button"
          onClick={() => setMenu(menu === "avatar" ? null : "avatar")}
          aria-label="Perfil"
          className="flex size-9 min-h-11 min-w-11 sm:min-h-0 sm:min-w-0 items-center justify-center rounded-full bg-primary/15 font-mono text-xs font-semibold text-primary transition-colors hover:bg-primary/25"
        >
          {initials}
        </button>
        {menu === "avatar" && (
          <div className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-xl border border-border bg-card p-1 shadow-lg">
            <div className="border-b border-border px-3 py-2.5">
              <p className="truncate text-sm font-medium text-foreground">{userName || "Usuario"}</p>
              <p className="truncate text-xs text-muted-foreground">{userEmail}</p>
            </div>
            <Link href="/settings" onClick={() => setMenu(null)} className="mt-1 flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-surface-2">
              <Settings className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} /> Ajustes
            </Link>
            <button
              type="button"
              onClick={() => { setMenu(null); signOut().then(() => router.replace("/login")); }}
              className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-surface-2"
            >
              <LogOut className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} /> Cerrar sesión
            </button>
          </div>
        )}
      </div>

      </div>

      {help && <HelpModal onClose={() => setHelp(false)} pathname={pathname} />}
    </header>
  );
}

function CreateLink({ href, icon: Glyph, label, onClick }: { href: string; icon: typeof Package; label: string; onClick: () => void }) {
  return (
    <Link href={href} onClick={onClick} className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-surface-2">
      <Glyph className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} /> {label}
    </Link>
  );
}

function HelpModal({ onClose, pathname }: { onClose: () => void; pathname: string }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const screen = helpForPath(pathname);
  const hasTour = tourForPath(pathname) !== null;

  return createPortal(
    <div className="fixed inset-0 z-[var(--z-overlay)] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">{screen.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{screen.queHace}</p>
          </div>
          <button onClick={onClose} aria-label="Cerrar" className="inline-flex items-center justify-center min-h-11 min-w-11 sm:min-h-0 sm:min-w-0 rounded-md p-1 text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
        {screen.accionesClave.length > 0 && (
          <ul className="mt-5 space-y-3">
            {screen.accionesClave.map((a) => (
              <li key={a.label}>
                <p className="text-sm font-medium text-foreground">{a.label}</p>
                <p className="text-sm leading-relaxed text-muted-foreground">{a.desc}</p>
              </li>
            ))}
          </ul>
        )}
        {hasTour && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="mt-5"
            onClick={() => {
              window.dispatchEvent(new CustomEvent("manann:open-tour"));
              onClose();
            }}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Ver guía de esta pantalla
          </Button>
        )}
        <p className="mt-6 mb-2 label-mono text-muted-foreground/60">Atajos</p>
        <ul className="space-y-3">
          {ATAJOS.map((tip) => (
            <li key={tip.t} className="flex items-start gap-3">
              <kbd className="mt-0.5 flex h-6 shrink-0 items-center justify-center rounded-md border border-border bg-background px-2 font-mono text-xs text-foreground">{tip.k}</kbd>
              <div>
                <p className="text-sm font-medium text-foreground">{tip.t}</p>
                <p className="text-sm leading-relaxed text-muted-foreground">{tip.d}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>,
    document.body,
  );
}
