import { notFound } from "next/navigation";
import Link from "next/link";
import { UserCircle, Globe, FileSearch } from "lucide-react";
import { getOrgContext, listPartners, getCarrierScorecard } from "@/lib/erp";
import { PartnerDirectory } from "@/components/app/partner-directory";
import { CarrierScorecard } from "@/components/app/carrier-scorecard";

export default async function PartnersPage() {
  const ctx = await getOrgContext();
  if (!ctx?.org) notFound();

  const [partners, scorecard] = await Promise.all([
    listPartners(ctx.org.id),
    getCarrierScorecard(ctx.org.id),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-5 py-8 space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">Partners & Proveedores</h1>
        <p className="mt-1 text-base text-muted-foreground">
          Directorio de agentes, co-loaders y subcontratistas con screening de sanciones y scorecard de puntualidad.
        </p>
      </div>

      {/* Red & Partners quick-access */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { href: "/partners/perfil", icon: UserCircle, label: "Tu perfil en la red", desc: "Especialidades, corredores, certificaciones" },
          { href: "/partners/red", icon: Globe, label: "Red de agentes", desc: "Corresponsales verificados por país y modo" },
          { href: "/partners/tender", icon: FileSearch, label: "Tender / RFQ", desc: "Envía peticiones y compara ofertas" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-start gap-2.5 rounded-md border border-border bg-card p-3 hover:border-primary/30 hover:bg-primary/5 transition-colors"
          >
            <item.icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />
            <div>
              <p className="text-sm font-medium text-foreground">{item.label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      <CarrierScorecard rows={scorecard} />
      <PartnerDirectory partners={partners} />
    </div>
  );
}
