"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "embarques", label: "Expedientes" },
  { id: "aduanas", label: "Aduanas" },
  { id: "crm", label: "CRM" },
  { id: "finanzas", label: "Finanzas" },
  { id: "calidad", label: "Calidad" },
  { id: "red", label: "Red" },
  { id: "reportes", label: "Reportes" },
];

function PanelFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl border border-border overflow-hidden p-7"
      style={{
        background: "linear-gradient(180deg, hsl(var(--card) / 0.9), hsl(var(--background) / 0.95))",
        boxShadow: "var(--shadow-product)",
      }}
    >
      {children}
    </div>
  );
}

function SectionNote({ children }: { children: React.ReactNode }) {
  return <p className="mt-4 text-[14px] text-muted-foreground/60">{children}</p>;
}

function PanelEmbarques() {
  return (
    <PanelFrame>
      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <h4 className="font-display text-[16px] font-semibold mb-4">MNN-84213 · Shanghái → Valencia</h4>
          <div className="flex flex-col gap-0">
            {[
              { name: "Recogida en origen", meta: "Shanghái · 28 may, 09:40", done: true },
              { name: "Zarpe confirmado", meta: "MSC Aurora V. · 31 may, 22:15", done: true },
              { name: "En tránsito · Estrecho de Malaca", meta: "72% del trayecto · velocidad 18,2 kn", now: true },
              { name: "Llegada a puerto", meta: "Valencia · ETA 18 jun, 06:00" },
              { name: "Despacho y entrega", meta: "Programado · 19 jun" },
            ].map((item, i) => (
              <div key={i} className="relative flex gap-3.5 pb-5 last:pb-0">
                {i < 4 && <div className="absolute left-[6px] top-[18px] bottom-0 w-[2px] bg-border/20" />}
                <div
                  className={cn(
                    "mt-[3px] size-3.5 shrink-0 rounded-full border-2",
                    item.done ? "border-emerald-400 bg-emerald-400/20" :
                    item.now ? "border-primary bg-primary/20" :
                    "border-muted-foreground/30 bg-background"
                  )}
                  style={item.now ? { boxShadow: "0 0 10px hsl(var(--primary) / 0.5)" } : undefined}
                />
                <div>
                  <div className="text-[14px] font-semibold">{item.name}</div>
                  <div className="mt-0.5 font-mono text-[10px] text-muted-foreground/50">{item.meta}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative min-h-[220px] overflow-hidden rounded-lg border border-border/40 bg-background/40">
          <div
            className="absolute inset-0 opacity-40"
            style={{ backgroundImage: "radial-gradient(hsl(var(--foreground) / 0.05) 1px, transparent 1px)", backgroundSize: "16px 16px" }}
          />
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 240 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
            <path d="M 28 150 C 90 60, 150 180, 212 56" fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeDasharray="4 5" opacity="0.45" />
            <path d="M 28 150 C 64 100, 104 116, 140 116" fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5" opacity="0.9" />
            <circle cx="28" cy="150" r="3" fill="hsl(var(--muted-foreground))" />
            <circle cx="212" cy="56" r="3" fill="hsl(var(--muted-foreground))" />
            <circle cx="140" cy="116" r="7" fill="hsl(var(--primary) / 0.18)" />
            <circle cx="140" cy="116" r="3" fill="hsl(var(--primary))" />
          </svg>
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-primary" />
            <span className="font-mono text-[10px] text-muted-foreground/60">En tránsito · Estrecho de Malaca</span>
          </div>
          <span className="absolute right-3 top-3 rounded-full border border-border/40 bg-background/60 px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.12em] text-muted-foreground/50">
            Simulación
          </span>
        </div>
      </div>
      <SectionNote>
        Cada hito se actualiza desde ShipsGo y navieras conectadas. El cliente lo ve en su portal, sin correos.
      </SectionNote>
    </PanelFrame>
  );
}

function PanelAduanas() {
  const docs = [
    { name: "Bill of Lading", ref: "MSCUNB482", ok: true },
    { name: "Factura comercial", ref: "FC-2026-1182", ok: true },
    { name: "Packing list", ref: "", ok: true },
    { name: "DUA de importación", ref: "", transit: true },
    { name: "Certificado de origen", ref: "", pending: true },
  ];
  return (
    <PanelFrame>
      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <h4 className="font-display text-[16px] font-semibold mb-4">Expediente aduanero · MNN-84207</h4>
          <div className="flex flex-col gap-2">
            {docs.map((d, i) => (
              <div key={i} className="flex items-center justify-between gap-3 rounded-lg border border-border/30 bg-background/20 px-3.5 py-2.5">
                <span className="text-[14px] font-medium">
                  {d.name}
                  {d.ref && <span className="ml-2 font-mono text-[10px] text-muted-foreground/40">{d.ref}</span>}
                </span>
                <span className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold",
                  d.ok ? "bg-emerald-500/10 text-emerald-400" :
                  d.transit ? "bg-primary/10 text-primary" :
                  "bg-yellow-500/10 text-yellow-400"
                )}>
                  <span className="size-[3.5px] rounded-full bg-current" />
                  {d.ok ? "Validado" : d.transit ? "Presentada" : "Pendiente"}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-display text-[16px] font-semibold mb-4">Despacho</h4>
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-6 text-center">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-400/60">Canal asignado</span>
            <div className="mt-2 font-display text-[28px] font-semibold text-emerald-400">Verde</div>
            <div className="mt-1 font-mono text-[10px] text-muted-foreground/45">
              Levante autorizado · Róterdam · hace 12 min
            </div>
          </div>
          <SectionNote>
            Manann extrae los datos de cada documento, los cruza contra la partida arancelaria y presenta la declaración. Tú solo apruebas.
          </SectionNote>
        </div>
      </div>
    </PanelFrame>
  );
}

function PanelCRM() {
  const cols = [
    {
      title: "Prospecto", count: 4,
      deals: [
        { name: "Textiles Arroyo", meta: "Import. FCL · Asia → ES", val: "€86.000 est." },
        { name: "Frutas del Sur", meta: "Reefer · LATAM → EU", val: "€140.000 est." },
      ],
    },
    {
      title: "Cotizado", count: 3,
      deals: [
        { name: "Maquinaria Vela", meta: "Project cargo · 3 embarques", val: "€212.000 · vence en 4 días" },
        { name: "BioPharma Iberia", meta: "Aéreo · temperatura controlada", val: "€64.000 · enviada hoy" },
      ],
    },
    {
      title: "Ganado", count: 6,
      deals: [
        { name: "Grupo Almar", meta: "Contrato anual · 480 TEU", val: "€1,2M · firmado" },
        { name: "Electro Nórdica", meta: "LCL semanal · CN → SE", val: "€96.000 · firmado" },
      ],
    },
  ];
  return (
    <PanelFrame>
      <h4 className="font-display text-[16px] font-semibold mb-4">Pipeline comercial · junio 2026</h4>
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        {cols.map((col) => (
          <div key={col.title}>
            <div className="mb-3 flex justify-between font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground/40 px-0.5">
              <span>{col.title}</span>
              <span>{col.count}</span>
            </div>
            {col.deals.map((deal, i) => (
              <div
                key={i}
                className="mb-2.5 rounded-lg border border-border/30 bg-background/25 p-3 transition-all duration-300 hover:border-primary/30 hover:-translate-y-0.5"
              >
                <div className="text-[12px] font-semibold">{deal.name}</div>
                <div className="mt-0.5 text-[12px] text-muted-foreground/55">{deal.meta}</div>
                <div className="mt-2 font-mono text-[10px] text-primary/70">{deal.val}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
      <SectionNote>
        Cada cotización ganada se convierte en expediente con un clic: cliente, tarifa y ruta ya cargados.
      </SectionNote>
    </PanelFrame>
  );
}

function PanelFinanzas() {
  const invoices = [
    { ref: "F-2026-0461", client: "Grupo Almar", amount: "€48.200", paid: true },
    { ref: "F-2026-0460", client: "Electro Nórdica", amount: "€12.840", transit: true },
    { ref: "F-2026-0458", client: "Textiles Arroyo", amount: "€9.310", overdue: true },
    { ref: "F-2026-0457", client: "BioPharma Iberia", amount: "€21.600", paid: true },
  ];
  const margins = [
    { ref: "MNN-84213", w: "78%", val: "22,4%" },
    { ref: "MNN-84207", w: "64%", val: "18,1%" },
    { ref: "MNN-84198", w: "88%", val: "26,9%" },
    { ref: "MNN-84190", w: "52%", val: "14,2%" },
  ];
  return (
    <PanelFrame>
      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <h4 className="font-display text-[16px] font-semibold mb-3">Facturación · junio</h4>
          <div>
            <div className="grid gap-2 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground/35" style={{ gridTemplateColumns: "1fr 1.3fr 0.9fr 0.9fr" }}>
              <span>Factura</span><span>Cliente</span><span>Importe</span><span>Estado</span>
            </div>
            {invoices.map((inv) => (
              <div key={inv.ref} className="grid items-center gap-2 border-t border-border/20 px-3 py-2.5 text-[12px]" style={{ gridTemplateColumns: "1fr 1.3fr 0.9fr 1.1fr" }}>
                <span className="font-mono text-[10px] text-primary/70">{inv.ref}</span>
                <span className="text-muted-foreground/65">{inv.client}</span>
                <span className="font-mono text-[10px]">{inv.amount}</span>
                <span className={cn("inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold",
                  inv.paid ? "bg-emerald-500/10 text-emerald-400" :
                  inv.transit ? "bg-primary/10 text-primary" :
                  "bg-red-500/10 text-red-400"
                )}>
                  <span className="size-[3px] rounded-full bg-current" />
                  {inv.paid ? "Cobrada" : inv.transit ? "Emitida" : "Vencida 3d"}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-display text-[16px] font-semibold mb-3">Margen por expediente</h4>
          <div className="flex flex-col gap-3">
            {margins.map((m) => (
              <div key={m.ref} className="grid items-center gap-3 text-[12px] text-muted-foreground/55" style={{ gridTemplateColumns: "90px 1fr 48px" }}>
                <span className="font-mono text-[10px]">{m.ref}</span>
                <div className="h-2 overflow-hidden rounded-full bg-border/20">
                  <div
                    className="h-full rounded-full"
                    style={{ width: m.w, background: "linear-gradient(90deg, hsl(172 51% 42%), hsl(185 55% 66%))" }}
                  />
                </div>
                <span className="font-mono text-[10px] text-right text-foreground/80">{m.val}</span>
              </div>
            ))}
          </div>
          <SectionNote>
            Costes imputados automáticamente. El margen real, visible antes de facturar.
          </SectionNote>
        </div>
      </div>
    </PanelFrame>
  );
}

function PanelCalidad() {
  const slas = [
    { name: "Respuesta a cotización", target: "objetivo < 4 h", val: "2,1 h", ok: true },
    { name: "Gestión de DUA", target: "objetivo < 24 h", val: "19 h", ok: true },
    { name: "Confirmación de booking", target: "objetivo < 8 h", val: "9,4 h", ok: false },
  ];
  const incidents = [
    { type: "Retraso", meta: "EXP-84207 · naviera", state: "En gestión", ok: false },
    { type: "Daño", meta: "EXP-84190 · terminal", state: "Cerrado", ok: true },
  ];
  return (
    <PanelFrame>
      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <h4 className="font-display text-[16px] font-semibold mb-4">SLA por objetivo · junio</h4>
          <div className="flex flex-col gap-2">
            {slas.map((s) => (
              <div key={s.name} className="flex items-center justify-between gap-3 rounded-lg border border-border/30 bg-background/20 px-3.5 py-2.5">
                <div>
                  <div className="text-[14px] font-medium">{s.name}</div>
                  <div className="mt-0.5 font-mono text-[10px] text-muted-foreground/40">{s.target}</div>
                </div>
                <span className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold",
                  s.ok ? "bg-emerald-500/10 text-emerald-400" : "bg-yellow-500/10 text-yellow-400"
                )}>
                  <span className="size-[3.5px] rounded-full bg-current" />
                  {s.val}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-display text-[16px] font-semibold mb-4">Incidencias abiertas</h4>
          <div className="flex flex-col gap-2">
            {incidents.map((it, i) => (
              <div key={i} className="flex items-center justify-between gap-3 rounded-lg border border-border/30 bg-background/20 px-3.5 py-2.5">
                <span className="text-[14px] font-medium">
                  {it.type}
                  <span className="ml-2 font-mono text-[10px] text-muted-foreground/40">{it.meta}</span>
                </span>
                <span className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold",
                  it.ok ? "bg-emerald-500/10 text-emerald-400" : "bg-primary/10 text-primary"
                )}>
                  <span className="size-[3.5px] rounded-full bg-current" />
                  {it.state}
                </span>
              </div>
            ))}
          </div>
          <SectionNote>
            SLAs por cliente y tipo de envío con semáforo de cumplimiento. Las incidencias y no conformidades quedan trazadas hasta su cierre.
          </SectionNote>
        </div>
      </div>
    </PanelFrame>
  );
}

function PanelRed() {
  const agents = [
    { name: "Meridian Freight", country: "Hamburgo, DE", meta: "Asia–Europa · FCL · LCL · Aéreo" },
    { name: "Atlas Logistics", country: "Barcelona, ES", meta: "Mediterráneo · OEA · ISO 9001" },
    { name: "Shanghai Connect", country: "Shanghái, CN", meta: "Asia–Norteamérica · FCL proyecto" },
  ];
  return (
    <PanelFrame>
      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <h4 className="font-display text-[16px] font-semibold mb-4">Corresponsales en la red</h4>
          <div className="flex flex-col gap-2">
            {agents.map((a) => (
              <div key={a.name} className="rounded-lg border border-border/30 bg-background/20 px-3.5 py-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-semibold">{a.name}</span>
                  <span className="font-mono text-[10px] text-muted-foreground/40">{a.country}</span>
                </div>
                <div className="mt-0.5 text-[12px] text-muted-foreground/55">{a.meta}</div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-display text-[16px] font-semibold mb-4">e-BL electrónico</h4>
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-6 text-center">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary/60">Título electrónico</span>
            <div className="mt-2 font-display text-[22px] font-semibold text-primary">Endorsed</div>
            <div className="mt-1 font-mono text-[10px] text-muted-foreground/45">SHA-256 · 3 transferencias</div>
            <div className="mt-3 font-mono text-[10px] font-medium leading-relaxed text-muted-foreground/70">
              Simulación · ESSDOCS / Bolero / WAVE en producción
            </div>
          </div>
          <SectionNote>
            Directorio global de corresponsales, tenders/RFQ a varios agentes y e-BL con huella SHA-256. Tu red, integrada en el expediente.
          </SectionNote>
        </div>
      </div>
    </PanelFrame>
  );
}

function PanelReportes() {
  const kpis = [
    { label: "Ingresos", value: "€4,82M", delta: "+18% vs. Q1" },
    { label: "Margen medio", value: "19,6%", delta: "+2,1 pts" },
    { label: "Tiempo despacho", value: "1,4 días", delta: "−0,8 días" },
  ];
  const bars = [42, 56, 48, 70, 64, 84];
  const labels = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN"];
  return (
    <PanelFrame>
      <h4 className="font-display text-[16px] font-semibold mb-4">Resumen ejecutivo · Q2 2026</h4>
      <div className="grid grid-cols-1 gap-3 mb-3.5 sm:grid-cols-3">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-lg border border-border/30 bg-background/20 p-3.5">
            <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground/40">{k.label}</div>
            <div className="mt-1.5 font-display text-[22px] font-semibold">{k.value}</div>
            <div className="mt-0.5 text-[10px] font-semibold text-emerald-400">{k.delta}</div>
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-border/30 bg-background/20 p-4">
        <div className="mb-3 flex items-baseline justify-between text-[12px] font-semibold">
          <span>Volumen mensual por modo</span>
          <span className="font-mono text-[10px] text-muted-foreground/35">TEU / TON</span>
        </div>
        <div className="flex h-[96px] items-end gap-2">
          {bars.map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-[2px]"
              style={{
                height: `${h}%`,
                background: i === 5
                  ? "linear-gradient(180deg, hsl(172 51% 52%), hsl(185 55% 68%))"
                  : "linear-gradient(180deg, hsl(var(--primary) / 0.35), hsl(var(--primary) / 0.15))",
                boxShadow: i === 5 ? "0 0 10px hsl(var(--primary) / 0.35)" : undefined,
              }}
            />
          ))}
        </div>
        <div className="mt-2 flex gap-2">
          {labels.map((l) => (
            <div key={l} className="flex-1 text-center font-mono text-[8px] text-muted-foreground/30">{l}</div>
          ))}
        </div>
      </div>
      <SectionNote>
        Cuadros de mando en vivo por sucursal, cliente, ruta y modo. Exportables, programables y siempre al día.
      </SectionNote>
    </PanelFrame>
  );
}

export function ProductTabs() {
  const [active, setActive] = useState("embarques");

  const panel: Record<string, React.ReactNode> = {
    embarques: <PanelEmbarques />,
    aduanas: <PanelAduanas />,
    crm: <PanelCRM />,
    finanzas: <PanelFinanzas />,
    calidad: <PanelCalidad />,
    red: <PanelRed />,
    reportes: <PanelReportes />,
  };

  return (
    <div>
      {/* Tab bar */}
      <div className="mb-11 flex flex-wrap justify-center gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            className={cn(
              "rounded-full border px-5 py-2 text-[14px] font-semibold transition-all duration-250",
              active === tab.id
                ? "border-primary/35 bg-primary/8 text-foreground"
                : "border-transparent text-muted-foreground hover:bg-card hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Panel */}
      <div className="transition-opacity duration-300">{panel[active]}</div>
    </div>
  );
}
