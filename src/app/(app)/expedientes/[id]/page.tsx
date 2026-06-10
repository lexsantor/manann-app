import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  MoveRight,
  Container as ContainerIcon,
  Boxes,
  Users,
  Receipt,
  MapPinned,
  FileText,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import { getOrgContext, getShipmentDetail, type ShipmentDetail } from "@/lib/erp";
import { Icon } from "@/components/icon";
import { StatusPill } from "@/components/app/status-pill";
import { PriorityPill } from "@/components/app/priority-pill";
import { TrackingTimeline } from "@/components/app/tracking-timeline";
import { DocumentUpload } from "@/components/app/document-upload";
import { AiExtractionPanel } from "@/components/app/ai-extraction-panel";
import {
  MODE,
  PARTY_ROLE,
  CHARGE_TYPE,
  DOC_TYPE,
  portLabel,
  formatDate,
  formatMoney,
  formatWeight,
} from "@/lib/erp-format";
import { cn } from "@/lib/utils";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function ExpedienteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // Validar formato antes de tocar la DB (id malformado → 404 limpio, no 500).
  if (!UUID_RE.test(id)) notFound();

  const ctx = await getOrgContext();
  if (!ctx?.org) notFound();

  const s = await getShipmentDetail(ctx.org.id, id);
  if (!s) notFound();

  const mode = MODE[s.mode] ?? MODE.maritimo;

  return (
    <div className="space-y-5">
      <Link
        href="/expedientes"
        prefetch={false}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <Icon icon={ArrowLeft} size={15} /> Expedientes
      </Link>

      {/* Panel cabecera del expediente (rounded-xl) */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-mono text-xs text-muted-foreground">Expediente</p>
            <h1 className="font-display text-3xl font-medium tracking-tight text-foreground">
              {s.reference}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <StatusPill status={s.status} />
            <PriorityPill priority={s.priority} />
          </div>
        </div>

        {/* ruta */}
        <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-foreground">
          <Icon icon={mode.icon} size={18} className="text-muted-foreground" />
          <span className="font-medium">{portLabel(s.pol)}</span>
          <Icon icon={MoveRight} size={16} className="text-ink-subtle" />
          <span className="font-medium">{portLabel(s.pod)}</span>
          <span className="text-muted-foreground">
            · {mode.label}
            {s.carrier ? ` · ${s.carrier}` : ""}
            {s.vessel ? ` · ${s.vessel}` : ""}
            {s.voyage ? ` (${s.voyage})` : ""}
          </span>
        </div>

        {/* hechos clave */}
        <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 border-t border-border pt-5 sm:grid-cols-3 lg:grid-cols-5">
          <Fact label="BL nº" value={s.blNumber} mono />
          <Fact label="Incoterm" value={s.incoterm} />
          <Fact label="Condiciones" value={s.freightTerms} />
          <Fact label="ETD" value={formatDate(s.etd)} mono />
          <Fact label="ETA" value={formatDate(s.eta)} mono />
        </dl>
      </div>

      {/* cuerpo en dos columnas */}
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Parties parties={s.parties} />
          <Containers containers={s.containers} cargo={s.cargoLines} />
          <Charges charges={s.charges} />
        </div>

        <div className="space-y-5">
          <Panel title="Tracking" icon={MapPinned}>
            <TrackingTimeline events={s.trackingEvents} />
          </Panel>
          <Documents documents={s.documents} shipmentId={s.id} />
        </div>
      </div>
    </div>
  );
}

// ─── Bloques ────────────────────────────────────────────────────────────────

