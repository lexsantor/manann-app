"use server";

import { revalidatePath } from "next/cache";

import { getOrgContext } from "@/lib/erp";
import { reseedDemo } from "@/db/seed";

// Reinicia la demo: borra los expedientes de la org del usuario (incluidos los
// creados/modificados durante la demo) y restaura los 5 originales.
export async function resetDemo(): Promise<void> {
  const ctx = await getOrgContext();
  if (!ctx?.org) throw new Error("No autorizado");

  await reseedDemo(ctx.org.id, ctx.user.id);

  revalidatePath("/expedientes");
  revalidatePath("/dashboard");
}
