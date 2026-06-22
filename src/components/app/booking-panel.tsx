"use client";

import { useState, useTransition } from "react";
import { BookOpen, Plus, Trash2 } from "lucide-react";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createBooking, updateBookingStatus, deleteBooking } from "@/lib/erp-actions";
import { toast } from "@/components/ui/toast";
import { DatePicker } from "@/components/ui/date-picker";
import { EmptyState } from "@/components/ui/empty-state";

type BookingStatus = "pendiente" | "recibido" | "confirmado" | "rechazado";

interface Booking {
  id: string;
  carrierCode: string;
  carrierBookingRef: string | null;
  vesselName: string | null;
  voyageNumber: string | null;
  pol: string | null;
  pod: string | null;
  etd: Date | null;
  eta: Date | null;
  cutoffDate: Date | null;
  status: BookingStatus;
  notes: string | null;
  createdAt: Date;
}

interface BookingPanelProps {
  shipmentId: string;
  bookings: Booking[];
  defaultPol?: string | null;
  defaultPod?: string | null;
  defaultCarrier?: string | null;
  defaultVessel?: string | null;
  defaultVoyage?: string | null;
}

const STATUS_CONFIG: Record<BookingStatus, { label: string; cls: string }> = {
  pendiente: {
    label: "Pendiente",
    cls: "bg-muted text-muted-foreground",
  },
  recibido: {
    label: "Recibido",
    cls: "bg-info/10 text-info",
  },
  confirmado: {
    label: "Confirmado",
    cls: "bg-success/10 text-success",
  },
  rechazado: {
    label: "Rechazado",
    cls: "bg-destructive/10 text-destructive",
  },
};

const STATUS_NEXT: Record<BookingStatus, BookingStatus[]> = {
  pendiente: ["recibido", "rechazado"],
  recibido: ["confirmado", "rechazado"],
  confirmado: [],
  rechazado: [],
};

function fmt(d: Date | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
}

