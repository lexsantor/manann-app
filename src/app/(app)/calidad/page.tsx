import { notFound } from "next/navigation";
import { ShieldCheck, AlertTriangle, ClipboardList, Timer } from "lucide-react";
import Link from "next/link";
import { getOrgContext } from "@/lib/erp";

export default async function CalidadPage() {
  const ctx = await getOrgContext();
  if (!ctx?.org) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ShieldCheck className="h-5 w-5 shrink-0 text-muted-foreground" strokeWidth={1.5} />
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Calidad
          </h1>
          <p className="text-sm text-muted-foreground">
            Incidencias · No conformidades · SLA
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          {
            href: "/calidad/incidencias",
            icon: AlertTriangle,
            label: "Incidencias",
            desc: "Registro y seguimiento de incidencias operativas",
          },
          {
            href: "/calidad/no-conformidades",
            icon: ClipboardList,
            label: "No conformidades",
            desc: "Gestión de NC con causa raíz y acciones correctivas",
          },
          {
            href: "/calidad/sla",
            icon: Timer,
            label: "SLA",
            desc: "Objetivos de tiempo por métrica y modo de transporte",
          },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-start gap-2.5 rounded-md border border-border bg-card p-4 hover:border-primary/30 hover:bg-primary/5 transition-colors"
          >
            <item.icon
              className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
              strokeWidth={1.5}
            />
            <div>
              <p className="text-sm font-medium text-foreground">{item.label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
