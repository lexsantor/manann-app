"use client";

import { useState, useTransition } from "react";
import { Building2, Globe, Mail, Trash2, Plus, Loader2, ShieldAlert, ShieldCheck } from "lucide-react";
import { Icon } from "@/components/icon";
import { createPartner, deletePartner, runSanctionsScreening } from "@/lib/erp-actions";
import type { PartnerRow } from "@/lib/erp";
import { cn } from "@/lib/utils";

const TYPE_LABEL: Record<string, string> = {
  agent: "Agente",
  "co-loader": "Co-loader",
  subcontractor: "Subcontratista",
  carrier: "Naviera/Aérea",
  customs: "Aduana",
  other: "Otro",
};

const TYPE_COLOR: Record<string, string> = {
  agent: "text-blue-400 bg-blue-500/10",
  "co-loader": "text-violet-400 bg-violet-500/10",
  subcontractor: "text-amber-400 bg-amber-500/10",
  carrier: "text-emerald-400 bg-emerald-500/10",
  customs: "text-orange-400 bg-orange-500/10",
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
          <span className="rounded border border-amber-500/30 bg-amber-500/8 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-amber-500">
            Simulación
          </span>
        </div>
        <p className="text-sm text-muted-foreground/70 mb-3">
          Comprueba si un tercero aparece en listas de sanciones internacionales antes de añadirlo como partner.
        </p>
        <div className="flex gap-2">
          <input
            value={screeningName}
            onChange={(e) => setScreeningName(e.target.value)}
            placeholder="Nombre del tercero…"
            className="flex-1 rounded-md border border-border bg-surface-2/30 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
          <button
            onClick={handleScreen}
            disabled={screenPending || !screeningName.trim()}
            className="flex items-center gap-1.5 rounded-md bg-primary/10 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/15 transition-colors disabled:opacity-50"
          >
            {screenPending ? <Loader2 className="size-4 animate-spin" /> : <ShieldAlert className="size-4" />}
            Verificar
          </button>
        </div>
        {screening && (
          <div className={cn(
            "mt-3 rounded-md border px-4 py-3 flex items-start gap-3",
            screening.result === "clear"
              ? "border-emerald-500/20 bg-emerald-500/5"
              : "border-red-500/20 bg-red-500/5",
          )}>
            <Icon
              icon={screening.result === "clear" ? ShieldCheck : ShieldAlert}
              size={16}
              className={screening.result === "clear" ? "text-emerald-400 mt-0.5" : "text-red-400 mt-0.5"}
            />
            <div>
              <p className={cn("text-sm font-medium", screening.result === "clear" ? "text-emerald-400" : "text-red-400")}>
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
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-1.5 rounded-md bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/15 transition-colors"
          >
            <Plus className="size-4" />
            Añadir partner
          </button>
        </div>

        {showForm && (
          <div className="border-b border-border px-5 py-4 bg-surface-2/20 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Nombre *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Tipo *</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as typeof form.type }))}
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                >
                  {Object.entries(TYPE_LABEL).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Región</label>
                <input
                  value={form.region}
                  onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))}
                  placeholder="p.ej. Asia-Pacífico"
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Servicios (separados por coma)</label>
                <input
                  value={form.services}
                  onChange={(e) => setForm((f) => ({ ...f, services: e.target.value }))}
                  placeholder="FCL, LCL, Air Freight"
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Email contacto</label>
                <input
                  type="email"
                  value={form.contactEmail}
                  onChange={(e) => setForm((f) => ({ ...f, contactEmail: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">NIF / VAT</label>
                <input
                  value={form.taxId}
                  onChange={(e) => setForm((f) => ({ ...f, taxId: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
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
              <button
                onClick={handleCreate}
                disabled={pending || !form.name.trim()}
                className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {pending ? <Loader2 className="size-4 animate-spin" /> : null}
                Guardar
              </button>
            </div>
          </div>
        )}

        {partners.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <Icon icon={Building2} size={28} className="text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground/60">Sin partners registrados</p>
          </div>
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
                      <span className="rounded-full px-2 py-0.5 font-mono text-xs text-muted-foreground/50 bg-muted/30">Inactivo</span>
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
                  className="shrink-0 rounded-md p-1.5 text-muted-foreground/40 hover:text-accent hover:bg-accent/10 transition-colors"
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
