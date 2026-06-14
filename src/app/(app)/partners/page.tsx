import { notFound } from "next/navigation";
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

      <CarrierScorecard rows={scorecard} />
      <PartnerDirectory partners={partners} />
    </div>
  );
}
