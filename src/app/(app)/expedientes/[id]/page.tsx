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
import { RouteMap } from "@/components/app/route-map";
import { DocumentUpload } from "@/components/app/document-upload";
import { AiExtractionPanel } from "@/components/app/ai-extraction-panel";
import { PdfViewer } from "@/components/app/pdf-viewer";
import { HsCodeSuggest } from "@/components/app/hs-code-suggest";
import {
  MODE,
  PARTY_ROLE,
  CHARGE_TYPE,
  DOC_TYPE,
  portLabel,
  formatDate,
  formatMoney,
  formatWeight,
  estimateCo2,
  formatCo2,
} from "@/lib/erp-format";
import { portImageUrl } from "@/lib/port-images";
import { cn } from "@/lib/utils";

const CARRIER_COLORS: Record<string, string> = {
  MSC:          "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  MAERSK:       "bg-blue-600/10 text-blue-700 dark:text-blue-400",
  "CMA CGM":    "bg-red-500/10 text-red-600 dark:text-red-400",
  "HAPAG-LLOYD":"bg-orange-500/10 text-orange-600 dark:text-orange-400",
  COSCO:        "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  EVERGREEN:    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  YANG_MING:    "bg-purple-500/10 text-purple-600 dark:text-purple-400",
};

function CarrierBadge({ carrier }: { carrier: string }) {
  const cls = CARRIER_COLORS[carrier.toUpperCase()] ?? "bg-muted text-muted-foreground";
  return (
    <span className={cn("rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide", cls)}>
      {carrier}
    </span>
  );
}

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
  const totalWeightKg = s.cargoLines.reduce((sum, l) => sum + (l.grossWeightKg ?? 0), 0);
  const co2 = estimateCo2(s.pol, s.pod, s.mode, totalWeightKg);
  const pol3    = s.pol?.slice(-3) ?? "???";
  const pod3    = s.pod?.slice(-3) ?? "???";
  const polCity = portLabel(s.pol).split(" · ")[0];
  const podCity = portLabel(s.pod).split(" · ")[0];
  const etaOverdue =
    s.eta &&
    new Date(s.eta) < new Date() &&
    ["confirmado", "en_transito", "en_aduana"].includes(s.status);

  return (
    <div className="space-y-5">
      <Link
        href="/expedientes"
        prefetch={false}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <Icon icon={ArrowLeft} size={15} /> Expedientes
      </Link>

      {/* ── Cabecera boarding pass ──────────────────────────────────── */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">

        {/* Foto de destino */}
        <div className="relative h-[180px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={portImageUrl(s.pod ?? "")}
            alt={podCity}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 px-6 pb-3">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <p className="font-mono text-[8px] uppercase tracking-[0.15em] text-white">Origen</p>
                <p className="font-display text-[1.9rem] font-bold leading-none tracking-tighter text-white">{pol3}</p>
                <p className="mt-0.5 font-mono text-[10px] text-white/80">{polCity}</p>
              </div>
              <Icon icon={MoveRight} size={14} className="shrink-0 text-white/40" />
              <div className="flex-1 text-right">
                <p className="font-mono text-[8px] uppercase tracking-[0.15em] text-white">Destino</p>
                <p className="font-display text-[1.9rem] font-bold leading-none tracking-tighter text-white">{pod3}</p>
                <p className="mt-0.5 font-mono text-[10px] text-white/80">{podCity}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Divisor */}
        <div className="mx-6 border-t border-dashed border-border/70" />

        {/* Info */}
        <div className="px-6 pb-5 pt-4">

          {/* Referencia + naviera + estado */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-mono text-xs text-muted-foreground">Expediente</p>
              <h1 className="font-display text-3xl font-medium tracking-tight text-foreground">
                {s.reference}
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill status={s.status} />
              <PriorityPill priority={s.priority} />
              {etaOverdue && (
                <span className="inline-flex items-center rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-medium text-accent">
                  ETA vencida
                </span>
              )}
              {s.carrier && <CarrierBadge carrier={s.carrier} />}
            </div>
          </div>

          {/* Modo + buque */}
          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
            <Icon icon={mode.icon} size={15} />
            <span>{mode.label}</span>
            {s.vessel && <><span>·</span><span>{s.vessel}</span></>}
            {s.voyage && <span>({s.voyage})</span>}
          </div>

          {/* Hechos clave */}
          <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4 border-t border-border pt-4 sm:grid-cols-3 lg:grid-cols-5">
            <Fact label="BL nº" value={s.blNumber} mono />
            <Fact label="Incoterm" value={s.incoterm} />
            <Fact label="Condiciones" value={s.freightTerms} />
            <Fact label="ETD" value={formatDate(s.etd)} />
            <Fact label="ETA" value={formatDate(s.eta)} />
            {co2 && (
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  CO₂ estimado
              </dt>
              <dd className="mt-0.5 font-sans text-sm text-foreground">
                {formatCo2(co2)}
                <span className="ml-1.5 text-[10px] text-muted-foreground">
                  · {Math.round(co2.distanceKm).toLocaleString("es-ES")} km
                </span>
              </dd>
              <p className="mt-0.5 text-[10px] text-ink-subtle">GLEC · estimación</p>
            </div>
          )}
          </dl>
        </div>
      </div>

      {/* Borrador: guía al wow desde cero */}
      {s.status === "borrador" && (
        <div className="flex items-start gap-2.5 rounded-md border border-accent bg-accent-soft px-4 py-3">
          <Icon icon={Sparkles} size={16} className="mt-0.5 shrink-0 text-accent" />
          <p className="text-sm leading-relaxed text-foreground">
            Expediente en borrador. Arrastra el Bill of Lading en{" "}
            <strong className="font-medium">Documentos</strong> y la IA rellenará
            naviera, puertos, partes, contenedor y mercancía. Tú confirmas.
          </p>
        </div>
      )}

      {/* cuerpo en dos columnas */}
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Documents documents={s.documents} shipmentId={s.id} />
          <Parties parties={s.parties} />
          <Containers containers={s.containers} cargo={s.cargoLines} mode={s.mode} />
          <Charges charges={s.charges} />
        </div>

        <div className="space-y-5">
          <Panel title="Tracking" icon={MapPinned}>
            <RouteMap pol={s.pol} pod={s.pod} events={s.trackingEvents} />
            <p className="mb-4 mt-2 flex items-center gap-1.5 text-[12px] text-ink-subtle">
              <span className="size-1.5 rounded-full bg-muted-foreground" />
              Simulación · el tracking en vivo (ShipsGo) se conecta en producción
            </p>
            <TrackingTimeline events={s.trackingEvents} />
          </Panel>
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
      <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </dt>
      <dd className={cn("mt-0.5 text-sm text-foreground", mono ? "font-mono" : "font-sans")}>
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
  if (!parties.length) {
    return (
      <Panel title="Partes" icon={Users}>
        <p className="text-sm text-muted-foreground">
          Aún sin partes — se rellenan al confirmar la extracción del BL.
        </p>
      </Panel>
    );
  }

  return (
    <Panel title="Partes" icon={Users}>
      <div className="grid gap-3 sm:grid-cols-2">
        {sorted.map((p) => (
          <div key={p.id} className="rounded-md border border-border bg-background p-3">
            <p className="font-mono text-[12px] uppercase tracking-wide text-muted-foreground">
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
  mode,
}: {
  containers: ShipmentDetail["containers"];
  cargo: ShipmentDetail["cargoLines"];
  mode: string;
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
          {mode === "aereo"
            ? "Carga aérea — sin contenedor."
            : "Sin contenedores todavía."}
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
                {!line.hsCode && <HsCodeSuggest cargoLineId={line.id} />}
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
                    <p className="font-mono text-[12px] uppercase tracking-wide text-muted-foreground">
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
      {/* Upload zone — lo primero, visible siempre */}
      <DocumentUpload shipmentId={shipmentId} />

      {/* Lista de documentos — aparece debajo al subir el primero */}
      {documents.length > 0 && (
        <div className="mt-3 space-y-2">
          {documents.map((d) => {
            const dot = d.filename.lastIndexOf(".");
            const base = dot > 0 ? d.filename.slice(0, dot) : d.filename;
            const ext = dot > 0 ? d.filename.slice(dot) : "";
            return (
              <div key={d.id}>
                {/* Fila horizontal: nombre de archivo + CTA inline */}
                <div className="flex items-center gap-3 rounded-md border border-border bg-background px-3 py-2.5">
                  <Icon
                    icon={FileText}
                    size={15}
                    className="shrink-0 text-muted-foreground"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="flex min-w-0 items-baseline font-mono text-xs text-foreground">
                      <span className="truncate">{base}</span>
                      <span className="shrink-0">{ext}</span>
                    </p>
                    <p className="text-[12px] text-muted-foreground">
                      {DOC_TYPE[d.type] ?? d.type}
                    </p>
                  </div>
                  {d.blobUrl && (
                    <AiExtractionPanel
                      documentId={d.id}
                      status={d.status}
                      extraction={d.extraction}
                      compact
                    />
                  )}
                </div>
                {/* Vista previa inline del PDF */}
                {d.blobUrl && (
                  <PdfViewer url={d.blobUrl} filename={d.filename} />
                )}
                {/* Panel expandido — propuesta pendiente o tarjeta de confirmación */}
                {d.blobUrl && (d.status === "extracted" || d.status === "confirmed") && (
                  <AiExtractionPanel
                    documentId={d.id}
                    status={d.status}
                    extraction={d.extraction}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </Panel>
  );
}
