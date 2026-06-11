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
import { StatusTimeline } from "@/components/app/status-timeline";
import { DemoTour } from "@/components/app/demo-tour";
import { PrintButton } from "@/components/app/print-button";
import { NotesPanel } from "@/components/app/notes-panel";
import { InlineField } from "@/components/app/inline-field";
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
      <div className="flex items-center justify-between print:hidden">
        <Link
          href="/expedientes"
          prefetch={false}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <Icon icon={ArrowLeft} size={15} /> Expedientes
        </Link>
        <div className="flex items-center gap-2">
          <DemoTour />
          <PrintButton />
        </div>
      </div>

      {/* ── Cabecera bento ──────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">

        {/* Fila 1: imagen · origen · destino · expediente */}
        <div className="flex flex-col lg:grid lg:grid-cols-4">
          {/* Imagen: ancho completo en mobile, primera columna en desktop */}
          <div className="flex min-h-[192px] flex-col border-b border-border lg:min-h-[160px] lg:border-b-0 lg:border-r lg:border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={portImageUrl(s.pod ?? "")}
              alt={podCity}
              className="min-h-0 w-full flex-1 object-cover"
            />
          </div>
          {/* Origen + Destino: 2 col en mobile, display:contents en desktop */}
          <div className="grid grid-cols-2 border-b border-border lg:contents">
            <div className="relative border-r border-border p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Origen</p>
              <p className="mt-1 font-display text-4xl font-bold leading-none tracking-tighter text-foreground ai-reveal" style={{ "--i": 0 } as React.CSSProperties}>{pol3}</p>
              <p className="mt-1.5 font-mono text-xs text-muted-foreground ai-reveal" style={{ "--i": 1 } as React.CSSProperties}>{polCity}</p>
              <div className="absolute right-0 top-1/2 z-10 -translate-y-1/2 translate-x-1/2 rounded-full bg-card px-0.5">
                <Icon icon={MoveRight} size={12} className="text-muted-foreground/40" />
              </div>
            </div>
            <div className="p-5 lg:border-r lg:border-border">
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Destino</p>
              <p className="mt-1 font-display text-4xl font-bold leading-none tracking-tighter text-foreground ai-reveal" style={{ "--i": 2 } as React.CSSProperties}>{pod3}</p>
              <p className="mt-1.5 font-mono text-xs text-muted-foreground ai-reveal" style={{ "--i": 3 } as React.CSSProperties}>{podCity}</p>
            </div>
          </div>
          {/* Expediente: ancho completo en mobile, última columna en desktop */}
          <div className="p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Expediente</p>
            <h1 className="mt-1 font-display text-xl font-medium tracking-tight text-foreground">{s.reference}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
              <Icon icon={mode.icon} size={12} />
              <span>{mode.label}</span>
              {s.vessel && <><span>·</span><span className="truncate">{s.vessel}</span></>}
              {s.voyage && <span className="shrink-0 text-ink-subtle">({s.voyage})</span>}
            </div>
          </div>
        </div>

        <div className="border-t border-dashed border-border/70" />

        {/* Fila 2: BL · Incoterm · Condiciones · ETD→ETA */}
        <div className="grid grid-cols-2 lg:grid-cols-4">
          <div className="p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">BL</p>
            <div className="mt-1.5 ai-reveal" style={{ "--i": 0 } as React.CSSProperties}>
              <InlineField shipmentId={s.id} field="blNumber" value={s.blNumber} mono />
            </div>
          </div>
          <div className="border-l border-border p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Incoterm</p>
            <div className="mt-1.5 ai-reveal" style={{ "--i": 1 } as React.CSSProperties}>
              <InlineField shipmentId={s.id} field="incoterm" value={s.incoterm} />
            </div>
          </div>
          <div className="p-5 lg:border-l lg:border-border">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Condiciones</p>
            <div className="mt-1.5 ai-reveal" style={{ "--i": 2 } as React.CSSProperties}>
              <InlineField shipmentId={s.id} field="freightTerms" value={s.freightTerms} />
            </div>
          </div>
          <div className="border-l border-border p-5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">ETD</p>
                <p className="mt-1.5 font-sans text-sm text-foreground ai-reveal" style={{ "--i": 3 } as React.CSSProperties}>{formatDate(s.etd)}</p>
              </div>
              <Icon icon={MoveRight} size={13} className="mt-4 shrink-0 text-muted-foreground/30" />
              <div className="flex-1 text-right">
                <div className="flex items-center justify-end gap-1">
                  <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">ETA</p>
                  {etaOverdue && (
                    <span className="rounded-sm bg-accent/15 px-1 py-0.5 font-mono text-[8px] font-semibold uppercase tracking-wide text-accent">
                      Vencida
                    </span>
                  )}
                </div>
                <p className={cn("mt-1.5 font-sans text-sm ai-reveal", etaOverdue ? "text-accent" : "text-foreground")} style={{ "--i": 4 } as React.CSSProperties}>
                  {formatDate(s.eta)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-dashed border-border/70" />

        {/* Fila 3: Estado · Prioridad · Naviera · CO₂ */}
        <div className="grid grid-cols-2 lg:grid-cols-4">
          <div className="p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Estado</p>
            <div className="mt-2"><StatusPill status={s.status} /></div>
          </div>
          <div className="border-l border-border p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Prioridad</p>
            <div className="mt-2"><PriorityPill priority={s.priority} /></div>
          </div>
          <div className="p-5 lg:border-l lg:border-border">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Naviera</p>
            <div className="mt-2 ai-reveal" style={{ "--i": 0 } as React.CSSProperties}>
              <InlineField shipmentId={s.id} field="carrier" value={s.carrier} />
            </div>
          </div>
          <div className="border-l border-border p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">CO₂ estimado</p>
            {co2 ? (
              <>
                <p className="mt-1.5 font-sans text-sm font-medium text-foreground">{formatCo2(co2)}</p>
                <p className="mt-0.5 text-[10px] text-ink-subtle">{Math.round(co2.distanceKm).toLocaleString("es-ES")} km · GLEC</p>
              </>
            ) : (
              <p className="mt-1.5 font-sans text-sm text-muted-foreground">—</p>
            )}
          </div>
        </div>

        <div className="border-t border-dashed border-border/70" />
        <StatusTimeline status={s.status} />
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
            <p className="mb-4 mt-2 flex items-center gap-1.5 text-xs text-ink-subtle">
              <span className="size-1.5 rounded-full bg-muted-foreground" />
              Simulación · el tracking en vivo (ShipsGo) se conecta en producción
            </p>
            <TrackingTimeline events={s.trackingEvents} />
          </Panel>
          <NotesPanel shipmentId={s.id} initialNotes={s.notes ?? null} />
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
    <section className="rounded-xl border border-border bg-card p-5">
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
        {sorted.map((p, idx) => (
          <div key={p.id} className="rounded-md border border-border/60 bg-surface-2/40 p-3 transition-colors hover:bg-surface-2 ai-reveal" style={{ "--i": idx } as React.CSSProperties}>
            <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
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
          {containers.map((c, idx) => (
            <div
              key={c.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border/60 bg-surface-2/40 px-3 py-2.5 transition-colors hover:bg-surface-2 ai-reveal"
              style={{ "--i": idx } as React.CSSProperties}
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
                    <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
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
                <div className="flex items-center gap-3 rounded-md border border-border/60 bg-surface-2/40 px-3 py-2.5 transition-colors hover:bg-surface-2">
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
                    <p className="text-xs text-muted-foreground">
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
