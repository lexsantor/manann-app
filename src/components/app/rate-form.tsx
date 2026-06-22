"use client";

import { useTransition, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { X, Loader2, Plus } from "lucide-react";
import { createRate, updateRate, type RateInput } from "@/lib/erp-actions";
import { type RateItem } from "@/lib/erp";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";

function DateInput({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  return <DatePicker value={value ?? undefined} onChange={(v) => onChange(v || null)} aria-label="Fecha" />;
}
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useFocusTrap } from "@/lib/use-focus-trap";

const SERVICE_LABELS: Record<string, string> = {
  flete: "Flete",
  aduana: "Aduana",
  manipulacion: "Manipulación",
  seguro: "Seguro",
  documentacion: "Documentación",
  almacenaje: "Almacenaje",
  otro: "Otro",
};

const UNIT_LABELS: Record<string, string> = {
  contenedor: "Por contenedor",
  bl: "Por BL",
  kg: "Por kg",
  cbm: "Por CBM",
  unidad: "Por unidad",
  plano: "Precio fijo",
};

const CURRENCIES = ["EUR", "USD", "GBP"];

interface RateFormProps {
  rate?: RateItem;
  onClose: () => void;
}

export function RateForm({ rate: existing, onClose }: RateFormProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const router = useRouter();
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, true, onClose);

  const [form, setForm] = useState<RateInput>({
    concept: existing?.concept ?? "",
    serviceType: (existing?.serviceType as RateInput["serviceType"]) ?? "flete",
    unit: (existing?.unit as RateInput["unit"]) ?? "contenedor",
    basePrice: existing?.basePrice ?? "",
    currency: existing?.currency ?? "EUR",
    validFrom: existing?.validFrom ?? null,
    validTo: existing?.validTo ?? null,
    notes: existing?.notes ?? null,
  });

  function set<K extends keyof RateInput>(key: K, value: RateInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit() {
    if (!form.concept.trim()) { setError("El concepto es obligatorio"); return; }
    if (!form.basePrice || isNaN(Number(form.basePrice))) { setError("Precio inválido"); return; }
    setError("");
    startTransition(async () => {
      try {
        if (existing) {
          await updateRate(existing.id, form);
        } else {
          await createRate(form);
        }
        router.refresh();
        onClose();
      } catch {
        setError("No se pudo guardar la tarifa");
      }
    });
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Editor de tarifa"
        tabIndex={-1}
        className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-border bg-background shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-display text-base font-semibold text-foreground">
            {existing ? "Editar tarifa" : "Nueva tarifa"}
          </h2>
          <button
            onClick={onClose}
            className="flex size-8 min-h-11 min-w-11 sm:min-h-0 sm:min-w-0 items-center justify-center rounded-md text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">

          {/* Concepto */}
          <div>
            <Label htmlFor="concepto" className="mb-1.5 block">
              Concepto
            </Label>
            <Input
              id="concepto"
              type="text"
              value={form.concept}
              onChange={(e) => set("concept", e.target.value)}
              placeholder='Ej: Flete FCL 20" Valencia–Shanghai'
              aria-invalid={!!error}
              aria-describedby={error ? "rate-form-error" : undefined}
            />
          </div>

          {/* Tipo de servicio */}
          <div>
            <Label className="mb-1.5 block">
              Tipo de servicio
            </Label>
            <Select value={form.serviceType} onValueChange={(v) => set("serviceType", v as RateInput["serviceType"])}>
              <SelectTrigger aria-label="Tipo de servicio" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SERVICE_LABELS).map(([v, l]) => (
                  <SelectItem key={v} value={v}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Unidad + Precio + Moneda */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1.5 block">
                Unidad
              </Label>
              <Select value={form.unit} onValueChange={(v) => set("unit", v as RateInput["unit"])}>
                <SelectTrigger aria-label="Unidad" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(UNIT_LABELS).map(([v, l]) => (
                    <SelectItem key={v} value={v}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5 block">
                Moneda
              </Label>
              <Select value={form.currency} onValueChange={(v) => set("currency", v)}>
                <SelectTrigger aria-label="Moneda" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="precio-base" className="mb-1.5 block">
              Precio base
            </Label>
            <div className="relative">
              <Input
                id="precio-base"
                type="number"
                min="0"
                step="0.01"
                value={form.basePrice}
                onChange={(e) => set("basePrice", e.target.value)}
                placeholder="0.00"
                aria-invalid={!!error}
                aria-describedby={error ? "rate-form-error" : undefined}
                className="pr-14 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-base text-muted-foreground">
                {form.currency}
              </span>
            </div>
          </div>

          {/* Vigencia */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1.5 block">
                Válida desde
              </Label>
              <DateInput value={form.validFrom ?? null} onChange={(v) => set("validFrom", v)} />
            </div>
            <div>
              <Label className="mb-1.5 block">
                Válida hasta
              </Label>
              <DateInput value={form.validTo ?? null} onChange={(v) => set("validTo", v)} />
            </div>
          </div>

          {/* Notas */}
          <div>
            <Label htmlFor="tarifa-notas" className="mb-1.5 block">
              Notas
            </Label>
            <Textarea
              id="tarifa-notas"
              value={form.notes ?? ""}
              onChange={(e) => set("notes", e.target.value || null)}
              rows={3}
              placeholder="Condiciones especiales, rutas aplicables..."
              className="w-full resize-none rounded-md border border-border bg-surface-2/30 px-3 py-2 text-base text-foreground outline-none focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>

          {error && (
            <p id="rate-form-error" role="alert" className="text-base text-destructive">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border px-5 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-md border border-border px-4 py-2 text-base text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancelar
          </button>
          <Button
            variant="secondary"
            onClick={handleSubmit}
            disabled={pending}
            className="gap-1.5"
          >
            {pending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            {existing ? "Guardar cambios" : "Crear tarifa"}
          </Button>
        </div>
      </div>
    </>
  );
}

export function RateFormTrigger() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)} className="gap-1.5">
        <Plus className="size-4" />
        Nueva tarifa
      </Button>
      {open && <RateForm onClose={() => setOpen(false)} />}
    </>
  );
}

interface RateEditTriggerProps {
  rate: RateItem;
}

export function RateEditTrigger({ rate }: RateEditTriggerProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "rounded px-2 py-0.5 font-mono text-base font-medium transition-colors",
          "text-muted-foreground hover:text-foreground",
        )}
      >
        Editar
      </button>
      {open && <RateForm rate={rate} onClose={() => setOpen(false)} />}
    </>
  );
}
