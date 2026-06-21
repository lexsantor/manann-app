"use client";

import { useState, useTransition } from "react";
import { Building2, Globe, Mail, Trash2, Plus, Loader2, ShieldAlert, ShieldCheck } from "lucide-react";
import { Icon } from "@/components/icon";
import { createPartner, deletePartner, runSanctionsScreening } from "@/lib/erp-actions";
import { EmptyState } from "@/components/ui/empty-state";
import type { PartnerRow } from "@/lib/erp";
import { cn } from "@/lib/utils";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchField } from "@/components/ui/search-field";
import { Label } from "@/components/ui/label";

const TYPE_LABEL: Record<string, string> = {
  agent: "Agente",
  "co-loader": "Co-loader",
  subcontractor: "Subcontratista",
  carrier: "Naviera/Aérea",
  customs: "Aduana",
  other: "Otro",
};

const TYPE_COLOR: Record<string, string> = {
  agent: "text-muted-foreground bg-muted",
  "co-loader": "text-muted-foreground bg-muted",
  subcontractor: "text-muted-foreground bg-muted",
  carrier: "text-muted-foreground bg-muted",
  customs: "text-muted-foreground bg-muted",
  other: "text-muted-foreground bg-muted/40",
};

type ScreenResult = { result: "clear" | "match" | "review"; matches: { list: string; score: number }[] };

interface PartnerDirectoryProps {
  partners: PartnerRow[];
}

