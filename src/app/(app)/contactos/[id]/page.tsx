import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Mail, Phone, CreditCard, TrendingUp } from "lucide-react";
import { getOrgContext, getContactById, getContactHistory, getContactGPStats } from "@/lib/erp";
import { Icon } from "@/components/icon";
import { StatusPill } from "@/components/app/status-pill";
import { cn } from "@/lib/utils";

const ROLE_LABEL: Record<string, string> = {
  shipper: "Exportador", consignee: "Importador", notify: "Notificado",
  carrier: "Naviera", agent: "Agente", forwarder: "Transitario",
};
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function formatMoney(n: number | string | null) {
  const v = Number(n);
  if (isNaN(v)) return "—";
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(v);
}

function formatDate(d: Date | string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
}

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();

  const ctx = await getOrgContext();
  if (!ctx?.org) notFound();

  const c = await getContactById(id, ctx.org.id);
  if (!c) notFound();

  const [history, stats] = await Promise.all([
    getContactHistory(c.name, ctx.org.id),
    getContactGPStats(c.name, ctx.org.id),
  ]);

  const gpVal = Number(stats.totalGP);
  const revVal = Number(stats.totalRevenue);
  const margin = revVal > 0 ? ((gpVal / revVal) * 100).toFixed(1) : null;

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link href="/contactos" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <Icon icon={ArrowLeft} size={14} />
        Volver a contactos
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            {ROLE_LABEL[c.role] ?? c.role}
          </p>
          <h1 className="mt-1 font-display text-2xl font-medium tracking-tight text-foreground">{c.name}</h1>
          {!c.active && (
            <span className="mt-1 inline-block rounded-full border border-border px-2 py-0.5 font-mono text-xs text-muted-foreground">
              Inactivo
            </span>
          )}
        </div>
        <Link
          href="/contactos?tab=contactos"
          className="rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          Volver y editar
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-4">
        {[
          { label: "Expedientes", value: String(stats.totalExpedientes ?? 0) },
          { label: "GP acumulado", value: formatMoney(gpVal) },
          { label: "Ingresos", value: formatMoney(revVal) },
          { label: "Margen GP", value: margin ? `${margin}%` : "—" },
        ].map(({ label, value }) => (
          <div key={label} className="bg-card px-5 py-4">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
            <p className="mt-1 font-display text-xl font-semibold text-foreground">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_280px]">
        {/* Historial */}
        <div className="space-y-3">
          <h2 className="font-display text-base font-medium text-foreground">Expedientes recientes</h2>
          {history.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border px-5 py-8 text-center">
              <p className="text-sm text-muted-foreground">
                Sin expedientes — el historial aparece cuando este contacto es parte de un envío.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/60 overflow-hidden rounded-xl border border-border bg-card">
              {history.map((s) => {
                const gp = Number(s.gp);
                return (
                  <Link
                    key={s.id}
                    href={`/expedientes/${s.id}`}
                    className="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-surface-2/40"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{s.reference}</p>
                      <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                        {[s.pol?.slice(-3), s.pod?.slice(-3)].filter(Boolean).join(" → ")}
                        {s.eta ? ` · ETA ${formatDate(s.eta)}` : ""}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className={cn(
                        "font-mono text-sm",
                        gp > 0 ? "text-foreground" : gp < 0 ? "text-accent" : "text-muted-foreground",
                      )}>
                        {gp !== 0 ? formatMoney(gp) : "—"}
                      </span>
                      <StatusPill status={s.status} />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Ficha */}
        <div className="space-y-3">
          <h2 className="font-display text-base font-medium text-foreground">Datos del contacto</h2>
          <div className="divide-y divide-border/60 overflow-hidden rounded-xl border border-border bg-card">
            {c.taxId && (
              <div className="flex items-center gap-3 px-4 py-3">
                <Icon icon={CreditCard} size={14} className="shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">NIF / EORI</p>
                  <p className="mt-0.5 truncate font-mono text-sm text-foreground">{c.taxId}</p>
                </div>
              </div>
            )}
            {c.email && (
              <div className="flex items-center gap-3 px-4 py-3">
                <Icon icon={Mail} size={14} className="shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Email</p>
                  <p className="mt-0.5 truncate text-sm text-foreground">{c.email}</p>
                </div>
              </div>
            )}
            {c.phone && (
              <div className="flex items-center gap-3 px-4 py-3">
                <Icon icon={Phone} size={14} className="shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Teléfono</p>
                  <p className="mt-0.5 text-sm text-foreground">{c.phone}</p>
                </div>
              </div>
            )}
            {(c.city || c.country) && (
              <div className="flex items-center gap-3 px-4 py-3">
                <Icon icon={MapPin} size={14} className="shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Ubicación</p>
                  <p className="mt-0.5 text-sm text-foreground">{[c.city, c.country].filter(Boolean).join(", ")}</p>
                </div>
              </div>
            )}
            {c.creditLimit && (
              <div className="flex items-center gap-3 px-4 py-3">
                <Icon icon={TrendingUp} size={14} className="shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Límite crédito</p>
                  <p className="mt-0.5 text-sm text-foreground">{formatMoney(c.creditLimit)}</p>
                </div>
              </div>
            )}
            {c.notes && (
              <div className="px-4 py-3">
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Notas</p>
                <p className="mt-0.5 whitespace-pre-wrap text-sm text-foreground">{c.notes}</p>
              </div>
            )}
            {!c.taxId && !c.email && !c.phone && !c.city && !c.country && !c.creditLimit && !c.notes && (
              <div className="px-4 py-4 text-center">
                <p className="text-sm text-muted-foreground">Sin datos adicionales registrados</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
