"use server";

import { revalidatePath } from "next/cache";
import { desc, eq, and, gte, lte, sql, sum, asc } from "drizzle-orm";
import { db } from "@/db";
import {
  accountingPeriod,
  bankStatementLine,
  journalEntry,
  journalEntryLine,
  invoice,
  invoiceLine,
  shipment,
} from "@/db/schema";
import { getOrgContext } from "@/lib/erp";

async function requireOrg() {
  const ctx = await getOrgContext();
  if (!ctx?.org?.id) throw new Error("No org");
  return ctx.org.id;
}

// ── Períodos contables ────────────────────────────────────────────────────────

export async function listPeriods() {
  const orgId = await requireOrg();
  return db.query.accountingPeriod.findMany({
    where: eq(accountingPeriod.organizationId, orgId),
    orderBy: [desc(accountingPeriod.year), desc(accountingPeriod.month)],
  });
}

export async function ensurePeriod(year: number, month: number) {
  const orgId = await requireOrg();
  await db
    .insert(accountingPeriod)
    .values({ organizationId: orgId, year, month })
    .onConflictDoNothing();
  revalidatePath("/contabilidad/cierres");
}

export async function closePeriod(year: number, month: number) {
  const orgId = await requireOrg();
  await db
    .insert(accountingPeriod)
    .values({ organizationId: orgId, year, month, status: "closed", closedAt: new Date() })
    .onConflictDoUpdate({
      target: [accountingPeriod.organizationId, accountingPeriod.year, accountingPeriod.month],
      set: { status: "closed", closedAt: new Date() },
    });
  revalidatePath("/contabilidad/cierres");
}

export async function reopenPeriod(year: number, month: number) {
  const orgId = await requireOrg();
  await db
    .update(accountingPeriod)
    .set({ status: "open", closedAt: null })
    .where(
      and(
        eq(accountingPeriod.organizationId, orgId),
        eq(accountingPeriod.year, year),
        eq(accountingPeriod.month, month),
      ),
    );
  revalidatePath("/contabilidad/cierres");
}

export async function isPeriodClosed(year: number, month: number): Promise<boolean> {
  const orgId = await requireOrg();
  const p = await db.query.accountingPeriod.findFirst({
    where: and(
      eq(accountingPeriod.organizationId, orgId),
      eq(accountingPeriod.year, year),
      eq(accountingPeriod.month, month),
    ),
    columns: { status: true },
  });
  return p?.status === "closed";
}

// ── Balance de sumas y saldos ─────────────────────────────────────────────────

export async function getBalanceSumasSaldos(year: number, monthFrom?: number, monthTo?: number) {
  const orgId = await requireOrg();

  const periodFrom = monthFrom
    ? `${year}-${String(monthFrom).padStart(2, "0")}`
    : `${year}-01`;
  const periodTo = monthTo
    ? `${year}-${String(monthTo).padStart(2, "0")}`
    : `${year}-12`;

  // Get all journal entries in the org/period range
  const entries = await db.query.journalEntry.findMany({
    where: and(
      eq(journalEntry.organizationId, orgId),
      gte(journalEntry.period, periodFrom),
      lte(journalEntry.period, periodTo),
    ),
    columns: { id: true },
  });

  if (entries.length === 0) return [];

  const entryIds = entries.map((e) => e.id);

  // Aggregate lines by accountCode
  const rows = await db
    .select({
      accountCode: journalEntryLine.accountCode,
      accountName: journalEntryLine.accountName,
      totalDebit: sql<string>`sum(${journalEntryLine.debit})`,
      totalCredit: sql<string>`sum(${journalEntryLine.credit})`,
    })
    .from(journalEntryLine)
    .where(sql`${journalEntryLine.journalEntryId} = ANY(ARRAY[${sql.join(entryIds.map((id) => sql`${id}::uuid`), sql`, `)}])`)
    .groupBy(journalEntryLine.accountCode, journalEntryLine.accountName)
    .orderBy(asc(journalEntryLine.accountCode));

  return rows.map((r) => ({
    accountCode: r.accountCode,
    accountName: r.accountName,
    totalDebit: Number(r.totalDebit ?? 0),
    totalCredit: Number(r.totalCredit ?? 0),
    balance: Number(r.totalDebit ?? 0) - Number(r.totalCredit ?? 0),
  }));
}

