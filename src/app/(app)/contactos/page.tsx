import Link from "next/link";
import { notFound } from "next/navigation";
import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getOrgContext, listContactsWithGP } from "@/lib/erp";
import { ContactsTab } from "@/components/app/contacts-tab";
import { ContactosTabSelect } from "@/components/app/contactos-tab-select";
import { PageHeader } from "@/components/ui/page-header";

export const metadata = { title: "Contactos & Tablas Maestras — Manann" };

// ─── Datos estáticos de referencia ─────────────────────────────────────────

const CARRIERS = [
  { scac: "MAEU", name: "Maersk",        alliance: "Gemini",         api: "activo"    },
  { scac: "MSCU", name: "MSC",           alliance: "—",              api: "pendiente" },
  { scac: "CMDU", name: "CMA CGM",       alliance: "Ocean Alliance", api: "pendiente" },
  { scac: "HLCU", name: "Hapag-Lloyd",   alliance: "Gemini",         api: "pendiente" },
  { scac: "COSU", name: "COSCO",         alliance: "Ocean Alliance", api: "pendiente" },
  { scac: "EGLV", name: "Evergreen",     alliance: "Premier",        api: "pendiente" },
  { scac: "OOLU", name: "OOCL",          alliance: "Ocean Alliance", api: "pendiente" },
  { scac: "YMLU", name: "Yang Ming",     alliance: "Premier",        api: "pendiente" },
  { scac: "ONEY", name: "ONE",           alliance: "Premier",        api: "pendiente" },
  { scac: "ZIMU", name: "ZIM",           alliance: "—",              api: "pendiente" },
];

const CONTAINER_TYPES = [
  { iso: "22G1", desc: "20' Dry Standard",    class: "Dry",      tare: 2230, payload: 21770, vol: 33.2  },
  { iso: "42G1", desc: "40' Dry Standard",    class: "Dry",      tare: 3940, payload: 26750, vol: 67.6  },
  { iso: "45G1", desc: "40' High Cube (HC)",  class: "Dry",      tare: 3940, payload: 26750, vol: 76.3  },
  { iso: "L5G1", desc: "45' High Cube",       class: "Dry",      tare: 4800, payload: 27700, vol: 86.0  },
  { iso: "22R1", desc: "20' Reefer",          class: "Reefer",   tare: 3080, payload: 27400, vol: 28.2  },
  { iso: "42R1", desc: "40' Reefer",          class: "Reefer",   tare: 4800, payload: 29200, vol: 59.3  },
  { iso: "45R1", desc: "40' Reefer HC",       class: "Reefer",   tare: 4300, payload: 29200, vol: 67.6  },
  { iso: "22P1", desc: "20' Flat Rack",       class: "Especial", tare: 2450, payload: 21550, vol: 0     },
  { iso: "42P1", desc: "40' Flat Rack",       class: "Especial", tare: 5200, payload: 40800, vol: 0     },
  { iso: "22U1", desc: "20' Open Top",        class: "Especial", tare: 2200, payload: 28000, vol: 32.7  },
  { iso: "42U1", desc: "40' Open Top",        class: "Especial", tare: 3950, payload: 26750, vol: 66.5  },
  { iso: "22T6", desc: "20' Tank",            class: "Especial", tare: 2600, payload: 24000, vol: 21.0  },
];