function BookingCard({ b, shipmentId }: { b: Booking; shipmentId: string }) {
  const [pending, startTransition] = useTransition();
  const cfg = STATUS_CONFIG[b.status];
  const nextStates = STATUS_NEXT[b.status];

  return (
    <div className="rounded-md border border-border/60 bg-surface-2/40 p-3 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-mono text-base font-semibold text-foreground">
              {b.carrierCode}
            </span>
            {b.carrierBookingRef && (
              <span className="font-mono text-sm text-muted-foreground">
                #{b.carrierBookingRef}
              </span>
            )}
            <span className={cn("rounded-sm px-1.5 py-0.5 font-mono text-sm font-semibold uppercase tracking-wide", cfg.cls)}>
              {cfg.label}
            </span>
            <span className="text-sm text-muted-foreground/65">DCSA 2.0</span>
          </div>
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 font-mono text-sm text-muted-foreground">
            {b.vesselName && <span>{b.vesselName}{b.voyageNumber ? ` / ${b.voyageNumber}` : ""}</span>}
            {(b.pol || b.pod) && <span>{[b.pol, b.pod].filter(Boolean).join(" → ")}</span>}
            {b.cutoffDate && <span>Cutoff: {fmt(b.cutoffDate)}</span>}
            {b.etd && <span>ETD: {fmt(b.etd)}</span>}
          </div>
          {b.notes && <p className="mt-1 text-sm text-muted-foreground">{b.notes}</p>}
        </div>
        <button
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              try {
                await deleteBooking(b.id, shipmentId);
                toast.success("Booking eliminado");
              } catch {
                toast.error("No se pudo eliminar el booking. Inténtalo de nuevo.");
              }
            })
          }
          className="inline-flex items-center justify-center min-h-11 min-w-11 sm:min-h-0 sm:min-w-0 shrink-0 rounded p-1 text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <Icon icon={Trash2} size={13} />
        </button>
      </div>

      {nextStates.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-sm text-muted-foreground">Avanzar a:</span>
          {nextStates.map((s) => (
            <button
              key={s}
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  try {
                    await updateBookingStatus(b.id, s);
                    toast.success("Estado del booking actualizado");
                  } catch {
                    toast.error("No se pudo actualizar el booking. Inténtalo de nuevo.");
                  }
                })
              }
              className={cn(
                "rounded-sm px-2 py-0.5 font-mono text-sm font-medium transition-opacity",
                STATUS_CONFIG[s].cls,
                "opacity-80 hover:opacity-100 disabled:opacity-40",
              )}
            >
              {STATUS_CONFIG[s].label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function CreateBookingForm({
  shipmentId,
  defaultPol,
  defaultPod,
  defaultCarrier,
  defaultVessel,
  defaultVoyage,
  onDone,
}: {
  shipmentId: string;
  defaultPol?: string | null;
  defaultPod?: string | null;
  defaultCarrier?: string | null;
  defaultVessel?: string | null;
  defaultVoyage?: string | null;
  onDone: () => void;
}) {
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await createBooking({
          shipmentId,
          carrierCode: (fd.get("carrierCode") as string) || "",
          vesselName: (fd.get("vesselName") as string) || undefined,
          voyageNumber: (fd.get("voyageNumber") as string) || undefined,
          pol: (fd.get("pol") as string) || undefined,
          pod: (fd.get("pod") as string) || undefined,
          etd: (fd.get("etd") as string) || undefined,
          eta: (fd.get("eta") as string) || undefined,
          cutoffDate: (fd.get("cutoffDate") as string) || undefined,
          notes: (fd.get("notes") as string) || undefined,
        });
        toast.success("Booking creado");
        onDone();
      } catch {
        toast.error("No se pudo crear el booking. Inténtalo de nuevo.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-3 rounded-md border border-border/60 bg-surface-2/30 p-3">
      <p className="font-mono text-sm font-medium text-foreground uppercase tracking-wide">Nuevo booking DCSA 2.0</p>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="carrierCode" className="mb-1 block">Naviera (SCAC) *</Label>
          <Input id="carrierCode" name="carrierCode" required placeholder="MSC" defaultValue={defaultCarrier ?? ""} />
        </div>
        <div>
          <Label htmlFor="vesselName" className="mb-1 block">Buque</Label>
          <Input id="vesselName" name="vesselName" placeholder="MSC IRINA" defaultValue={defaultVessel ?? ""} />
        </div>
        <div>
          <Label htmlFor="voyageNumber" className="mb-1 block">Viaje</Label>
          <Input id="voyageNumber" name="voyageNumber" placeholder="043E" defaultValue={defaultVoyage ?? ""} />
        </div>
        <div>
          <Label htmlFor="cutoffDate" className="mb-1 block">Cutoff VGM/carga</Label>
          <DatePicker id="cutoffDate" name="cutoffDate" />
        </div>
        <div>
          <Label htmlFor="pol" className="mb-1 block">POL</Label>
          <Input id="pol" name="pol" placeholder="ESBCN" defaultValue={defaultPol ?? ""} />
        </div>
        <div>
          <Label htmlFor="pod" className="mb-1 block">POD</Label>
          <Input id="pod" name="pod" placeholder="NLRTM" defaultValue={defaultPod ?? ""} />
        </div>
        <div>
          <Label htmlFor="etd" className="mb-1 block">ETD</Label>
          <DatePicker id="etd" name="etd" />
        </div>
        <div>
          <Label htmlFor="eta" className="mb-1 block">ETA</Label>
          <DatePicker id="eta" name="eta" />
        </div>
      </div>
      <div>
        <Label htmlFor="notes" className="mb-1 block">Notas</Label>
        <Input id="notes" name="notes" placeholder="Instrucciones especiales…" />
      </div>
      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onDone}>
          Cancelar
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Creando…" : "Crear booking"}
        </Button>
      </div>
    </form>
  );
}

export function BookingPanel({
  shipmentId,
  bookings,
  defaultPol,
  defaultPod,
  defaultCarrier,
  defaultVessel,
  defaultVoyage,
}: BookingPanelProps) {
  const [showForm, setShowForm] = useState(false);

  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon icon={BookOpen} size={16} className="text-muted-foreground" />
          <h2 className="font-display text-base font-medium tracking-tight text-foreground">
            Bookings DCSA 2.0
          </h2>
          {bookings.length > 0 && (
            <span className="rounded-full bg-muted px-1.5 py-0.5 font-mono text-sm text-muted-foreground">
              {bookings.length}
            </span>
          )}
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 font-mono text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <Icon icon={Plus} size={13} />
          Nuevo
        </button>
      </div>

      {bookings.length === 0 && !showForm && (
        <EmptyState
          icon={<BookOpen strokeWidth={1.5} />}
          title="Sin bookings"
          hint="Crea uno para confirmar el espacio con la naviera según DCSA 2.0."
        />
      )}

      {bookings.length > 0 && (
        <div className="space-y-2">
          {bookings.map((b) => (
            <BookingCard key={b.id} b={b} shipmentId={shipmentId} />
          ))}
        </div>
      )}

      {showForm && (
        <CreateBookingForm
          shipmentId={shipmentId}
          defaultPol={defaultPol}
          defaultPod={defaultPod}
          defaultCarrier={defaultCarrier}
          defaultVessel={defaultVessel}
          defaultVoyage={defaultVoyage}
          onDone={() => setShowForm(false)}
        />
      )}
    </section>
  );
}
