import { notFound } from "next/navigation";
import { getOrgContext } from "@/lib/erp";
import { db } from "@/db";
import { document, shipment, party, cargoLine } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import type { CmrExtraction } from "@/lib/bl-extraction";

export const metadata = { title: "CMR — Manann" };

function val(f?: { value: string | null; confidence: number } | null): string {
  return f?.value ?? "—";
}

export default async function CmrTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ctx = await getOrgContext();
  if (!ctx?.org) notFound();

  const [doc] = await db
    .select()
    .from(document)
    .where(eq(document.id, id));
  if (!doc) notFound();

  const [s] = await db
    .select()
    .from(shipment)
    .where(and(eq(shipment.id, doc.shipmentId), eq(shipment.organizationId, ctx.org.id)));
  if (!s) notFound();

  const parties = await db.select().from(party).where(eq(party.shipmentId, s.id));
  const cargo = await db.select().from(cargoLine).where(eq(cargoLine.shipmentId, s.id));

  const ex = (doc.extraction ?? {}) as Partial<CmrExtraction>;
  const shipper = parties.find((p) => p.role === "shipper");
  const consignee = parties.find((p) => p.role === "consignee");

  return (
    <div className="min-h-screen bg-white text-black print:text-[10pt]">
      {/* Print button — hidden in print */}
      <div className="flex justify-end p-4 print:hidden">
        <button
          onClick={() => typeof window !== "undefined" && window.print()}
          className="rounded-md border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
        >
          Imprimir / PDF
        </button>
      </div>

      <div className="mx-auto max-w-4xl px-6 pb-12 print:px-0 print:pb-0">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between border-b border-black pb-4">
          <div>
            <p className="text-[8pt] uppercase tracking-widest text-gray-500">Manann ERP</p>
            <h1 className="text-2xl font-bold tracking-tight">Carta de Porte CMR</h1>
          </div>
          <div className="text-right">
            <p className="font-mono text-xl font-bold">{val(ex.blNumber)}</p>
            <p className="text-sm text-gray-500">Ref. {s.reference}</p>
          </div>
        </div>

        {/* Transport block */}
        <div className="mb-4 grid grid-cols-2 gap-4 rounded border border-gray-300 p-4">
          <div>
            <p className="text-[8pt] uppercase tracking-wider text-gray-400">Transportista</p>
            <p className="font-medium">{val(ex.carrier)}</p>
          </div>
          <div>
            <p className="text-[8pt] uppercase tracking-wider text-gray-400">Conductor</p>
            <p className="font-medium">{val(ex.driverName)}</p>
          </div>
          <div>
            <p className="text-[8pt] uppercase tracking-wider text-gray-400">Matrícula vehículo</p>
            <p className="font-mono font-bold">{val(ex.vessel)}</p>
          </div>
          <div>
            <p className="text-[8pt] uppercase tracking-wider text-gray-400">Matrícula remolque</p>
            <p className="font-mono">{val(ex.voyage)}</p>
          </div>
          {ex.customsRegime?.value && (
            <div className="col-span-2">
              <p className="text-[8pt] uppercase tracking-wider text-gray-400">Régimen aduanero</p>
              <p className="font-mono">{val(ex.customsRegime)}</p>
            </div>
          )}
        </div>

        {/* Route */}
        <div className="mb-4 grid grid-cols-[1fr_auto_1fr] items-start gap-4 rounded border border-gray-300 p-4">
          <div>
            <p className="text-[8pt] uppercase tracking-wider text-gray-400">Lugar de carga</p>
            <p className="font-medium leading-snug">{val(ex.pol)}</p>
            <p className="mt-1 font-mono text-sm text-gray-500">{ex.etd?.value ?? "—"}</p>
          </div>
          <div className="mt-4 text-xl text-gray-300">→</div>
          <div>
            <p className="text-[8pt] uppercase tracking-wider text-gray-400">Lugar de entrega</p>
            <p className="font-medium leading-snug">{val(ex.pod)}</p>
            <p className="mt-1 font-mono text-sm text-gray-500">{ex.eta?.value ?? "—"}</p>
          </div>
        </div>

        {/* Parties */}
        <div className="mb-4 grid grid-cols-2 gap-4">
          {[
            { label: "Remitente (Shipper)", name: shipper?.name ?? val(ex.shipperName), country: shipper?.country ?? ex.shipperCountry?.value },
            { label: "Destinatario", name: consignee?.name ?? val(ex.consigneeName), country: consignee?.country ?? ex.consigneeCountry?.value },
          ].map((p) => (
            <div key={p.label} className="rounded border border-gray-200 p-3">
              <p className="mb-1 text-[8pt] uppercase tracking-wider text-gray-400">{p.label}</p>
              <p className="font-medium leading-snug">{p.name ?? "—"}</p>
              {p.country && <p className="font-mono text-sm text-gray-500">{p.country}</p>}
            </div>
          ))}
        </div>

        {/* Cargo */}
        <div className="mb-4 overflow-hidden rounded border border-gray-300">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {["Mercancía", "HS", "Bultos", "Peso bruto (kg)", "Precinto"].map((h) => (
                  <th key={h} className="px-3 py-2 text-left text-[8pt] uppercase tracking-wider text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cargo.length > 0 ? cargo.map((c, i) => (
                <tr key={c.id} className={i % 2 === 1 ? "bg-gray-50" : ""}>
                  <td className="px-3 py-2">{c.description}</td>
                  <td className="px-3 py-2 font-mono">{c.hsCode ?? "—"}</td>
                  <td className="px-3 py-2 font-mono text-right">{c.packages ?? "—"}</td>
                  <td className="px-3 py-2 font-mono text-right">{c.grossWeightKg ?? "—"}</td>
                  <td className="px-3 py-2 font-mono">—</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-3 py-4 text-center text-gray-400">
                    {val(ex.cargoDescription)} · {val(ex.packages)} bultos · {val(ex.grossWeightKg)} kg · Precinto: {val(ex.sealNumber)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer grid */}
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="rounded border border-gray-200 p-3">
            <p className="text-[8pt] uppercase tracking-wider text-gray-400">Incoterm</p>
            <p>{val(ex.incoterm)}</p>
          </div>
          <div className="rounded border border-gray-200 p-3">
            <p className="text-[8pt] uppercase tracking-wider text-gray-400">Flete</p>
            <p>{val(ex.freightTerms)}</p>
          </div>
          <div className="rounded border border-gray-200 p-3">
            <p className="text-[8pt] uppercase tracking-wider text-gray-400">Tipo vehículo</p>
            <p>{val(ex.containerType)}</p>
          </div>
        </div>

        <p className="mt-8 text-center text-[8pt] text-gray-300">
          Generado por Manann ERP · Documento de referencia interna
        </p>
      </div>
    </div>
  );
}
