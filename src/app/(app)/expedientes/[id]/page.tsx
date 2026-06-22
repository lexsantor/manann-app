import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  MoveRight,
  Container as ContainerIcon,
  Boxes,
  Users,
  MapPinned,
  FileText,
  Sparkles,
  FileKey2,
  type LucideIcon,
} from "lucide-react";

import {
  getOrgContext,
  getShipmentDetail,
  getShipmentActivity,
  getOrgMembers,
  getTrackingSubscriptions,
  getShipmentComments,
  listMasterContacts,
  getRateAverages,
  getComplianceDeclarations,
  type ShipmentDetail,
} from "@/lib/erp";
import { computeDelayRisk } from "@/lib/delay-risk";
import { BatchExtractButton } from "@/components/app/batch-extract-button";
import { Icon } from "@/components/icon";
import { StatusPill } from "@/components/app/status-pill";
import { PriorityPill } from "@/components/app/priority-pill";
import { TrackingTimeline } from "@/components/app/tracking-timeline";
import { RouteMap } from "@/components/app/route-map";
import { DocumentUpload } from "@/components/app/document-upload";
import { AiExtractionPanel } from "@/components/app/ai-extraction-panel";
import { PdfViewer } from "@/components/app/pdf-viewer";
import { ExtractionReviewModal } from "@/components/app/extraction-review-modal";
import { HsCodeSuggest } from "@/components/app/hs-code-suggest";
import { HsCodeSearch } from "@/components/app/hs-code-search";
import { StatusTimeline } from "@/components/app/status-timeline";
import { ResetDemoButton } from "@/components/app/reset-demo-button";
import { DemoTour } from "@/components/app/demo-tour";
import { PrintButton } from "@/components/app/print-button";
import { ShareButton } from "@/components/app/share-button";
import { NotesPanel } from "@/components/app/notes-panel";
import { InlineField } from "@/components/app/inline-field";
import { AiSummaryPanel } from "@/components/app/ai-summary-panel";
import { ActivityPanel } from "@/components/app/activity-panel";
import { AssigneeSelect } from "@/components/app/assignee-select";
import { ShipsGoPanel } from "@/components/app/shipsgo-panel";
import { syncTrackingEvents } from "@/lib/erp-actions";
import { FinanzasPanel } from "@/components/app/finanzas-panel";
import { HelpHint } from "@/components/ui/help-hint";
import { EmptyState } from "@/components/ui/empty-state";
import { DuaPanel } from "@/components/app/dua-panel";
import { DeclaracionesPanel } from "@/components/app/declaraciones-panel";
import { EblPanel } from "@/components/app/ebl-panel";
import { getEblForShipment } from "@/lib/tier-v-actions";
import { BookingPanel } from "@/components/app/booking-panel";
import { CourierPanel } from "@/components/app/courier-panel";
import { RailPanel } from "@/components/app/rail-panel";
import { AddPartyForm } from "@/components/app/add-party-form";
import { CommentsPanel } from "@/components/app/comments-panel";
import { DocumentCompare } from "@/components/app/document-compare";
import {
  MODE,
  PARTY_ROLE,
  DOC_TYPE,
  portLabel,
  formatDate,
  formatWeight,
  estimateCo2,
  formatCo2,
} from "@/lib/erp-format";
import { portImageUrl } from "@/lib/port-images";
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

  const shipsgoEnabled = process.env.SHIPSGO_ENABLED === "true" && Boolean(process.env.SHIPSGO_API_KEY);

  // Sincronizar eventos ShipsGo antes de cargar la página (no-op si sync < 30 min)
  if (shipsgoEnabled) await syncTrackingEvents(id);

  const [s, activity, members, trackingSubs, comments, allContacts, rateAverages, complianceDecls, shipmentEbl] = await Promise.all([
    getShipmentDetail(ctx.org.id, id),
    getShipmentActivity(ctx.org.id, id),
    getOrgMembers(ctx.org.id),
    getTrackingSubscriptions(ctx.org.id, id),
    getShipmentComments(ctx.org.id, id),
    listMasterContacts(ctx.org.id),
    getRateAverages(ctx.org.id),
    getComplianceDeclarations(ctx.org.id, id),
    getEblForShipment(id).catch(() => undefined),
  ]);
  if (!s) notFound();

  const mode = MODE[s.mode] ?? MODE.maritimo;
  const podImgUrl = portImageUrl(s.pod ?? "");
  const podImgGradient = s.mode === "aereo" ? "from-indigo-950 to-indigo-800"
    : s.mode === "terrestre" ? "from-emerald-950 to-emerald-800"
    : "from-sky-950 to-sky-800";
  const totalWeightKg = s.cargoLines.reduce((sum, l) => sum + (l.grossWeightKg ?? 0), 0);
  const co2 = estimateCo2(s.pol, s.pod, s.mode, totalWeightKg);
  const delayRisk = computeDelayRisk(s.carrier, s.pol, s.pod, s.etd ? new Date(s.etd) : null, s.mode);
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
      <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
        <Link
          href="/expedientes"
          prefetch={false}
          className="inline-flex items-center gap-1.5 text-base text-muted-foreground transition-colors hover:text-foreground"
        >
          <Icon icon={ArrowLeft} size={15} /> Expedientes
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <AssigneeSelect
            shipmentId={s.id}
            assignedTo={s.assignedTo ?? null}
            members={members}
          />
          <DemoTour />
          <ShareButton shipmentId={s.id} />
          <PrintButton />
        </div>
      </div>

      {/* ── Cabecera bento ──────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">

        {/* Fila 1: imagen · origen · destino · expediente */}
        <div className="flex flex-col lg:grid lg:grid-cols-4">
          {/* Imagen: ancho completo en mobile, primera columna en desktop */}
          <div className="relative min-h-[192px] border-b border-border lg:min-h-[160px] lg:border-b-0 lg:border-r lg:border-border">
            {podImgUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={podImgUrl}
                alt={podCity}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <>
                <div className={cn("absolute inset-0 bg-gradient-to-b", podImgGradient)} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Icon icon={mode.icon} size={48} className="text-foreground/15" />
                </div>
              </>
            )}
          </div>
          {/* Origen + Destino: 2 col en mobile, display:contents en desktop */}
          <div className="grid grid-cols-2 border-b border-border lg:contents">
            <div className="relative border-r border-border p-5">
              <p className="font-mono text-sm uppercase tracking-[0.12em] text-muted-foreground">Origen</p>
              <p className="mt-1 font-display text-4xl font-bold leading-none tracking-tighter text-foreground ai-reveal" style={{ "--i": 0 } as React.CSSProperties}>{pol3}</p>
              <p className="mt-1.5 font-mono text-base text-muted-foreground ai-reveal" style={{ "--i": 1 } as React.CSSProperties}>{polCity}</p>
              <div className="absolute right-0 top-1/2 z-10 -translate-y-1/2 translate-x-1/2 rounded-full bg-card px-0.5">
                <Icon icon={MoveRight} size={12} className="text-muted-foreground/60" />
              </div>
            </div>
            <div className="p-5 lg:border-r lg:border-border">
              <p className="font-mono text-sm uppercase tracking-[0.12em] text-muted-foreground">Destino</p>
              <p className="mt-1 font-display text-4xl font-bold leading-none tracking-tighter text-foreground ai-reveal" style={{ "--i": 2 } as React.CSSProperties}>{pod3}</p>
              <p className="mt-1.5 font-mono text-base text-muted-foreground ai-reveal" style={{ "--i": 3 } as React.CSSProperties}>{podCity}</p>
            </div>
          </div>
          {/* Expediente: ancho completo en mobile, última columna en desktop */}
          <div className="p-5">
            <p className="font-mono text-sm uppercase tracking-[0.12em] text-muted-foreground">Expediente</p>
            <h1 className="mt-1 font-display text-xl font-medium tracking-tight text-foreground">{s.reference}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-1.5 text-base text-muted-foreground">
              <Icon icon={mode.icon} size={12} />
              <span>{mode.label}</span>
              {s.vessel && <><span>·</span><span className="truncate">{s.vessel}</span></>}
              {s.voyage && <span className="shrink-0 text-ink-subtle">({s.voyage})</span>}
            </div>
            {s.loadType && s.loadType !== "fcl" && (
              <div className="mt-2">
                <span className="rounded-sm bg-muted px-1.5 py-0.5 font-mono text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  {s.loadType.toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-dashed border-border/70" />

        {/* Fila 2: BL · Incoterm · Condiciones · ETD→ETA */}
        <div className="grid grid-cols-2 lg:grid-cols-4">
          <div className="p-5">
            <p className="font-mono text-sm uppercase tracking-[0.12em] text-muted-foreground">BL</p>
            <div className="mt-1.5 ai-reveal" style={{ "--i": 0 } as React.CSSProperties}>
              <InlineField shipmentId={s.id} field="blNumber" value={s.blNumber} mono />
            </div>
          </div>
          <div className="border-l border-border p-5">
            <p className="font-mono text-sm uppercase tracking-[0.12em] text-muted-foreground">Incoterm</p>
            <div className="mt-1.5 ai-reveal" style={{ "--i": 1 } as React.CSSProperties}>
              <InlineField shipmentId={s.id} field="incoterm" value={s.incoterm} />
            </div>
          </div>
          <div className="p-5 lg:border-l lg:border-border">
            <p className="font-mono text-sm uppercase tracking-[0.12em] text-muted-foreground">Condiciones</p>
            <div className="mt-1.5 ai-reveal" style={{ "--i": 2 } as React.CSSProperties}>
              <InlineField shipmentId={s.id} field="freightTerms" value={s.freightTerms} />
            </div>
          </div>
          <div className="border-l border-border p-5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <p className="font-mono text-sm uppercase tracking-[0.12em] text-muted-foreground">ETD</p>
                <p className="mt-1.5 font-sans text-base text-foreground ai-reveal" style={{ "--i": 3 } as React.CSSProperties}>{formatDate(s.etd)}</p>
              </div>
              <Icon icon={MoveRight} size={13} className="mt-4 shrink-0 text-muted-foreground/55" />
              <div className="flex-1 text-right">
                <div className="flex items-center justify-end gap-1">
                  <p className="font-mono text-sm uppercase tracking-[0.12em] text-muted-foreground">ETA</p>
                  {etaOverdue && (
                    <span className="rounded-sm bg-accent/15 px-1 py-0.5 font-mono text-sm font-semibold uppercase tracking-wide text-accent">
                      Vencida
                    </span>
                  )}
                </div>
                <p className={cn("mt-1.5 font-sans text-base ai-reveal", etaOverdue ? "text-accent" : "text-foreground")} style={{ "--i": 4 } as React.CSSProperties}>
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
            <p className="font-mono text-sm uppercase tracking-[0.12em] text-muted-foreground">Estado</p>
            <div className="mt-2"><StatusPill status={s.status} /></div>
          </div>
          <div className="border-l border-border p-5">
            <p className="font-mono text-sm uppercase tracking-[0.12em] text-muted-foreground">Prioridad</p>
            <div className="mt-2"><PriorityPill priority={s.priority} /></div>
          </div>
          <div className="p-5 lg:border-l lg:border-border">
            <p className="font-mono text-sm uppercase tracking-[0.12em] text-muted-foreground">Naviera</p>
            <div className="mt-2 ai-reveal" style={{ "--i": 0 } as React.CSSProperties}>
              <InlineField shipmentId={s.id} field="carrier" value={s.carrier} />
            </div>
            {s.carrier && (
              <div className="mt-2">
                <span className={cn(
                  "inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 font-mono text-sm font-semibold uppercase tracking-wide",
                  delayRisk.level === "alto"
                    ? "bg-destructive/10 text-destructive"
                    : delayRisk.level === "medio"
                      ? "bg-accent/10 text-accent"
                      : "bg-success/10 text-success",
                )}>
                  Retraso {delayRisk.pct}%
                </span>
                <p className="mt-0.5 text-sm text-muted-foreground leading-snug">{delayRisk.reason}</p>
              </div>
            )}
          </div>
          <div className="border-l border-border p-5">
            <p className="font-mono text-sm uppercase tracking-[0.12em] text-muted-foreground">CO₂ estimado</p>
            {co2 ? (
              <>
                <p className="mt-1.5 font-sans text-base font-medium text-foreground">{formatCo2(co2)}</p>
                <p className="mt-0.5 text-base text-ink-subtle">{Math.round(co2.distanceKm).toLocaleString("es-ES")} km · GLEC</p>
              </>
            ) : (
              <p className="mt-1.5 font-sans text-base text-muted-foreground">—</p>
            )}
          </div>
        </div>

        <div className="border-t border-dashed border-border/70" />
        <StatusTimeline status={s.status} />
        {s.reference === "EXP-2026-0054" && (() => {
          const armed = s.documents.find((d) => d.type === "bl")?.status === "extracted";
          return (
            <div className="mt-4 flex flex-col gap-3 rounded-md border border-warning/40 bg-warning/5 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium text-warning">Modo demo</span>
                <span className="text-border">·</span>
                {armed ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2 py-0.5 text-sm font-medium text-success">
                    <span className="size-1.5 rounded-full bg-success" /> Demo lista
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-warning/15 px-2 py-0.5 text-sm font-medium text-warning">
                    <span className="size-1.5 rounded-full bg-warning" /> Consumida — reinicia antes de presentar
                  </span>
                )}
              </div>
              <ResetDemoButton />
            </div>
          );
        })()}
      </div>

      {/* Resumen ejecutivo IA (3.2) */}
      <AiSummaryPanel
        shipmentId={s.id}
        initialSummary={s.aiSummary ?? null}
        initialSummaryAt={s.aiSummaryAt ?? null}
        canGenerate={s.status !== "borrador"}
      />

      {/* Borrador: guía al wow desde cero */}
      {s.status === "borrador" && (
        <div className="flex items-start gap-2.5 rounded-md border border-accent bg-accent-soft px-4 py-3">
          <Icon icon={Sparkles} size={16} className="mt-0.5 shrink-0 text-accent" />
          <p className="text-base leading-relaxed text-foreground">
            Expediente en borrador. Arrastra el Bill of Lading en{" "}
            <strong className="font-medium">Documentos</strong> y la IA rellenará
            naviera, puertos, partes, contenedor y mercancía. Tú confirmas.
          </p>
        </div>
      )}

      {/* cuerpo en dos columnas */}
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="min-w-0 space-y-5 lg:col-span-2">
          <Documents
            documents={s.documents}
            shipmentId={s.id}
            hasBl={s.documents.some((d) => d.type === "bl" && d.blobUrl)}
            hasFactura={s.documents.some((d) => d.type === "factura_comercial" && d.blobUrl)}
          />
          <Parties parties={s.parties} shipmentId={s.id} contacts={allContacts} />
          <Containers containers={s.containers} cargo={s.cargoLines} mode={s.mode} />
          <FinanzasPanel
            shipmentId={s.id}
            charges={s.charges}
            clientName={s.parties.find((p) => p.role === "consignee")?.name ?? ""}
            rateAverages={rateAverages}
          />
          <DuaPanel
            shipmentId={s.id}
            status={s.status}
            blNumber={s.blNumber}
            incoterm={s.incoterm}
            pol={s.pol}
            pod={s.pod}
            shipper={s.parties.find((p) => p.role === "shipper")?.name}
            consignee={s.parties.find((p) => p.role === "consignee")?.name}
            hsCode={s.cargoLines.find((l) => l.hsCode)?.hsCode}
            cargoDescription={s.cargoLines[0]?.description}
            grossWeightKg={s.cargoLines.reduce((sum, l) => sum + (l.grossWeightKg ?? 0), 0) || undefined}
            packages={s.cargoLines.reduce((sum, l) => sum + (l.packages ?? 0), 0) || undefined}
          />
          <DeclaracionesPanel
            shipmentId={s.id}
            mode={s.mode}
            pol={s.pol}
            pod={s.pod}
            blNumber={s.blNumber}
            shipper={s.parties.find((p) => p.role === "shipper")?.name}
            consignee={s.parties.find((p) => p.role === "consignee")?.name}
            hsCode={s.cargoLines.find((l) => l.hsCode)?.hsCode}
            grossWeightKg={s.cargoLines.reduce((sum, l) => sum + (l.grossWeightKg ?? 0), 0) || null}
            declarations={complianceDecls}
          />
          <BookingPanel
            shipmentId={s.id}
            bookings={s.bookings ?? []}
            defaultPol={s.pol}
            defaultPod={s.pod}
            defaultCarrier={s.carrier}
            defaultVessel={s.vessel}
            defaultVoyage={s.voyage}
          />
          {s.mode === "maritimo" && (
            <Panel title="e-BL electrónico" icon={FileKey2}>
              <EblPanel shipmentId={s.id} initialEbl={shipmentEbl} />
            </Panel>
          )}
          {s.mode === "ferroviario" && (
            <RailPanel
              pol={s.pol ?? null}
              pod={s.pod ?? null}
              blNumber={s.blNumber ?? null}
            />
          )}
          {s.courierProvider && (
            <CourierPanel
              shipmentId={s.id}
              courierProvider={s.courierProvider}
              courierTrackingNumber={s.courierTrackingNumber ?? null}
              courierEstimatedDelivery={s.courierEstimatedDelivery ?? null}
            />
          )}
        </div>

        <div className="min-w-0 space-y-5">
          <Panel title="Tracking" icon={MapPinned}>
            <RouteMap pol={s.pol} pod={s.pod} events={s.trackingEvents} />
            <ShipsGoPanel
              shipmentId={s.id}
              subscriptions={trackingSubs}
              hasRealEvents={s.trackingEvents.some((e) => e.source === "shipsgo")}
              shipsgoEnabled={shipsgoEnabled}
            />
            <TrackingTimeline events={s.trackingEvents} />
          </Panel>
          <NotesPanel shipmentId={s.id} initialNotes={s.notes ?? null} />
          <Panel title="Actividad" icon={FileText}>
            <ActivityPanel
              changes={activity.map((c) => ({
                id: c.id,
                entity: c.entity,
                field: c.field,
                oldValue: c.oldValue,
                newValue: c.newValue,
                source: c.source,
                changedAt: c.changedAt,
                changedByInitials: null,
              }))}
            />
          </Panel>
          <CommentsPanel
            shipmentId={s.id}
            comments={comments}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Bloques ────────────────────────────────────────────────────────────────

function Panel({
  title,
  icon,
  help,
  children,
}: {
  title: string;
  icon: LucideIcon;
  help?: { title: string; body: string };
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center gap-2">
        <Icon icon={icon} size={16} className="text-muted-foreground" />
        <h2 className="font-display text-base font-medium tracking-tight text-foreground">
          {title}
        </h2>
        {help && <HelpHint title={help.title} body={help.body} />}
      </div>
      {children}
    </section>
  );
}


function Parties({
  parties,
  shipmentId,
  contacts,
}: {
  parties: ShipmentDetail["parties"];
  shipmentId: string;
  contacts: { id: string; name: string; role: string; taxId: string | null; city: string | null; country: string | null }[];
}) {
  const order = ["shipper", "consignee", "notify"];
  const sorted = [...parties].sort(
    (a, b) => order.indexOf(a.role) - order.indexOf(b.role),
  );

  return (
    <Panel title="Partes" icon={Users}>
      {parties.length === 0 ? (
        <EmptyState
          icon={<Users strokeWidth={1.5} />}
          title="Sin partes registradas"
          hint="Se rellenan al extraer el BL o las añades manualmente."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {sorted.map((p, idx) => (
            <div key={p.id} className="rounded-md border border-border/60 bg-surface-2/40 p-3 transition-colors hover:bg-surface-2 ai-reveal" style={{ "--i": idx } as React.CSSProperties}>
              <p className="font-mono text-sm uppercase tracking-wide text-muted-foreground">
                {PARTY_ROLE[p.role] ?? p.role}
              </p>
              <p className="mt-0.5 text-base font-medium text-foreground">{p.name}</p>
              <p className="text-base text-muted-foreground">
                {[p.city, p.country].filter(Boolean).join(", ")}
                {p.taxId ? ` · ${p.taxId}` : ""}
              </p>
            </div>
          ))}
        </div>
      )}
      <AddPartyForm shipmentId={shipmentId} contacts={contacts} />
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
                <span className="font-mono text-base text-foreground">
                  {c.containerNumber}
                </span>
                <span className="rounded-sm bg-surface-2 px-1.5 py-0.5 font-mono text-base text-muted-foreground">
                  {c.isoType}
                </span>
              </div>
              <div className="flex items-center gap-3 font-mono text-base text-muted-foreground">
                {c.sealNumber && <span>precinto {c.sealNumber}</span>}
                <span>{formatWeight(c.grossWeightKg)}</span>
                {c.vgmWeightKg && (
                  <span className="rounded-sm bg-success/10 px-1.5 py-0.5 text-sm font-medium text-success">
                    VGM {c.vgmWeightKg.toLocaleString("es-ES")} kg
                    {c.vgmMethod ? ` · M${c.vgmMethod === "method_1" ? "1" : "2"}` : ""}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<ContainerIcon strokeWidth={1.5} />}
          title={mode === "aereo" ? "Carga aérea — sin contenedor" : "Sin contenedores"}
          hint={
            mode === "aereo"
              ? "Los envíos aéreos no usan contenedor; la mercancía se detalla abajo."
              : "Se rellenan al confirmar el BL (la IA los propone) o los añades a mano."
          }
        />
      )}

      {cargo.length > 0 && (
        <div className="mt-4 space-y-2 border-t border-border pt-4">
          {cargo.map((line) => (
            <div key={line.id} className="flex items-start gap-2.5">
              <Icon icon={Boxes} size={15} className="mt-0.5 shrink-0 text-ink-subtle" />
              <div className="min-w-0 flex-1">
                <p className="text-base text-foreground">{line.description}</p>
                <p className="font-mono text-base text-muted-foreground">
                  {line.packages} {line.packageType}
                  {line.hsCode ? ` · HS ${line.hsCode}` : ""}
                  {line.grossWeightKg ? ` · ${formatWeight(line.grossWeightKg)}` : ""}
                  {line.volumeCbm ? ` · ${line.volumeCbm} m³` : ""}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  {!line.hsCode && <HsCodeSuggest cargoLineId={line.id} />}
                  <HsCodeSearch cargoLineId={line.id} currentCode={line.hsCode} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

function Documents({
  documents,
  shipmentId,
  hasBl,
  hasFactura,
}: {
  documents: ShipmentDetail["documents"];
  shipmentId: string;
  hasBl: boolean;
  hasFactura: boolean;
}) {
  return (
    <Panel
      title="Documentos"
      icon={FileText}
      help={{
        title: "El documento se rellena solo",
        body: "Arrastra el BL, AWB o CMR en PDF. La IA extrae los campos y los propone en ámbar con su nivel de confianza; tú revisas y confirmas. El ámbar siempre significa «lo hizo la IA».",
      }}
    >
      {/* Upload zone — lo primero, visible siempre */}
      <DocumentUpload shipmentId={shipmentId} />

      {/* Comparativa IA: visible cuando hay BL + factura comercial */}
      <DocumentCompare shipmentId={shipmentId} hasBl={hasBl} hasFactura={hasFactura} />
      {hasBl && !hasFactura && (
        <p className="mt-3 text-base text-muted-foreground/65">
          Sube la factura comercial para comparar automáticamente con el BL.
        </p>
      )}

      {/* Batch extract: visible cuando hay ≥2 docs sin extraer */}
      {(() => {
        const pending = documents.filter((d) => d.blobUrl && d.status === "uploaded").map((d) => d.id);
        return pending.length >= 2 ? (
          <div className="mt-3">
            <BatchExtractButton documentIds={pending} />
          </div>
        ) : null;
      })()}

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
                    <p className="flex min-w-0 items-baseline font-mono text-base text-foreground">
                      <span className="truncate">{base}</span>
                      <span className="shrink-0">{ext}</span>
                    </p>
                    <p className="text-base text-muted-foreground">
                      {DOC_TYPE[d.type] ?? d.type}
                      {(d.type === "awb" || d.type === "cmr") && d.status === "confirmed" && (
                        <Link
                          href={`/documentos/${d.type}/${d.id}`}
                          className="ml-2 font-mono text-[10px] uppercase tracking-wider text-primary hover:underline"
                          target="_blank"
                        >
                          Plantilla ↗
                        </Link>
                      )}
                    </p>
                  </div>
                  {/* La extracción IA aplica a documentos de transporte (BL/AWB/CMR),
                      no a la factura comercial (esa va por la comparativa). */}
                  {d.blobUrl && d.type !== "factura_comercial" && (
                    <AiExtractionPanel
                      documentId={d.id}
                      status={d.status}
                      extraction={d.extraction}
                      docType={d.type}
                      compact
                    />
                  )}
                </div>
                {/* Revisión lado a lado (documento → expediente) — solo con propuesta IA */}
                {d.blobUrl && (d.status === "extracted" || d.status === "confirmed") && (
                  <ExtractionReviewModal
                    pdfUrl={d.blobUrl}
                    filename={d.filename}
                    documentId={d.id}
                    status={d.status}
                    extraction={d.extraction}
                    docType={d.type}
                  />
                )}
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
                    docType={d.type}
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