function Panel({
  title,
  icon,
  children,
}: {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <div className="mb-4 flex items-center gap-2">
        <Icon icon={icon} size={16} className="text-muted-foreground" />
        <h2 className="font-display text-base font-medium tracking-tight text-foreground">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function Fact({
  label,
  value,
  mono,
}: {
  label: string;
  value: string | null;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className={cn("mt-0.5 text-sm text-foreground", mono && "font-mono")}>
        {value ?? "—"}
      </dd>
    </div>
  );
}

function Parties({ parties }: { parties: ShipmentDetail["parties"] }) {
  const order = ["shipper", "consignee", "notify"];
  const sorted = [...parties].sort(
    (a, b) => order.indexOf(a.role) - order.indexOf(b.role),
  );
  return (
    <Panel title="Partes" icon={Users}>
      <div className="grid gap-3 sm:grid-cols-2">
        {sorted.map((p) => (
          <div key={p.id} className="rounded-md border border-border bg-background p-3">
            <p className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
              {PARTY_ROLE[p.role] ?? p.role}
            </p>
            <p className="mt-0.5 text-sm font-medium text-foreground">{p.name}</p>
            <p className="text-xs text-muted-foreground">
              {[p.city, p.country].filter(Boolean).join(", ")}
              {p.taxId ? ` · ${p.taxId}` : ""}
            </p>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function Containers({
  containers,
  cargo,
}: {
  containers: ShipmentDetail["containers"];
  cargo: ShipmentDetail["cargoLines"];
}) {
  return (
    <Panel title="Contenedores y mercancía" icon={ContainerIcon}>
      {containers.length > 0 ? (
        <div className="space-y-2">
          {containers.map((c) => (
            <div
              key={c.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-background px-3 py-2.5"
            >
              <div className="flex items-center gap-2">
                <Icon icon={ContainerIcon} size={15} className="text-muted-foreground" />
                <span className="font-mono text-sm text-foreground">
                  {c.containerNumber}
                </span>
                <span className="rounded-sm bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                  {c.isoType}
                </span>
              </div>
              <div className="flex items-center gap-3 font-mono text-xs text-muted-foreground">
                {c.sealNumber && <span>precinto {c.sealNumber}</span>}
                <span>{formatWeight(c.grossWeightKg)}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Carga aérea — sin contenedor.
        </p>
      )}

      {cargo.length > 0 && (
        <div className="mt-4 space-y-2 border-t border-border pt-4">
          {cargo.map((line) => (
            <div key={line.id} className="flex items-start gap-2.5">
              <Icon icon={Boxes} size={15} className="mt-0.5 shrink-0 text-ink-subtle" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-foreground">{line.description}</p>
                <p className="font-mono text-xs text-muted-foreground">
                  {line.packages} {line.packageType}
                  {line.hsCode ? ` · HS ${line.hsCode}` : ""}
                  {line.grossWeightKg ? ` · ${formatWeight(line.grossWeightKg)}` : ""}
                  {line.volumeCbm ? ` · ${line.volumeCbm} m³` : ""}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

function Charges({ charges }: { charges: ShipmentDetail["charges"] }) {
  const total = charges.reduce((sum, c) => sum + Number(c.amount), 0);
  const currency = charges[0]?.currency ?? "EUR";
  // Solo sumamos a un total si todos los cargos comparten divisa.
  const mixedCurrency = new Set(charges.map((c) => c.currency)).size > 1;

  return (
    <Panel title="Cargos" icon={Receipt}>
      {charges.length > 0 ? (
        <div className="divide-y divide-border">
          {charges.map((c) => {
            const typeLabel = CHARGE_TYPE[c.type] ?? c.type;
            // Sub-etiqueta sin duplicar: el tipo solo si hay descripción propia.
            const sub = [
              c.description ? typeLabel : null,
              c.payableBy
                ? `paga ${PARTY_ROLE[c.payableBy] ?? c.payableBy}`
                : null,
            ]
              .filter(Boolean)
              .join(" · ");
            return (
              <div
                key={c.id}
                className="flex items-center justify-between gap-3 py-2 first:pt-0"
              >
                <div className="min-w-0">
                  <p className="text-sm text-foreground">
                    {c.description || typeLabel}
                  </p>
                  {sub && (
                    <p className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
                      {sub}
                    </p>
                  )}
                </div>
                <span className="shrink-0 font-mono text-sm text-foreground">
                  {formatMoney(c.amount, c.currency)}
                </span>
              </div>
            );
          })}
          <div className="flex items-center justify-between pt-3">
            <span className="text-sm font-medium text-foreground">Total</span>
            <span className="font-mono text-sm font-medium text-foreground">
              {mixedCurrency ? "Varias divisas" : formatMoney(String(total), currency)}
            </span>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Sin cargos registrados.</p>
      )}
    </Panel>
  );
}

function Documents({
  documents,
  shipmentId,
}: {
  documents: ShipmentDetail["documents"];
  shipmentId: string;
}) {
  return (
    <Panel title="Documentos" icon={FileText}>
      {documents.length > 0 ? (
        <div className="space-y-3">
          {documents.map((d) => (
            <div key={d.id}>
              <div className="flex items-center justify-between gap-2 rounded-md border border-border bg-background px-3 py-2">
                <div className="flex min-w-0 items-center gap-2">
                  <Icon icon={FileText} size={15} className="shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="truncate font-mono text-xs text-foreground">
                      {d.filename}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {DOC_TYPE[d.type] ?? d.type}
                    </p>
                  </div>
                </div>
                {d.aiConfidence && (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-sm bg-accent-soft px-1.5 py-0.5 font-mono text-[10px] text-accent">
                    <Icon icon={Sparkles} size={11} /> IA · {Number(d.aiConfidence).toFixed(2)}
                  </span>
                )}
              </div>
              {d.blobUrl && (
                <AiExtractionPanel
                  documentId={d.id}
                  status={d.status}
                  extraction={d.extraction}
                />
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Sin documentos.</p>
      )}

      <DocumentUpload shipmentId={shipmentId} />
    </Panel>
  );
}
