"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Download, MapPin } from "lucide-react";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";
import { createContact, updateContact, deleteContact, importContactsAction } from "@/lib/erp-actions";
import type { ContactWithGP } from "@/lib/erp";

const ROLE_LABEL: Record<string, string> = {
  shipper: "Exportador", consignee: "Importador", notify: "Notificado",
  carrier: "Naviera", agent: "Agente", forwarder: "Transitario",
};
const ROLE_COLOR: Record<string, string> = {
  shipper: "text-sky-600 bg-sky-500/10",
  consignee: "text-primary bg-primary/10",
  notify: "text-muted-foreground bg-muted/60",
  carrier: "text-violet-600 bg-violet-500/10",
  agent: "text-orange-600 bg-orange-500/10",
  forwarder: "text-emerald-600 bg-emerald-500/10",
};
const ROLE_OPTIONS = [
  { value: "consignee", label: "Consignatario (Importador)" },
  { value: "shipper", label: "Embarcador (Exportador)" },
  { value: "notify", label: "Notificado (Notify)" },
  { value: "carrier", label: "Naviera" },
  { value: "agent", label: "Agente" },
  { value: "forwarder", label: "Transitario" },
];
const ROLES = ["shipper", "consignee", "carrier", "agent", "forwarder", "notify"];

function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((w) => w[0] ?? "").join("").toUpperCase();
}

function formatGP(n: number | string) {
  const v = Number(n);
  if (isNaN(v)) return "—";
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(v);
}

type FormMode = { type: "create" } | { type: "edit"; contact: ContactWithGP } | null;

interface ContactFormProps {
  mode: FormMode;
  onClose: () => void;
}