// ── Modelo 303 ────────────────────────────────────────────────────────────────

export async function getModelo303Data(year: number, quarter: 1 | 2 | 3 | 4) {
  const orgId = await requireOrg();
  const monthStart = (quarter - 1) * 3 + 1;
  const monthEnd = monthStart + 2;
  const dateFrom = `${year}-${String(monthStart).padStart(2, "0")}-01`;
  const dateTo = `${year}-${String(monthEnd).padStart(2, "0")}-31`;

  // Cuotas repercutidas (ventas): invoice_line → invoice → shipment (scoped to org)
  const salesRows = await db
    .select({
      taxRate: invoiceLine.taxRate,
      base: sql<string>`sum(${invoiceLine.subtotal})`,
      cuota: sql<string>`sum(${invoiceLine.subtotal} * ${invoiceLine.taxRate} / 100)`,
    })
    .from(invoiceLine)
    .innerJoin(invoice, eq(invoiceLine.invoiceId, invoice.id))
    .innerJoin(shipment, eq(invoice.shipmentId, shipment.id))
    .where(
      and(
        eq(shipment.organizationId, orgId),
        gte(invoice.issueDate, dateFrom),
        lte(invoice.issueDate, dateTo),
        sql`${invoice.status} != 'borrador'`,
      ),
    )
    .groupBy(invoiceLine.taxRate)
    .orderBy(asc(invoiceLine.taxRate));

  const repercutidas = salesRows.map((r) => ({
    taxRate: Number(r.taxRate),
    base: Number(r.base ?? 0),
    cuota: Number(r.cuota ?? 0),
  }));

  // Cuotas soportadas — mock (no purchase invoice module yet)
  const soportadas = repercutidas.map((r) => ({
    taxRate: r.taxRate,
    base: r.base * 0.6,
    cuota: r.base * 0.6 * (r.taxRate / 100),
  }));

  const totalRepercutida = repercutidas.reduce((s, r) => s + r.cuota, 0);
  const totalSoportada = soportadas.reduce((s, r) => s + r.cuota, 0);
  const resultado = totalRepercutida - totalSoportada;

  return { year, quarter, repercutidas, soportadas, totalRepercutida, totalSoportada, resultado };
}

// ── Conciliación bancaria ─────────────────────────────────────────────────────

export async function listBankLines(reconciled?: boolean) {
  const orgId = await requireOrg();
  const filters = [
    eq(bankStatementLine.organizationId, orgId),
    ...(reconciled !== undefined ? [eq(bankStatementLine.reconciled, reconciled)] : []),
  ];
  return db.query.bankStatementLine.findMany({
    where: and(...(filters as [typeof filters[0], ...typeof filters])),
    orderBy: [desc(bankStatementLine.statementDate)],
  });
}

export async function importBankLines(
  lines: Array<{
    statementDate: string;
    description: string;
    amount: number;
    currency?: string;
  }>,
) {
  const orgId = await requireOrg();
  if (lines.length === 0) return;
  await db.insert(bankStatementLine).values(
    lines.map((l) => ({
      organizationId: orgId,
      statementDate: l.statementDate,
      description: l.description,
      amount: String(l.amount),
      currency: l.currency ?? "EUR",
    })),
  );
  revalidatePath("/contabilidad/conciliacion");
}

export async function reconcileLine(lineId: string, journalEntryId: string | null) {
  const orgId = await requireOrg();
  // verify line belongs to org
  const line = await db.query.bankStatementLine.findFirst({
    where: and(eq(bankStatementLine.id, lineId), eq(bankStatementLine.organizationId, orgId)),
    columns: { id: true },
  });
  if (!line) throw new Error("Línea no encontrada");

  await db
    .update(bankStatementLine)
    .set({
      reconciled: journalEntryId !== null,
      journalEntryId: journalEntryId ?? null,
    })
    .where(eq(bankStatementLine.id, lineId));
  revalidatePath("/contabilidad/conciliacion");
}

export async function deleteBankLine(id: string) {
  const orgId = await requireOrg();
  await db
    .delete(bankStatementLine)
    .where(and(eq(bankStatementLine.id, id), eq(bankStatementLine.organizationId, orgId)));
  revalidatePath("/contabilidad/conciliacion");
}