const INCOTERMS = [
  { code: "EXW", name: "Ex Works",                      group: "E", mode: "Todos",    riesgo: "Comprador asume el riesgo desde la fábrica del vendedor" },
  { code: "FCA", name: "Free Carrier",                  group: "F", mode: "Todos",    riesgo: "Comprador desde la entrega al primer transportista" },
  { code: "CPT", name: "Carriage Paid To",              group: "C", mode: "Todos",    riesgo: "Comprador en destino (vendedor paga flete)" },
  { code: "CIP", name: "Carriage & Insurance Paid",     group: "C", mode: "Todos",    riesgo: "Comprador en destino (vendedor paga flete + seguro amplio)" },
  { code: "DAP", name: "Delivered at Place",            group: "D", mode: "Todos",    riesgo: "Vendedor hasta el lugar de destino pactado" },
  { code: "DPU", name: "Delivered at Place Unloaded",   group: "D", mode: "Todos",    riesgo: "Vendedor hasta descarga en destino (antes DAT)" },
  { code: "DDP", name: "Delivered Duty Paid",           group: "D", mode: "Todos",    riesgo: "Vendedor asume todo incluyendo impuestos en destino" },
  { code: "FAS", name: "Free Alongside Ship",           group: "F", mode: "Marítimo", riesgo: "Comprador desde que la mercancía está al costado del buque" },
  { code: "FOB", name: "Free on Board",                 group: "F", mode: "Marítimo", riesgo: "Comprador desde que la mercancía está a bordo del buque" },
  { code: "CFR", name: "Cost and Freight",              group: "C", mode: "Marítimo", riesgo: "Comprador en puerto de destino (vendedor paga flete)" },
  { code: "CIF", name: "Cost Insurance & Freight",      group: "C", mode: "Marítimo", riesgo: "Comprador en destino (vendedor paga flete + seguro básico)" },
];

const GROUP_COLOR: Record<string, string> = {
  E: "bg-muted text-muted-foreground",
  F: "bg-muted text-muted-foreground",
  C: "bg-primary/10 text-primary",
  D: "bg-muted text-muted-foreground",
};
const CLASS_COLOR: Record<string, string> = {
  Dry:      "bg-muted text-muted-foreground",
  Reefer:   "bg-muted text-muted-foreground",
  Especial: "bg-muted text-muted-foreground",
};
const API_COLOR: Record<string, string> = {
  activo:    "bg-success/10 text-success",
  pendiente: "bg-muted text-muted-foreground",
};
const ALLIANCE_COLOR: Record<string, string> = {
  Gemini:          "bg-muted text-muted-foreground",
  "Ocean Alliance":"bg-muted text-muted-foreground",
  Premier:         "bg-muted text-muted-foreground",
  "—":             "bg-muted text-muted-foreground",
};

// ─── Tabs ──────────────────────────────────────────────────────────────────

const TABS = [
  { key: "contactos",   label: "Contactos"       },
  { key: "navieras",    label: "Navieras"         },
  { key: "contenedores",label: "Tipos contenedor" },
  { key: "incoterms",   label: "Incoterms 2020"  },
];

