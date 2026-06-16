"use server";

import { revalidatePath } from "next/cache";
import { desc, eq, and } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { expense } from "@/db/schema";
import { requireOrg } from "@/lib/auth-guards";

const EXPENSE_CATEGORIES = [
  "combustible", "peajes", "alquiler", "suministros", "dietas", "seguros", "servicios", "otro",
] as const;

export async function listExpenses() {
  const orgId = await requireOrg();
  return db
    .select()
    .from(expense)
    .where(eq(expense.organizationId, orgId))
    .orderBy(desc(expense.date), desc(expense.createdAt));
}

const expenseSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
  category: z.enum(EXPENSE_CATEGORIES),
  description: z.string().trim().max(200).optional(),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Importe inválido"),
  currency: z.string().trim().max(8),
  supplier: z.string().trim().max(120).optional(),
});

export async function createExpense(data: {
  date: string;
  category: string;
  description?: string;
  amount: string;
  currency?: string;
  supplier?: string;
}) {
  const orgId = await requireOrg();
  const v = expenseSchema.parse({ ...data, currency: data.currency || "EUR" });
  await db.insert(expense).values({
    organizationId: orgId,
    date: v.date,
    category: v.category,
    description: v.description?.trim() || null,
    amount: v.amount,
    currency: v.currency,
    supplier: v.supplier?.trim() || null,
  });
  revalidatePath("/gastos");
}

export async function deleteExpense(id: string) {
  const orgId = await requireOrg();
  await db.delete(expense).where(and(eq(expense.id, id), eq(expense.organizationId, orgId)));
  revalidatePath("/gastos");
}
