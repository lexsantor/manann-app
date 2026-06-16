import * as React from "react";
import { Container, Boxes, Plane, Truck, Train, Ship, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Kit de badges del ERP (lenguaje visual Faro).
//   StatusBadge — pill rounded-full con punto de color, por estado semántico.
//   ModeBadge   — chip rounded-md con icono (FCL/LCL/AIR/ROAD/RAIL/SEA).
//   GradeBadge  — círculo A/B/C (rating de cliente/carrier).
// Colores semánticos vía tokens; nunca ámbar salvo IA (ámbar se reserva en UI).
// ─────────────────────────────────────────────────────────────────────────────

type Tone = "success" | "info" | "warning" | "danger" | "neutral";

const TONE_CLASS: Record<Tone, string> = {
  success: "text-success bg-success/10",
  info: "text-info bg-info/10",
  warning: "text-warning bg-warning/10",
  danger: "text-destructive bg-destructive/10",
  neutral: "text-muted-foreground bg-muted",
};

const DOT_CLASS: Record<Tone, string> = {
  success: "bg-success",
  info: "bg-info",
  warning: "bg-warning",
  danger: "bg-destructive",
  neutral: "bg-muted-foreground/60",
};

// Mapa estado→tono cubriendo todos los módulos (expedientes, facturas,
// cotizaciones, pipeline, bookings, contabilidad, calidad, aduanas, transporte).
const STATUS_TONE: Record<string, Tone> = {
  // genéricos / éxito
  entregado: "success", arribado: "success", pagada: "success", aceptada: "success",
  ganado: "success", contabilizado: "success", cerrado: "success", closed: "success",
  confirmado: "success", recibido: "success", activo: "success", connected: "success",
  // info / en curso
  en_transito: "info", en_ruta: "info", enviada: "info", emitida: "info",
  propuesta: "info", negociacion: "info", presentada: "info", open: "info",
  abierto: "info", recogida: "info", en_gestion: "info", en_revision: "info",
  // advertencia / atención
  en_aduana: "warning", pendiente: "warning", vencida: "warning",
  // negativo
  rechazada: "danger", rechazado: "danger", perdido: "danger", anulada: "danger",
  anulado: "danger", expirada: "danger", incidencia: "danger", disconnected: "danger",
  // neutro
  borrador: "neutral", prospecto: "neutral", registrado: "neutral",
};

function humanize(s: string): string {
  const t = s.replace(/_/g, " ");
  return t.charAt(0).toUpperCase() + t.slice(1);
}

export function StatusBadge({
  status,
  label,
  tone,
  className,
}: {
  status: string;
  label?: string;
  tone?: Tone;
  className?: string;
}) {
  const t = tone ?? STATUS_TONE[status.toLowerCase()] ?? "neutral";
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        TONE_CLASS[t],
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", DOT_CLASS[t])} />
      {label ?? humanize(status)}
    </span>
  );
}

// ── ModeBadge ────────────────────────────────────────────────────────────────

type ModeKey = "fcl" | "lcl" | "air" | "road" | "rail" | "sea" | "multimodal";

const MODE_MAP: Record<ModeKey, { label: string; Icon: React.ComponentType<{ className?: string; strokeWidth?: number }> }> = {
  fcl: { label: "FCL", Icon: Container },
  lcl: { label: "LCL", Icon: Boxes },
  air: { label: "AIR", Icon: Plane },
  road: { label: "ROAD", Icon: Truck },
  rail: { label: "RAIL", Icon: Train },
  sea: { label: "SEA", Icon: Ship },
  multimodal: { label: "MULTI", Icon: Layers },
};

// Normaliza tanto load_type (fcl/lcl) como transport_mode (maritimo/aereo…).
function normalizeMode(raw: string): ModeKey {
  const m = raw.toLowerCase();
  if (m === "fcl" || m === "lcl" || m === "air" || m === "road" || m === "rail" || m === "sea" || m === "multimodal") return m;
  if (m === "maritimo") return "sea";
  if (m === "aereo") return "air";
  if (m === "terrestre") return "road";
  if (m === "ferroviario") return "rail";
  return "multimodal";
}

export function ModeBadge({ mode, className }: { mode: string; className?: string }) {
  const { label, Icon } = MODE_MAP[normalizeMode(mode)];
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-md border border-border bg-card px-2 py-0.5 text-[11px] font-medium text-muted-foreground whitespace-nowrap",
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
      {label}
    </span>
  );
}

// ── GradeBadge ───────────────────────────────────────────────────────────────

const GRADE_CLASS: Record<string, string> = {
  A: "bg-foreground text-background",
  B: "bg-secondary text-secondary-foreground",
  C: "bg-muted text-muted-foreground border border-border",
};

export function GradeBadge({ grade, className }: { grade: string; className?: string }) {
  const g = grade.toUpperCase();
  return (
    <span
      className={cn(
        "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
        GRADE_CLASS[g] ?? GRADE_CLASS.C,
        className,
      )}
      title={`Rating ${g}`}
    >
      {g}
    </span>
  );
}
