// Auditoría de cambios de campo — 3.3.
// Uso: llamar logChanges() dentro de la misma transacción Drizzle que muta datos.
import { fieldChange } from "@/db/schema";

export interface ChangeEntry {
  shipmentId: string;
  entity: string;
  entityId: string;
  field: string;
  oldValue: string | null;
  newValue: string | null;
  changedBy?: string | null; // member.id (null si source != 'user')
  source: "user" | "ai" | "system";
}

// Acepta tanto db como una transacción Drizzle (comparten .insert())
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function logChanges(tx: any, entries: ChangeEntry[]): Promise<void> {
  const filtered = entries.filter((e) => e.oldValue !== e.newValue);
  if (filtered.length === 0) return;

  await tx.insert(fieldChange).values(
    filtered.map((e) => ({
      shipmentId: e.shipmentId,
      entity: e.entity,
      entityId: e.entityId,
      field: e.field,
      oldValue: e.oldValue,
      newValue: e.newValue,
      changedBy: e.changedBy ?? null,
      source: e.source,
    })),
  );
}