function ContactForm({ mode, onClose }: ContactFormProps) {
  const [pending, start] = useTransition();
  const c = mode?.type === "edit" ? mode.contact : null;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    start(async () => {
      if (mode?.type === "edit") {
        await updateContact(mode.contact.id, fd);
      } else {
        await createContact(fd);
      }
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-xl border border-border bg-card shadow-2xl">
        <div className="border-b border-border px-6 py-4">
          <p className="font-display text-base font-medium text-foreground">
            {mode?.type === "edit" ? "Editar contacto" : "Nuevo contacto"}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Nombre *</label>
              <input name="name" required defaultValue={c?.name} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary/60" />
            </div>
            <div>
              <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Rol *</label>
              <select name="role" defaultValue={c?.role ?? "consignee"} className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-base text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-colors">
                {ROLE_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">NIF / EORI</label>
              <input name="taxId" defaultValue={c?.taxId ?? ""} placeholder="B12345678" className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/60" />
            </div>
            <div>
              <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Email</label>
              <input name="email" type="email" defaultValue={c?.email ?? ""} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary/60" />
            </div>
            <div>
              <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Teléfono</label>
              <input name="phone" defaultValue={c?.phone ?? ""} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary/60" />
            </div>
            <div>
              <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Ciudad</label>
              <input name="city" defaultValue={c?.city ?? ""} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary/60" />
            </div>
            <div>
              <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">País (ISO)</label>
              <input name="country" defaultValue={c?.country ?? ""} placeholder="ES" className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/60" />
            </div>
            <div>
              <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Límite crédito (€)</label>
              <input name="creditLimit" defaultValue={c?.creditLimit ?? ""} placeholder="50000" className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/60" />
            </div>
            <div className="col-span-2">
              <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Notas</label>
              <textarea name="notes" rows={2} defaultValue={c?.notes ?? ""} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary/60 resize-none" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="rounded-md border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground">
              Cancelar
            </button>
            <button type="submit" disabled={pending} className={cn("rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground", pending && "opacity-60")}>
              {pending ? "Guardando…" : mode?.type === "edit" ? "Guardar" : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface ContactsTabProps {
  contacts: ContactWithGP[];
}

export function ContactsTab({ contacts }: ContactsTabProps) {
  const [form, setForm] = useState<FormMode>(null);
  const [rolFilter, setRolFilter] = useState<string | null>(null);
  const [importPending, startImport] = useTransition();
  const [deletePending, startDelete] = useTransition();
  const [importResult, setImportResult] = useState<{ created: number } | null>(null);

  const activeRoles = ROLES.filter((r) => contacts.some((c) => c.role === r));
  const visible = rolFilter ? contacts.filter((c) => c.role === rolFilter) : contacts;

  function handleDelete(id: string) {
    if (!confirm("¿Eliminar este contacto?")) return;
    startDelete(async () => { await deleteContact(id); });
  }

  function handleImport() {
    startImport(async () => {
      const res = await importContactsAction();
      setImportResult(res);
    });
  }

  return (
    <>
      {form && <ContactForm mode={form} onClose={() => setForm(null)} />}

      {/* Actions header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setRolFilter(null)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors",
              !rolFilter ? "border-primary/40 bg-primary/10 text-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            Todos <span className="font-mono">{contacts.length}</span>
          </button>
          {activeRoles.map((r) => (
            <button
              key={r}
              onClick={() => setRolFilter(rolFilter === r ? null : r)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors",
                rolFilter === r ? "border-primary/40 bg-primary/10 text-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              {ROLE_LABEL[r]} <span className="font-mono">{contacts.filter((c) => c.role === r).length}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {contacts.length === 0 && (
            <button
              onClick={handleImport}
              disabled={importPending}
              className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground disabled:opacity-60"
            >
              <Icon icon={Download} size={13} />
              {importPending ? "Importando…" : "Importar desde expedientes"}
            </button>
          )}
          {importResult && (
            <span className="text-sm text-muted-foreground">
              {importResult.created} contacto{importResult.created !== 1 ? "s" : ""} importado{importResult.created !== 1 ? "s" : ""}
            </span>
          )}
          <button
            onClick={() => setForm({ type: "create" })}
            className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Icon icon={Plus} size={13} />
            Nuevo contacto
          </button>
        </div>
      </div>

      {/* Contact list */}
      {visible.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-secondary/[0.04] px-5 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            {contacts.length === 0
              ? "No hay contactos. Importa desde tus expedientes o crea uno nuevo."
              : "No hay contactos con ese rol."}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          {/* Header row */}
          <div className="hidden grid-cols-[1fr_120px_90px_100px_80px] items-center gap-4 border-b border-border px-4 py-2 sm:grid">
            {["Nombre", "Rol", "Expedientes", "GP acumulado", ""].map((h) => (
              <span key={h} className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{h}</span>
            ))}
          </div>
          {visible.map((c, i) => {
            const loc = [c.city, c.country].filter(Boolean).join(", ");
            const gpVal = Number(c.totalGP);
            const exp = Number(c.expedientes);
            return (
              <div
                key={c.id}
                className={cn(
                  "grid grid-cols-[1fr_auto] items-center gap-4 px-4 py-3 sm:grid-cols-[1fr_120px_90px_100px_80px]",
                  i !== 0 && "border-t border-border/60",
                  !c.active && "opacity-50",
                )}
              >
                {/* Name + location */}
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border font-mono text-xs font-medium text-foreground">
                    {initials(c.name)}
                  </span>
                  <div className="min-w-0">
                    <Link href={`/contactos/${c.id}`} className="truncate text-sm font-medium text-foreground hover:underline">
                      {c.name}
                    </Link>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {loc && (
                        <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                          <Icon icon={MapPin} size={10} />{loc}
                        </span>
                      )}
                      {c.taxId && <span className="font-mono text-xs text-muted-foreground">{c.taxId}</span>}
                      {!c.active && <span className="rounded-full bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">Inactivo</span>}
                    </div>
                  </div>
                </div>

                {/* Role badge */}
                <span className={cn("hidden rounded-full px-2 py-0.5 font-mono text-xs sm:inline-flex", ROLE_COLOR[c.role] ?? "text-muted-foreground bg-muted/60")}>
                  {ROLE_LABEL[c.role] ?? c.role}
                </span>

                {/* Expedientes */}
                <span className="hidden text-center font-mono text-sm text-muted-foreground sm:block">
                  {exp > 0 ? exp : "—"}
                </span>

                {/* GP */}
                <span className={cn(
                  "hidden font-mono text-sm sm:block text-right",
                  gpVal > 0 ? "text-foreground" : gpVal < 0 ? "text-accent" : "text-muted-foreground",
                )}>
                  {exp > 0 ? formatGP(gpVal) : "—"}
                </span>

                {/* Actions */}
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => setForm({ type: "edit", contact: c })}
                    className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
                    title="Editar"
                  >
                    <Icon icon={Pencil} size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    disabled={deletePending}
                    className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-accent/10 hover:text-accent disabled:opacity-40"
                    title="Eliminar"
                  >
                    <Icon icon={Trash2} size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
