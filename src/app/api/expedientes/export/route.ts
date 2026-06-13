import { NextResponse } from "next/server";
import { getOrgContext, listShipments } from "@/lib/erp";

export async function GET() {
  const ctx = await getOrgContext();
  if (!ctx?.org) return new NextResponse("No autorizado", { status: 401 });

  const shipments = await listShipments(ctx.org.id);

  const header = [
    "Referencia", "Estado", "Modo", "Prioridad",
    "POL", "POD", "Naviera / Transportista", "BL / AWB / CMR",
    "Incoterm", "Flete", "ETD", "ETA", "Creado",
  ].join(",");

  const rows = shipments.map((s) => [
    s.reference,
    s.status,
    s.mode,
    s.priority,
    s.pol ?? "",
    s.pod ?? "",
    s.carrier ?? "",
    s.blNumber ?? "",
    s.incoterm ?? "",
    s.freightTerms ?? "",
    s.etd ? new Date(s.etd).toLocaleDateString("es-ES") : "",
    s.eta ? new Date(s.eta).toLocaleDateString("es-ES") : "",
    new Date(s.createdAt).toLocaleDateString("es-ES"),
  ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","));

  const csv = [header, ...rows].join("\r\n");
  const filename = `expedientes-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
