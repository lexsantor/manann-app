import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { shipment, party, container, cargoLine, document } from "@/db/schema";

/** Referencia del expediente showcase del flujo IA (la demo). */
export const WOW_SHOWCASE_REF = "EXP-2026-0054";

/**
 * Devuelve el expediente showcase a estado pristine: borrador limpio + propuesta
 * de la IA del BL reabierta. Conserva ruta, fechas, el PDF del BL y la factura
 * comercial (para la comparativa). Compartido por la acción manual
 * (ResetDemoButton) y el cron de auto-reset → una sola fuente de verdad.
 */
export async function resetShowcaseShipment(shipmentId: string): Promise<void> {
  await db.delete(party).where(eq(party.shipmentId, shipmentId));
  await db.delete(container).where(eq(container.shipmentId, shipmentId));
  await db.delete(cargoLine).where(eq(cargoLine.shipmentId, shipmentId));

  await db
    .update(shipment)
    .set({
      status: "borrador",
      carrier: null,
      vessel: null,
      voyage: null,
      blNumber: null,
      incoterm: null,
      freightTerms: null,
    })
    .where(eq(shipment.id, shipmentId));

  // Reabre la propuesta de la IA SOLO del BL (la factura comercial se conserva).
  await db
    .update(document)
    .set({ status: "extracted" })
    .where(and(eq(document.shipmentId, shipmentId), eq(document.type, "bl")));
}
