import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Anchor,
  Plane,
  Globe,
  DollarSign,
  Tag,
  FileCheck2,
  Settings,
  Hash,
  Building2,
  Database,
} from "lucide-react";
import { getOrgContext } from "@/lib/erp";
import { PageHeader } from "@/components/ui/page-header";
import { MASTER_PORTS } from "@/lib/master-ports";
import { MASTER_AIRPORTS } from "@/lib/master-airports";
import { MASTER_COUNTRIES } from "@/lib/master-countries";
import { MASTER_CURRENCIES } from "@/lib/master-currencies";

const SECTIONS = [
  {
    href: "/maestros/puertos",
    label: "Puertos",
    description: "Catálogo UN/LOCODE de puertos marítimos",
    icon: Anchor,
    count: MASTER_PORTS.length,
    badge: null,
  },
  {
    href: "/maestros/aeropuertos",
    label: "Aeropuertos",
    description: "Códigos IATA de aeropuertos de carga",
    icon: Plane,
    count: MASTER_AIRPORTS.length,
    badge: null,
  },
  {
    href: "/maestros/paises",
    label: "Países",
    description: "ISO 3166-1 — códigos de país y región",
    icon: Globe,
    count: MASTER_COUNTRIES.length,
    badge: null,
  },
  {
    href: "/maestros/monedas",
    label: "Monedas",
    description: "ISO 4217 y tipos de cambio (base EUR)",
    icon: DollarSign,
    count: MASTER_CURRENCIES.length,
    badge: "Simulación",
  },
  {
    href: "/maestros/conceptos",
    label: "Conceptos de cargo",
    description: "Catálogo propio de conceptos facturables",
    icon: Tag,
    count: null,
    badge: null,
  },
  {
    href: "/maestros/regimenes",
    label: "Regímenes aduaneros",
    description: "HS/TARIC — códigos de régimen aduanero",
    icon: FileCheck2,
    count: null,
    badge: null,
  },
  {
    href: "/maestros/parametros",
    label: "Parámetros del sistema",
    description: "Configuración global de la organización",
    icon: Settings,
    count: null,
    badge: null,
  },
  {
    href: "/maestros/series",
    label: "Series y numeración",
    description: "Prefijos y contadores por tipo de documento",
    icon: Hash,
    count: null,
    badge: null,
  },
  {
    href: "/maestros/sucursales",
    label: "Empresas y sucursales",
    description: "Sedes y delegaciones de la organización",
    icon: Building2,
    count: null,
    badge: null,
  },
];

export default async function MaestrosPage() {
  const ctx = await getOrgContext();
  if (!ctx?.org) notFound();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Maestros"
        icon={<Database strokeWidth={1.5} />}
        title="Tablas maestras"
        subtitle="Catálogos de referencia y configuración de la organización."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {SECTIONS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="group flex flex-col gap-2 rounded-md border border-border bg-card p-4 hover:border-primary/40 hover:bg-accent/30 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <s.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" strokeWidth={1.5} />
                <span className="text-sm font-medium text-foreground">{s.label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {s.badge && (
                  <span className="rounded-full bg-accent/20 border border-accent/30 px-2 py-0.5 text-[10px] font-medium text-accent">
                    {s.badge}
                  </span>
                )}
                {s.count !== null && (
                  <span className="text-xs text-muted-foreground tabular-nums">{s.count}</span>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{s.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