export function PartnerDirectory({ partners: initial }: PartnerDirectoryProps) {
  const [partners, setPartners] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [pending, start] = useTransition();
  const [screeningName, setScreeningName] = useState("");
  const [screening, setScreening] = useState<ScreenResult | null>(null);
  const [screenPending, startScreen] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    type: "agent" as const,
    region: "",
    services: "",
    contactEmail: "",
    taxId: "",
  });

  function handleCreate() {
    setError(null);
    start(async () => {
      try {
        await createPartner({
          name: form.name,
          type: form.type,
          region: form.region,
          services: form.services.split(",").map((s) => s.trim()).filter(Boolean),
          contactEmail: form.contactEmail || undefined,
          taxId: form.taxId || undefined,
        });
        setShowForm(false);
        setForm({ name: "", type: "agent", region: "", services: "", contactEmail: "", taxId: "" });
        window.location.reload();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al crear partner");
      }
    });
  }

  function handleDelete(id: string) {
    start(async () => {
      await deletePartner(id);
      setPartners((prev) => prev.filter((p) => p.id !== id));
    });
  }

  function handleScreen() {
    if (!screeningName.trim()) return;
    setScreening(null);
    startScreen(async () => {
      const r = await runSanctionsScreening(screeningName);
      setScreening(r);
    });
  }

  return (
    <div className="space-y-6">
      {/* Sanctions screening */}
      <section className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Icon icon={ShieldAlert} size={15} className="text-muted-foreground" />
          <h2 className="font-display text-base font-medium tracking-tight">Screening OFAC / SIRA</h2>
          <span className="rounded border border-warning/30 bg-warning/8 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-warning">
            Simulación
          </span>
        </div>
        <p className="text-sm text-muted-foreground/70 mb-3">
          Comprueba si un tercero aparece en listas de sanciones internacionales antes de añadirlo como partner.
        </p>
        <div className="flex gap-2">
          <SearchField
            value={screeningName}
            onChange={setScreeningName}
            placeholder="Nombre del tercero…"
            className="flex-1"
          />
          <Button
            onClick={handleScreen}
            disabled={screenPending || !screeningName.trim()}
            size="sm"
            className="shrink-0 gap-1.5"
          >
            {screenPending ? <Loader2 className="size-4 animate-spin" /> : <ShieldAlert className="size-4" />}
            Verificar
          </Button>
        </div>
        {screening && (
          <div className={cn(
            "mt-3 rounded-md border px-4 py-3 flex items-start gap-3",
            screening.result === "clear"
              ? "border-success/20 bg-success/5"
              : "border-destructive/20 bg-destructive/5",
          )}>
            <Icon
              icon={screening.result === "clear" ? ShieldCheck : ShieldAlert}
              size={16}
              className={screening.result === "clear" ? "text-success mt-0.5" : "text-destructive mt-0.5"}
            />
            <div>
              <p className={cn("text-sm font-medium", screening.result === "clear" ? "text-success" : "text-destructive")}>
                {screening.result === "clear" ? "Sin coincidencias — tercero limpio" : "Coincidencias detectadas — revisar"}
              </p>
              {screening.matches.length > 0 && (
                <ul className="mt-1 space-y-0.5">
                  {screening.matches.map((m) => (
                    <li key={m.list} className="font-mono text-xs text-muted-foreground">
                      {m.list} · score {(m.score * 100).toFixed(0)}%
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Partner list */}
      <section className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Icon icon={Building2} size={15} className="text-muted-foreground" />
            <h2 className="font-display text-base font-medium tracking-tight">Directorio de partners</h2>
            <span className="rounded-full bg-muted/60 px-2 py-0.5 font-mono text-xs text-muted-foreground">{partners.length}</span>
          </div>
          <Button
            onClick={() => setShowForm((v) => !v)}
            size="sm"
            className="shrink-0 gap-1.5"
          >
            <Plus className="size-4" />
            Añadir partner
          </Button>
        </div>

        {showForm && (
          <div className="border-b border-border px-5 py-4 bg-surface-2/20 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Tipo *</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) => setForm((f) => ({ ...f, type: v as typeof form.type }))}
                >
                  <SelectTrigger aria-label="Tipo *" className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TYPE_LABEL).map(([v, l]) => (
                      <SelectItem key={v} value={v}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="region">Región</Label>
                <Input
                  id="region"
                  value={form.region}
                  onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))}
                  placeholder="p.ej. Asia-Pacífico"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="servicios-separados-por-coma">Servicios (separados por coma)</Label>
                <Input
                  id="servicios-separados-por-coma"
                  value={form.services}
                  onChange={(e) => setForm((f) => ({ ...f, services: e.target.value }))}
                  placeholder="FCL, LCL, Air Freight"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="email-contacto">Email contacto</Label>
                <Input
                  id="email-contacto"
                  type="email"
                  value={form.contactEmail}
                  onChange={(e) => setForm((f) => ({ ...f, contactEmail: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="nif-vat">NIF / VAT</Label>
                <Input
                  id="nif-vat"
                  value={form.taxId}
                  onChange={(e) => setForm((f) => ({ ...f, taxId: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>
            {error && <p className="text-sm text-accent">{error}</p>}
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowForm(false)}
                className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancelar
              </button>
              <Button
                onClick={handleCreate}
                disabled={pending || !form.name.trim()}
                className="gap-1.5"
              >
                {pending ? <Loader2 className="size-4 animate-spin" /> : null}
                Guardar
              </Button>
            </div>
          </div>
        )}

        {partners.length === 0 ? (
          <EmptyState
            icon={<Building2 strokeWidth={1.5} />}
            title="Sin partners registrados"
            hint="Da de alta navieras, agentes y corresponsales para usarlos en tus expedientes."
          />
        ) : (
          <ul className="divide-y divide-border/50">
            {partners.map((p) => (
              <li key={p.id} className="flex items-start justify-between gap-4 px-5 py-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-foreground">{p.name}</span>
                    <span className={cn("rounded-full px-2 py-0.5 font-mono text-xs", TYPE_COLOR[p.type] ?? "text-muted-foreground bg-muted/40")}>
                      {TYPE_LABEL[p.type] ?? p.type}
                    </span>
                    {!p.active && (
                      <span className="rounded-full px-2 py-0.5 font-mono text-xs text-muted-foreground/65 bg-muted/30">Inactivo</span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                    {p.region && (
                      <span className="flex items-center gap-1">
                        <Globe className="size-3.5" />
                        {p.region}
                      </span>
                    )}
                    {p.contactEmail && (
                      <span className="flex items-center gap-1">
                        <Mail className="size-3.5" />
                        {p.contactEmail}
                      </span>
                    )}
                  </div>
                  {p.services && p.services.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {p.services.map((s) => (
                        <span key={s} className="rounded bg-muted/40 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(p.id)}
                  disabled={pending}
                  className="shrink-0 rounded-md p-1.5 text-muted-foreground/60 hover:text-accent hover:bg-accent/10 transition-colors"
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