export default async function ContactosPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab = "contactos" } = await searchParams;
  const ctx = await getOrgContext();
  if (!ctx?.org) notFound();

  const contacts = tab === "contactos" ? await listContactsWithGP(ctx.org.id) : [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Comercial"
        icon={<Building2 strokeWidth={1.5} />}
        title="Tablas Maestras"
        subtitle="Directorio de contactos y datos de referencia del sector"
      />

      {/* Tab nav: select en móvil, tabs en escritorio */}
      <ContactosTabSelect tabs={TABS} current={tab} />
      <div className="hidden w-full gap-1 overflow-x-auto rounded-lg border border-border bg-card p-1 sm:flex sm:w-fit">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/contactos?tab=${t.key}`}
            prefetch={false}
            aria-current={tab === t.key ? "page" : undefined}
            className={cn(
              "whitespace-nowrap shrink-0 rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
              tab === t.key
                ? "bg-primary/10 text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {/* ── Contactos ── */}
      {tab === "contactos" && <ContactsTab contacts={contacts} />}

      {/* ── Navieras ── */}
      {tab === "navieras" && (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="border-b border-border px-5 py-3">
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              {CARRIERS.length} navieras · Datos de referencia
            </p>
          </div>
          <div className="divide-y divide-border/60 overflow-x-auto">
            {CARRIERS.map((c) => (
              <div key={c.scac} className="grid grid-cols-[70px_1fr] items-center gap-4 px-5 py-3 sm:grid-cols-[70px_1fr_140px_90px]">
                <span className="font-mono text-sm font-semibold text-foreground">{c.scac}</span>
                <span className="truncate text-sm text-foreground">{c.name}</span>
                <span className={cn("hidden w-fit rounded-full px-2 py-0.5 font-mono text-xs sm:inline-flex", ALLIANCE_COLOR[c.alliance])}>
                  {c.alliance}
                </span>
                <span className={cn("hidden w-fit rounded-full px-2 py-0.5 font-mono text-xs sm:inline-flex", API_COLOR[c.api])}>
                  {c.api === "activo" ? "API activa" : "Pendiente"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Contenedores ── */}
      {tab === "contenedores" && (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="border-b border-border px-5 py-3">
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              {CONTAINER_TYPES.length} tipos · ISO 6346
            </p>
          </div>
          <div className="hidden grid-cols-[80px_1fr_90px_80px_90px_80px] gap-4 border-b border-border/40 px-5 py-2 sm:grid">
            {["Código ISO", "Descripción", "Clase", "Tara (kg)", "Payload (kg)", "Vol. (m³)"].map((h) => (
              <span key={h} className="label-mono text-muted-foreground">{h}</span>
            ))}
          </div>
          <div className="divide-y divide-border/60">
            {CONTAINER_TYPES.map((t) => (
              <div key={t.iso} className="grid grid-cols-[80px_1fr_auto] items-center gap-4 px-5 py-3 sm:grid-cols-[80px_1fr_90px_80px_90px_80px]">
                <span className="font-mono text-sm font-semibold text-foreground">{t.iso}</span>
                <span className="text-sm text-foreground">{t.desc}</span>
                <span className={cn("inline-flex w-fit rounded-full px-2 py-0.5 font-mono text-xs", CLASS_COLOR[t.class])}>
                  {t.class}
                </span>
                <span className="hidden text-right font-mono text-sm text-muted-foreground sm:block">
                  {t.tare.toLocaleString("es-ES")}
                </span>
                <span className="hidden text-right font-mono text-sm text-foreground sm:block">
                  {t.payload.toLocaleString("es-ES")}
                </span>
                <span className="hidden text-right font-mono text-sm text-muted-foreground sm:block">
                  {t.vol > 0 ? t.vol.toFixed(1) : "—"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Incoterms 2020 ── */}
      {tab === "incoterms" && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Términos de comercio internacional Incoterms® 2020 (CCI). Determinan dónde se transfiere el riesgo entre vendedor y comprador.
          </p>
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="hidden grid-cols-[70px_180px_60px_90px_1fr] gap-4 border-b border-border/40 px-5 py-2 sm:grid">
              {["Código", "Nombre", "Grupo", "Modo", "Quién asume el riesgo"].map((h) => (
                <span key={h} className="label-mono text-muted-foreground">{h}</span>
              ))}
            </div>
            <div className="divide-y divide-border/60">
              {INCOTERMS.map((t) => (
                <div key={t.code} className="grid grid-cols-[70px_1fr] items-start gap-4 px-5 py-3 sm:grid-cols-[70px_180px_60px_90px_1fr]">
                  <span className="font-mono text-sm font-bold text-foreground">{t.code}</span>
                  <span className="text-sm font-medium text-foreground">{t.name}</span>
                  <span className={cn("inline-flex w-fit items-center rounded-full px-2 py-0.5 font-mono text-xs font-bold", GROUP_COLOR[t.group])}>
                    {t.group}
                  </span>
                  <span className="hidden font-mono text-xs text-muted-foreground sm:block">{t.mode}</span>
                  <span className="col-span-2 text-xs text-muted-foreground sm:col-span-1">{t.riesgo}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Grupos: <strong>E</strong> = salida · <strong>F</strong> = transporte principal no pagado · <strong>C</strong> = transporte principal pagado · <strong>D</strong> = llegada
          </p>
        </div>
      )}
    </div>
  );
}
