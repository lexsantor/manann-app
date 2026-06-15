// Dominio transitario de Manann.
// IDs UUID internos (gen_random_uuid). Identificadores externos (BL, contenedor,
// NIF) se guardan como CAMPOS, nunca como clave primaria.
import {
  pgTable,
  uuid,
  text,
  integer,
  numeric,
  boolean,
  timestamp,
  date,
  jsonb,
  index,
  unique,
  uniqueIndex,
  char,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

import { user } from "./auth";
import {
  memberRole,
  shipmentStatus,
  transportMode,
  shipmentPriority,
  partyRole,
  documentType,
  documentStatus,
  trackingEventType,
  trackingSource,
  chargeType,
  chargeDirection,
  invoiceStatus,
  rateUnit,
  quotationStatus,
  opportunityStage,
  bookingStatus,
  accountType,
  journalEntryStatus,
} from "./enums";

// ─── Tenant ───────────────────────────────────────────────────────────────

export const organization = pgTable("organization", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Pertenencia user↔org (un operador puede estar en varias orgs).
export const member = pgTable(
  "member",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: memberRole("role").notNull().default("member"),
    onboarded: boolean("onboarded").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    unique("member_org_user_uq").on(t.organizationId, t.userId),
    index("member_user_id_idx").on(t.userId),
  ],
);

// ─── Expediente (raíz del dominio) ──────────────────────────────────────────

export const shipment = pgTable(
  "shipment",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    // Referencia legible del expediente (EXP-2026-0042). Única por org.
    reference: text("reference").notNull(),
    status: shipmentStatus("status").notNull().default("borrador"),
    mode: transportMode("mode").notNull().default("maritimo"),
    priority: shipmentPriority("priority").notNull().default("med"),
    // Puertos en UN/LOCODE (ESBCN, NLRTM…).
    pol: text("pol"),
    pod: text("pod"),
    carrier: text("carrier"), // naviera
    vessel: text("vessel"), // buque
    voyage: text("voyage"),
    blNumber: text("bl_number"),
    incoterm: text("incoterm"), // FOB, CIF, DAP…
    freightTerms: text("freight_terms"), // prepaid / collect
    etd: timestamp("etd"),
    eta: timestamp("eta"),
    notes: text("notes"),
    // 3.2 — resumen ejecutivo IA
    aiSummary: text("ai_summary"),
    aiSummaryAt: timestamp("ai_summary_at"),
    // 3.5 — agente asignado (FK a member, no a user: es un rol en la org)
    assignedTo: uuid("assigned_to"),
    shareToken: text("share_token").unique(),
    shareTokenExpiresAt: timestamp("share_token_expires_at"),
    // Tier N — LCL / grupaje
    loadType: text("load_type").default("fcl"), // 'fcl' | 'lcl' | 'bulk'
    // Tier N — módulo courier
    courierProvider: text("courier_provider"), // 'ups' | 'dhl' | 'fedex'
    courierTrackingNumber: text("courier_tracking_number"),
    courierEstimatedDelivery: date("courier_estimated_delivery"),
    createdBy: text("created_by").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    unique("shipment_org_reference_uq").on(t.organizationId, t.reference),
    index("shipment_org_id_idx").on(t.organizationId),
    index("shipment_status_idx").on(t.status),
  ],
);

// ─── Partes del expediente (shipper, consignee, notify…) ────────────────────

export const party = pgTable(
  "party",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    shipmentId: uuid("shipment_id")
      .notNull()
      .references(() => shipment.id, { onDelete: "cascade" }),
    role: partyRole("role").notNull(),
    name: text("name").notNull(),
    taxId: text("tax_id"), // NIF/VAT — campo, nunca PK
    address: text("address"),
    city: text("city"),
    country: text("country"), // ISO 3166-1 alpha-2
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("party_shipment_id_idx").on(t.shipmentId)],
);

// ─── Tabla maestra de contactos ─────────────────────────────────────────────

export const contact = pgTable(
  "contact",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    role: partyRole("role").notNull().default("consignee"),
    taxId: text("tax_id"),
    email: text("email"),
    phone: text("phone"),
    address: text("address"),
    city: text("city"),
    country: text("country"),
    creditLimit: numeric("credit_limit", { precision: 12, scale: 2 }),
    active: boolean("active").notNull().default(true),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [index("contact_org_id_idx").on(t.organizationId)],
);

// ─── Contenedores ───────────────────────────────────────────────────────────

export const container = pgTable(
  "container",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    shipmentId: uuid("shipment_id")
      .notNull()
      .references(() => shipment.id, { onDelete: "cascade" }),
    containerNumber: text("container_number").notNull(), // ISO 6346
    sealNumber: text("seal_number"),
    isoType: text("iso_type"), // 22G1, 45G1…
    tareKg: integer("tare_kg"),
    grossWeightKg: integer("gross_weight_kg"),
    // Tier N — VGM (Verified Gross Mass) per IMO SOLAS
    vgmWeightKg: integer("vgm_weight_kg"),
    vgmMethod: text("vgm_method"), // 'method_1' (pesaje directo) | 'method_2' (cálculo)
    vgmDeclaredAt: timestamp("vgm_declared_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("container_shipment_id_idx").on(t.shipmentId)],
);

// ─── Líneas de mercancía ────────────────────────────────────────────────────

export const cargoLine = pgTable(
  "cargo_line",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    shipmentId: uuid("shipment_id")
      .notNull()
      .references(() => shipment.id, { onDelete: "cascade" }),
    containerId: uuid("container_id").references(() => container.id, {
      onDelete: "set null",
    }),
    description: text("description").notNull(),
    hsCode: text("hs_code"), // arancel
    packages: integer("packages"),
    packageType: text("package_type"), // pallets, cajas…
    grossWeightKg: integer("gross_weight_kg"),
    volumeCbm: numeric("volume_cbm", { precision: 10, scale: 3 }),
    marks: text("marks"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("cargo_line_shipment_id_idx").on(t.shipmentId)],
);

// ─── Documentos (upload PR-6, extracción IA PR-7) ───────────────────────────

export const document = pgTable(
  "document",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    shipmentId: uuid("shipment_id")
      .notNull()
      .references(() => shipment.id, { onDelete: "cascade" }),
    type: documentType("type").notNull().default("otro"),
    status: documentStatus("status").notNull().default("uploaded"),
    filename: text("filename").notNull(),
    blobUrl: text("blob_url"), // Vercel Blob
    mimeType: text("mime_type"),
    sizeBytes: integer("size_bytes"),
    aiConfidence: numeric("ai_confidence", { precision: 4, scale: 3 }), // 0-1 global
    // Propuesta de la IA (campos + confianza) entre extracción y confirmación.
    extraction: jsonb("extraction"),
    uploadedBy: text("uploaded_by").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [index("document_shipment_id_idx").on(t.shipmentId)],
);

// ─── Eventos de tracking ────────────────────────────────────────────────────

export const trackingEvent = pgTable(
  "tracking_event",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    shipmentId: uuid("shipment_id")
      .notNull()
      .references(() => shipment.id, { onDelete: "cascade" }),
    type: trackingEventType("type").notNull(),
    location: text("location"), // UN/LOCODE
    description: text("description"),
    vessel: text("vessel"),
    source: trackingSource("source").notNull().default("mock"),
    occurredAt: timestamp("occurred_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("tracking_event_shipment_id_idx").on(t.shipmentId)],
);

// ─── Cargos / costes ────────────────────────────────────────────────────────

export const charge = pgTable(
  "charge",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    shipmentId: uuid("shipment_id")
      .notNull()
      .references(() => shipment.id, { onDelete: "cascade" }),
    type: chargeType("type").notNull().default("otro"),
    description: text("description"),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    currency: text("currency").notNull().default("EUR"),
    direction: chargeDirection("direction").notNull().default("cost"),
    payableBy: partyRole("payable_by"),
    buyAmount: numeric("buy_amount", { precision: 12, scale: 2 }),
    passThrough: boolean("pass_through").notNull().default(false),
    atRisk: boolean("at_risk").notNull().default(false),
    accrualAmount: numeric("accrual_amount", { precision: 12, scale: 2 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("charge_shipment_id_idx").on(t.shipmentId)],
);

// ─── Facturas ────────────────────────────────────────────────────────────────

export const invoice = pgTable(
  "invoice",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    shipmentId: uuid("shipment_id")
      .notNull()
      .references(() => shipment.id, { onDelete: "cascade" }),
    reference: text("reference").notNull(),
    status: invoiceStatus("status").notNull().default("borrador"),
    issueDate: date("issue_date"),
    dueDate: date("due_date"),
    subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull().default("0"),
    taxRate: numeric("tax_rate", { precision: 5, scale: 2 }).notNull().default("21"),
    total: numeric("total", { precision: 12, scale: 2 }).notNull().default("0"),
    currency: text("currency").notNull().default("EUR"),
    clientName: text("client_name").notNull().default(""),
    clientNif: text("client_nif"),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [index("invoice_shipment_id_idx").on(t.shipmentId)],
);

export const invoiceLine = pgTable("invoice_line", {
  id: uuid("id").primaryKey().defaultRandom(),
  invoiceId: uuid("invoice_id")
    .notNull()
    .references(() => invoice.id, { onDelete: "cascade" }),
  concept: text("concept").notNull(),
  quantity: numeric("quantity", { precision: 10, scale: 3 }).notNull().default("1"),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
  taxRate: numeric("tax_rate", { precision: 5, scale: 2 }).notNull().default("21"),
  subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

// ─── Relations (para la query API de Drizzle en PR-5) ───────────────────────

export const organizationRelations = relations(organization, ({ many }) => ({
  members: many(member),
  shipments: many(shipment),
}));

export const memberRelations = relations(member, ({ one }) => ({
  organization: one(organization, {
    fields: [member.organizationId],
    references: [organization.id],
  }),
  user: one(user, { fields: [member.userId], references: [user.id] }),
}));

export const shipmentRelations = relations(shipment, ({ one, many }) => ({
  organization: one(organization, {
    fields: [shipment.organizationId],
    references: [organization.id],
  }),
  parties: many(party),
  containers: many(container),
  cargoLines: many(cargoLine),
  documents: many(document),
  trackingEvents: many(trackingEvent),
  charges: many(charge),
  invoices: many(invoice),
  bookings: many(booking),
}));

export const partyRelations = relations(party, ({ one }) => ({
  shipment: one(shipment, {
    fields: [party.shipmentId],
    references: [shipment.id],
  }),
}));

export const contactRelations = relations(contact, ({ one }) => ({
  organization: one(organization, {
    fields: [contact.organizationId],
    references: [organization.id],
  }),
}));

export const containerRelations = relations(container, ({ one, many }) => ({
  shipment: one(shipment, {
    fields: [container.shipmentId],
    references: [shipment.id],
  }),
  cargoLines: many(cargoLine),
}));

export const cargoLineRelations = relations(cargoLine, ({ one }) => ({
  shipment: one(shipment, {
    fields: [cargoLine.shipmentId],
    references: [shipment.id],
  }),
  container: one(container, {
    fields: [cargoLine.containerId],
    references: [container.id],
  }),
}));

export const documentRelations = relations(document, ({ one }) => ({
  shipment: one(shipment, {
    fields: [document.shipmentId],
    references: [shipment.id],
  }),
}));

export const trackingEventRelations = relations(trackingEvent, ({ one }) => ({
  shipment: one(shipment, {
    fields: [trackingEvent.shipmentId],
    references: [shipment.id],
  }),
}));

export const chargeRelations = relations(charge, ({ one }) => ({
  shipment: one(shipment, {
    fields: [charge.shipmentId],
    references: [shipment.id],
  }),
}));

export const invoiceRelations = relations(invoice, ({ one, many }) => ({
  shipment: one(shipment, {
    fields: [invoice.shipmentId],
    references: [shipment.id],
  }),
  lines: many(invoiceLine),
  journalEntries: many(journalEntry),
}));

export const invoiceLineRelations = relations(invoiceLine, ({ one }) => ({
  invoice: one(invoice, {
    fields: [invoiceLine.invoiceId],
    references: [invoice.id],
  }),
}));


// ─── Historial de cambios / auditoría (3.3) ─────────────────────────────────

export const fieldChange = pgTable(
  "field_change",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    shipmentId: uuid("shipment_id")
      .notNull()
      .references(() => shipment.id, { onDelete: "cascade" }),
    entity: text("entity").notNull(), // 'shipment'|'container'|'cargo_line'|'document'|'charge'
    entityId: uuid("entity_id").notNull(),
    field: text("field").notNull(),
    oldValue: text("old_value"),
    newValue: text("new_value"),
    changedBy: uuid("changed_by").references(() => member.id, {
      onDelete: "set null",
    }),
    source: text("source").notNull().default("user"), // 'user'|'ai'|'system'
    changedAt: timestamp("changed_at").defaultNow().notNull(),
  },
  (t) => [index("field_change_shipment_idx").on(t.shipmentId, t.changedAt)],
);

// ─── Suscripciones de tracking ShipsGo (3.1) ─────────────────────────────────

export const trackingSubscription = pgTable(
  "tracking_subscription",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    shipmentId: uuid("shipment_id")
      .notNull()
      .references(() => shipment.id, { onDelete: "cascade" }),
    provider: text("provider").notNull().default("shipsgo"),
    externalId: text("external_id"), // request/container id en ShipsGo
    containerNumber: text("container_number").notNull(),
    shippingLine: text("shipping_line").notNull(),
    status: text("status").notNull().default("active"), // 'active'|'finished'|'error'
    lastSyncedAt: timestamp("last_synced_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("tracking_sub_shipment_idx").on(t.shipmentId)],
);

// ─── Notificaciones in-app ────────────────────────────────────────────

export const notification = pgTable(
  "notification",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
    message: text("message").notNull(),
    shipmentId: uuid("shipment_id").references(() => shipment.id, { onDelete: "cascade" }),
    shipmentReference: text("shipment_reference"),
    read: timestamp("read"),
    riskAmount: numeric("risk_amount", { precision: 12, scale: 2 }),
    exceptionKind: text("exception_kind"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("notification_org_idx").on(t.organizationId)],
);

// ─── Catálogo de tarifas ──────────────────────────────────────────────────────

export const rate = pgTable(
  "rate",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    concept: text("concept").notNull(),
    serviceType: chargeType("service_type").notNull(),
    unit: rateUnit("unit").notNull(),
    basePrice: numeric("base_price", { precision: 12, scale: 2 }).notNull(),
    currency: text("currency").notNull().default("EUR"),
    validFrom: date("valid_from"),
    validTo: date("valid_to"),
    notes: text("notes"),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [index("rate_org_idx").on(t.organizationId)],
);

// ─── Cotizaciones ─────────────────────────────────────────────────────────────

export const quotation = pgTable(
  "quotation",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    reference: text("reference").notNull(),
    clientName: text("client_name").notNull().default(""),
    clientEmail: text("client_email"),
    status: quotationStatus("status").notNull().default("borrador"),
    validUntil: date("valid_until"),
    currency: text("currency").notNull().default("EUR"),
    subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull().default("0"),
    taxRate: text("tax_rate").notNull().default("21"),
    total: numeric("total", { precision: 12, scale: 2 }).notNull().default("0"),
    notes: text("notes"),
    shipmentId: uuid("shipment_id").references(() => shipment.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [index("quotation_org_idx").on(t.organizationId)],
);

export const quotationLine = pgTable("quotation_line", {
  id: uuid("id").primaryKey().defaultRandom(),
  quotationId: uuid("quotation_id")
    .notNull()
    .references(() => quotation.id, { onDelete: "cascade" }),
  concept: text("concept").notNull(),
  unit: rateUnit("unit").notNull().default("plano"),
  quantity: text("quantity").notNull().default("1"),
  unitPrice: text("unit_price").notNull().default("0"),
  subtotal: text("subtotal").notNull().default("0"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const quotationRelations = relations(quotation, ({ many }) => ({
  lines: many(quotationLine),
}));

export const quotationLineRelations = relations(quotationLine, ({ one }) => ({
  quotation: one(quotation, { fields: [quotationLine.quotationId], references: [quotation.id] }),
}));

// ─── Comentarios por expediente ─────────────────────────────────────────────

export const comment = pgTable(
  "comment",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    shipmentId: uuid("shipment_id")
      .notNull()
      .references(() => shipment.id, { onDelete: "cascade" }),
    authorId: uuid("author_id")
      .notNull()
      .references(() => member.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    mentions: text("mentions").array().notNull().default([]),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("comment_shipment_idx").on(t.shipmentId)],
);

export const commentRelations = relations(comment, ({ one }) => ({
  shipment: one(shipment, { fields: [comment.shipmentId], references: [shipment.id] }),
  author: one(member, { fields: [comment.authorId], references: [member.id] }),
}));

// ─── Invitaciones a la org ──────────────────────────────────────────────────

export const invitation = pgTable(
  "invitation",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    token: text("token").notNull().unique(),
    expiresAt: timestamp("expires_at").notNull(),
    usedAt: timestamp("used_at"),
    createdBy: text("created_by").references(() => user.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("invitation_token_idx").on(t.token),
    index("invitation_org_id_idx").on(t.organizationId),
  ],
);

export const invitationRelations = relations(invitation, ({ one }) => ({
  organization: one(organization, { fields: [invitation.organizationId], references: [organization.id] }),
}));

// ─── Pipeline / Oportunidades CRM ────────────────────────────────────────────

export const opportunity = pgTable(
  "opportunity",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    contactId: uuid("contact_id").references(
      () => contact.id,
      { onDelete: "set null" },
    ),
    title: text("title").notNull(),
    stage: opportunityStage("stage").notNull().default("prospecto"),
    mode: transportMode("mode"),
    pol: text("pol"),
    pod: text("pod"),
    cargoType: text("cargo_type"),
    estimatedValue: numeric("estimated_value", { precision: 12, scale: 2 }),
    currency: text("currency").notNull().default("EUR"),
    notes: text("notes"),
    assignedTo: uuid("assigned_to"),
    closedAt: timestamp("closed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [index("opportunity_org_id_idx").on(t.organizationId)],
);

export const opportunityRelations = relations(opportunity, ({ one }) => ({
  organization: one(organization, { fields: [opportunity.organizationId], references: [organization.id] }),
  contact: one(contact, { fields: [opportunity.contactId], references: [contact.id] }),
}));

// ─── Bookings DCSA 2.0 (Tier N) ──────────────────────────────────────────────

export const booking = pgTable(
  "booking",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    shipmentId: uuid("shipment_id").references(() => shipment.id, { onDelete: "set null" }),
    // Referencia del booking (asignada por la naviera al confirmar)
    carrierBookingRef: text("carrier_booking_ref"),
    carrierCode: text("carrier_code").notNull(), // SCAC
    vesselName: text("vessel_name"),
    voyageNumber: text("voyage_number"),
    pol: text("pol"),
    pod: text("pod"),
    etd: timestamp("etd"),
    eta: timestamp("eta"),
    // Cutoff VGM/carga (deadline para entregar el contenedor)
    cutoffDate: timestamp("cutoff_date"),
    status: bookingStatus("status").notNull().default("pendiente"),
    notes: text("notes"),
    createdBy: text("created_by").references(() => user.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    index("booking_org_id_idx").on(t.organizationId),
    index("booking_shipment_id_idx").on(t.shipmentId),
  ],
);

export const bookingRelations = relations(booking, ({ one }) => ({
  organization: one(organization, { fields: [booking.organizationId], references: [organization.id] }),
  shipment: one(shipment, { fields: [booking.shipmentId], references: [shipment.id] }),
}));

// ─── Contabilidad — Plan de cuentas PGC 2007 (Tier L) ───────────────────────

export const accountingAccount = pgTable(
  "accounting_account",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    code: text("code").notNull(),       // "430", "705", "477"…
    name: text("name").notNull(),
    type: accountType("type").notNull(), // activo/pasivo/patrimonio/ingreso/gasto
    isSystem: boolean("is_system").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    unique("accounting_account_org_code").on(t.organizationId, t.code),
    index("accounting_account_org_idx").on(t.organizationId),
  ],
);

export const accountingAccountRelations = relations(accountingAccount, ({ one }) => ({
  organization: one(organization, {
    fields: [accountingAccount.organizationId],
    references: [organization.id],
  }),
}));

// ─── Contabilidad — Asientos contables (Tier L) ──────────────────────────────

export const journalEntry = pgTable(
  "journal_entry",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    reference: text("reference").notNull(),   // "AST-2026-001"
    date: date("date").notNull(),
    description: text("description").notNull(),
    period: text("period").notNull(),         // "2026-06"
    status: journalEntryStatus("status").notNull().default("borrador"),
    invoiceId: uuid("invoice_id").references(() => invoice.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("journal_entry_org_idx").on(t.organizationId),
    index("journal_entry_period_idx").on(t.period),
  ],
);

export const journalEntryRelations = relations(journalEntry, ({ one, many }) => ({
  organization: one(organization, {
    fields: [journalEntry.organizationId],
    references: [organization.id],
  }),
  invoice: one(invoice, {
    fields: [journalEntry.invoiceId],
    references: [invoice.id],
  }),
  lines: many(journalEntryLine),
}));

export const journalEntryLine = pgTable("journal_entry_line", {
  id: uuid("id").primaryKey().defaultRandom(),
  journalEntryId: uuid("journal_entry_id")
    .notNull()
    .references(() => journalEntry.id, { onDelete: "cascade" }),
  accountCode: text("account_code").notNull(),
  accountName: text("account_name").notNull(),
  debit: numeric("debit", { precision: 14, scale: 2 }).notNull().default("0"),
  credit: numeric("credit", { precision: 14, scale: 2 }).notNull().default("0"),
  description: text("description"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const journalEntryLineRelations = relations(journalEntryLine, ({ one }) => ({
  entry: one(journalEntry, {
    fields: [journalEntryLine.journalEntryId],
    references: [journalEntry.id],
  }),
}));

// ─── Tier M: Compliance & e-Factura ──────────────────────────────────────────

export const complianceDeclaration = pgTable(
  "compliance_declaration",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    shipmentId: uuid("shipment_id").references(() => shipment.id, { onDelete: "set null" }),
    invoiceId: uuid("invoice_id").references(() => invoice.id, { onDelete: "set null" }),
    type: text("type").notNull(),
    referenceNumber: text("reference_number"),
    status: text("status").notNull().default("pendiente"),
    xmlHash: text("xml_hash"),
    submittedAt: timestamp("submitted_at"),
    data: jsonb("data"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("compliance_declaration_org_idx").on(t.organizationId),
    index("compliance_declaration_shipment_idx").on(t.shipmentId),
    index("compliance_declaration_invoice_idx").on(t.invoiceId),
  ],
);

export const complianceDeclarationRelations = relations(complianceDeclaration, ({ one }) => ({
  organization: one(organization, {
    fields: [complianceDeclaration.organizationId],
    references: [organization.id],
  }),
  shipment: one(shipment, {
    fields: [complianceDeclaration.shipmentId],
    references: [shipment.id],
  }),
  invoice: one(invoice, {
    fields: [complianceDeclaration.invoiceId],
    references: [invoice.id],
  }),
}));

// ─── Tier P: Ecosistema & Partners ───────────────────────────────────────────

export const partner = pgTable(
  "partner",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    type: text("type").notNull().default("agente"),
    region: text("region"),
    country: text("country"),
    services: text("services").array().notNull().default([]),
    contactEmail: text("contact_email"),
    contactPhone: text("contact_phone"),
    taxId: text("tax_id"),
    notes: text("notes"),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("partner_org_idx").on(t.organizationId)],
);

export const partnerRelations = relations(partner, ({ one }) => ({
  organization: one(organization, {
    fields: [partner.organizationId],
    references: [organization.id],
  }),
}));

export const sanctionsScreening = pgTable(
  "sanctions_screening",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    result: text("result").notNull().default("clear"),
    matches: jsonb("matches"),
    screenedAt: timestamp("screened_at").defaultNow().notNull(),
  },
  (t) => [index("sanctions_screening_org_idx").on(t.organizationId)],
);

export const sanctionsScreeningRelations = relations(sanctionsScreening, ({ one }) => ({
  organization: one(organization, {
    fields: [sanctionsScreening.organizationId],
    references: [organization.id],
  }),
}));
// ─── Tier Q: API pública ──────────────────────────────────────────────────────

export const apiKey = pgTable(
  "api_key",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    keyHash: text("key_hash").notNull().unique(),
    prefix: text("prefix").notNull(),
    lastUsedAt: timestamp("last_used_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("api_key_org_idx").on(t.organizationId)],
);

export const apiKeyRelations = relations(apiKey, ({ one }) => ({
  organization: one(organization, {
    fields: [apiKey.organizationId],
    references: [organization.id],
  }),
}));

export const webhook = pgTable(
  "webhook",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    events: text("events").array().notNull().default([]),
    secret: text("secret").notNull(),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("webhook_org_idx").on(t.organizationId)],
);

export const webhookRelations = relations(webhook, ({ one }) => ({
  organization: one(organization, {
    fields: [webhook.organizationId],
    references: [organization.id],
  }),
}));

// ─── Tier R: Tablas Maestras & Administración ─────────────────────────────────

export const chargeConcept = pgTable(
  "charge_concept",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    code: text("code").notNull(),
    name: text("name").notNull(),
    category: text("category").notNull().default("otro"),
    defaultDirection: text("default_direction").notNull().default("both"),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [uniqueIndex("charge_concept_org_code_idx").on(t.organizationId, t.code)],
);

export const chargeConceptRelations = relations(chargeConcept, ({ one }) => ({
  organization: one(organization, {
    fields: [chargeConcept.organizationId],
    references: [organization.id],
  }),
}));

export const exchangeRate = pgTable(
  "exchange_rate",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    baseCurrency: text("base_currency").notNull().default("EUR"),
    targetCurrency: text("target_currency").notNull(),
    rate: numeric("rate", { precision: 18, scale: 6 }).notNull(),
    validFrom: date("valid_from").notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    index("exchange_rate_org_idx").on(t.organizationId),
    uniqueIndex("exchange_rate_org_target_idx").on(t.organizationId, t.targetCurrency),
  ],
);

export const exchangeRateRelations = relations(exchangeRate, ({ one }) => ({
  organization: one(organization, {
    fields: [exchangeRate.organizationId],
    references: [organization.id],
  }),
}));

export const customsRegime = pgTable("customs_regime", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  active: boolean("active").notNull().default(true),
});

export const systemParam = pgTable(
  "system_param",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    key: text("key").notNull(),
    value: text("value").notNull(),
    label: text("label"),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [uniqueIndex("system_param_org_key_idx").on(t.organizationId, t.key)],
);

export const systemParamRelations = relations(systemParam, ({ one }) => ({
  organization: one(organization, {
    fields: [systemParam.organizationId],
    references: [organization.id],
  }),
}));

export const documentSeries = pgTable(
  "document_series",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    docType: text("doc_type").notNull(),
    prefix: text("prefix").notNull(),
    nextNumber: integer("next_number").notNull().default(1),
    padding: integer("padding").notNull().default(5),
    active: boolean("active").notNull().default(true),
  },
  (t) => [uniqueIndex("doc_series_org_type_idx").on(t.organizationId, t.docType)],
);

export const documentSeriesRelations = relations(documentSeries, ({ one }) => ({
  organization: one(organization, {
    fields: [documentSeries.organizationId],
    references: [organization.id],
  }),
}));

export const branch = pgTable(
  "branch",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    code: text("code").notNull(),
    name: text("name").notNull(),
    address: text("address"),
    city: text("city"),
    countryCode: text("country_code"),
    isHQ: boolean("is_hq").notNull().default(false),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [uniqueIndex("branch_org_code_idx").on(t.organizationId, t.code)],
);

export const branchRelations = relations(branch, ({ one }) => ({
  organization: one(organization, {
    fields: [branch.organizationId],
    references: [organization.id],
  }),
}));

// ─── Tier S: Módulos Operativos Faltantes ─────────────────────────────────────

export const flight = pgTable(
  "flight",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    flightNumber: text("flight_number").notNull(),
    airline: text("airline").notNull(),
    originIata: text("origin_iata").notNull(),
    destIata: text("dest_iata").notNull(),
    departureDate: date("departure_date").notNull(),
    arrivalDate: date("arrival_date").notNull(),
    aircraftType: text("aircraft_type"),
    capacityKg: integer("capacity_kg"),
    availableKg: integer("available_kg"),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("flight_org_idx").on(t.organizationId)],
);

export const flightRelations = relations(flight, ({ one }) => ({
  organization: one(organization, {
    fields: [flight.organizationId],
    references: [organization.id],
  }),
}));

export const airManifest = pgTable(
  "air_manifest",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    mawbNumber: text("mawb_number").notNull(),
    flightId: uuid("flight_id").references(() => flight.id, { onDelete: "set null" }),
    originIata: text("origin_iata").notNull(),
    destIata: text("dest_iata").notNull(),
    carrier: text("carrier").notNull(),
    totalPieces: integer("total_pieces").notNull().default(0),
    totalWeightKg: numeric("total_weight_kg", { precision: 10, scale: 2 }).notNull().default("0"),
    status: text("status").notNull().default("open"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("air_manifest_org_idx").on(t.organizationId)],
);

export const airManifestRelations = relations(airManifest, ({ one, many }) => ({
  organization: one(organization, {
    fields: [airManifest.organizationId],
    references: [organization.id],
  }),
  flight: one(flight, {
    fields: [airManifest.flightId],
    references: [flight.id],
  }),
  entries: many(airManifestEntry),
}));

export const airManifestEntry = pgTable(
  "air_manifest_entry",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    manifestId: uuid("manifest_id")
      .notNull()
      .references(() => airManifest.id, { onDelete: "cascade" }),
    shipmentId: uuid("shipment_id").references(() => shipment.id, { onDelete: "set null" }),
    hawbNumber: text("hawb_number").notNull(),
    consignee: text("consignee"),
    pieces: integer("pieces").notNull().default(1),
    weightKg: numeric("weight_kg", { precision: 10, scale: 2 }).notNull().default("0"),
    description: text("description"),
  },
  (t) => [index("air_manifest_entry_manifest_idx").on(t.manifestId)],
);

export const airManifestEntryRelations = relations(airManifestEntry, ({ one }) => ({
  manifest: one(airManifest, {
    fields: [airManifestEntry.manifestId],
    references: [airManifest.id],
  }),
  shipment: one(shipment, {
    fields: [airManifestEntry.shipmentId],
    references: [shipment.id],
  }),
}));

export const transportOrder = pgTable(
  "transport_order",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    reference: text("reference").notNull(),
    shipmentId: uuid("shipment_id").references(() => shipment.id, { onDelete: "set null" }),
    carrier: text("carrier").notNull(),
    driverName: text("driver_name"),
    licensePlate: text("license_plate"),
    origin: text("origin").notNull(),
    destination: text("destination").notNull(),
    pickupDate: date("pickup_date"),
    deliveryDate: date("delivery_date"),
    status: text("status").notNull().default("pendiente"),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("transport_order_org_idx").on(t.organizationId),
    uniqueIndex("transport_order_org_ref_idx").on(t.organizationId, t.reference),
  ],
);

export const transportOrderRelations = relations(transportOrder, ({ one }) => ({
  organization: one(organization, {
    fields: [transportOrder.organizationId],
    references: [organization.id],
  }),
  shipment: one(shipment, {
    fields: [transportOrder.shipmentId],
    references: [shipment.id],
  }),
}));

export const routeTemplate = pgTable(
  "route_template",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    mode: transportMode("mode").notNull().default("maritimo"),
    legs: jsonb("legs").notNull().default([]),
    transitDays: integer("transit_days"),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("route_template_org_idx").on(t.organizationId)],
);

export const routeTemplateRelations = relations(routeTemplate, ({ one }) => ({
  organization: one(organization, {
    fields: [routeTemplate.organizationId],
    references: [organization.id],
  }),
}));

// ─── Tier U: Contabilidad Completa ───────────────────────────────────────────

export const accountingPeriod = pgTable(
  "accounting_period",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    year: integer("year").notNull(),
    month: integer("month").notNull(),
    status: text("status").notNull().default("open"), // 'open' | 'closed'
    closedAt: timestamp("closed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("accounting_period_org_ym_idx").on(t.organizationId, t.year, t.month),
    index("accounting_period_org_idx").on(t.organizationId),
  ],
);

export const accountingPeriodRelations = relations(accountingPeriod, ({ one }) => ({
  organization: one(organization, {
    fields: [accountingPeriod.organizationId],
    references: [organization.id],
  }),
}));

export const bankStatementLine = pgTable(
  "bank_statement_line",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    statementDate: date("statement_date").notNull(),
    description: text("description").notNull(),
    amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
    currency: text("currency").notNull().default("EUR"),
    reconciled: boolean("reconciled").notNull().default(false),
    journalEntryId: uuid("journal_entry_id").references(() => journalEntry.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("bank_statement_line_org_idx").on(t.organizationId),
    index("bank_statement_line_date_idx").on(t.statementDate),
  ],
);

export const bankStatementLineRelations = relations(bankStatementLine, ({ one }) => ({
  organization: one(organization, {
    fields: [bankStatementLine.organizationId],
    references: [organization.id],
  }),
  journalEntry: one(journalEntry, {
    fields: [bankStatementLine.journalEntryId],
    references: [journalEntry.id],
  }),
}));

// ─── Tier T: Calidad & Procesos ───────────────────────────────────────────────

export const incident = pgTable(
  "incident",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    shipmentId: uuid("shipment_id").references(() => shipment.id, { onDelete: "set null" }),
    type: text("type").notNull(),           // 'retraso' | 'daño' | 'perdida' | 'documental'
    description: text("description").notNull(),
    responsible: text("responsible"),
    status: text("status").notNull().default("abierto"), // 'abierto' | 'en_gestion' | 'cerrado'
    resolutionDate: date("resolution_date"),
    impactCost: numeric("impact_cost", { precision: 12, scale: 2 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("incident_org_idx").on(t.organizationId)],
);

export const incidentRelations = relations(incident, ({ one }) => ({
  organization: one(organization, { fields: [incident.organizationId], references: [organization.id] }),
  shipment: one(shipment, { fields: [incident.shipmentId], references: [shipment.id] }),
}));

export const nonConformity = pgTable(
  "non_conformity",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    shipmentId: uuid("shipment_id").references(() => shipment.id, { onDelete: "set null" }),
    category: text("category").notNull(),   // 'proceso' | 'proveedor' | 'cliente' | 'externo'
    description: text("description").notNull(),
    rootCause: text("root_cause"),
    correctiveAction: text("corrective_action"),
    status: text("status").notNull().default("abierto"), // 'abierto' | 'en_revision' | 'cerrado'
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("nc_org_idx").on(t.organizationId)],
);

export const nonConformityRelations = relations(nonConformity, ({ one }) => ({
  organization: one(organization, { fields: [nonConformity.organizationId], references: [organization.id] }),
  shipment: one(shipment, { fields: [nonConformity.shipmentId], references: [shipment.id] }),
}));

export const slaDefinition = pgTable(
  "sla_definition",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    metric: text("metric").notNull(),       // 'cotizacion' | 'booking' | 'dua' | 'entrega'
    targetHours: integer("target_hours").notNull(),
    mode: text("mode"),                     // null = todos los modos
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("sla_org_idx").on(t.organizationId)],
);

export const slaDefinitionRelations = relations(slaDefinition, ({ one }) => ({
  organization: one(organization, { fields: [slaDefinition.organizationId], references: [organization.id] }),
}));

export const webhookEvent = pgTable(
  "webhook_event",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    webhookId: uuid("webhook_id").references(() => webhook.id, { onDelete: "set null" }),
    eventType: text("event_type").notNull(),
    payload: jsonb("payload").notNull().default({}),
    url: text("url").notNull(),
    statusCode: integer("status_code"),
    status: text("status").notNull().default("pendiente"), // 'entregado' | 'fallido' | 'reintentando'
    attempts: integer("attempts").notNull().default(1),
    lastAttemptAt: timestamp("last_attempt_at").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("webhook_event_org_idx").on(t.organizationId),
    index("webhook_event_created_idx").on(t.createdAt),
  ],
);

export const webhookEventRelations = relations(webhookEvent, ({ one }) => ({
  organization: one(organization, { fields: [webhookEvent.organizationId], references: [organization.id] }),
  webhook: one(webhook, { fields: [webhookEvent.webhookId], references: [webhook.id] }),
}));

// ─── Tier V — Red & Partners ─────────────────────────────────────────────────

export const orgProfile = pgTable("org_profile", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().unique().references(() => organization.id, { onDelete: "cascade" }),
  specialties: text("specialties").array().notNull().default([]),
  corridors: text("corridors").array().notNull().default([]),
  certifications: text("certifications").array().notNull().default([]),
  languages: text("languages").array().notNull().default([]),
  monthlyCapacity: integer("monthly_capacity"),
  bio: text("bio"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const orgProfileRelations = relations(orgProfile, ({ one }) => ({
  organization: one(organization, { fields: [orgProfile.organizationId], references: [organization.id] }),
}));

export const networkAgent = pgTable("network_agent", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  country: text("country").notNull(),
  city: text("city"),
  modes: text("modes").array().notNull().default([]),
  corridors: text("corridors").array().notNull().default([]),
  specialties: text("specialties").array().notNull().default([]),
  languages: text("languages").array().notNull().default([]),
  contactName: text("contact_name"),
  contactEmail: text("contact_email"),
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [
  index("network_agent_country_idx").on(t.country),
]);

export const tender = pgTable("tender", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  origin: text("origin").notNull(),
  destination: text("destination").notNull(),
  mode: text("mode").notNull(),
  cargoDescription: text("cargo_description"),
  weight: numeric("weight", { precision: 10, scale: 2 }),
  volume: numeric("volume", { precision: 10, scale: 2 }),
  targetDate: date("target_date"),
  responseDeadline: date("response_deadline"),
  status: text("status").notNull().default("abierto"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [
  index("tender_org_idx").on(t.organizationId),
]);

export const tenderRelations = relations(tender, ({ one, many }) => ({
  organization: one(organization, { fields: [tender.organizationId], references: [organization.id] }),
  bids: many(tenderBid),
}));

export const tenderBid = pgTable("tender_bid", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenderId: uuid("tender_id").notNull().references(() => tender.id, { onDelete: "cascade" }),
  agentId: uuid("agent_id").references(() => networkAgent.id, { onDelete: "set null" }),
  agentName: text("agent_name").notNull(),
  price: numeric("price", { precision: 12, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("EUR"),
  transitDays: integer("transit_days"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [
  index("tender_bid_tender_idx").on(t.tenderId),
]);

export const tenderBidRelations = relations(tenderBid, ({ one }) => ({
  tender: one(tender, { fields: [tenderBid.tenderId], references: [tender.id] }),
  agent: one(networkAgent, { fields: [tenderBid.agentId], references: [networkAgent.id] }),
}));

export const eBl = pgTable("ebl", {
  id: uuid("id").primaryKey().defaultRandom(),
  shipmentId: uuid("shipment_id").notNull().references(() => shipment.id, { onDelete: "cascade" }),
  organizationId: uuid("organization_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  blHash: text("bl_hash").notNull(),
  status: text("status").notNull().default("Original"),
  currentHolder: text("current_holder"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [
  index("ebl_shipment_idx").on(t.shipmentId),
  index("ebl_org_idx").on(t.organizationId),
]);

export const eBlRelations = relations(eBl, ({ one, many }) => ({
  shipment: one(shipment, { fields: [eBl.shipmentId], references: [shipment.id] }),
  organization: one(organization, { fields: [eBl.organizationId], references: [organization.id] }),
  transfers: many(eBlTransfer),
}));

export const eBlTransfer = pgTable("ebl_transfer", {
  id: uuid("id").primaryKey().defaultRandom(),
  eblId: uuid("ebl_id").notNull().references(() => eBl.id, { onDelete: "cascade" }),
  fromParty: text("from_party").notNull(),
  toParty: text("to_party").notNull(),
  action: text("action").notNull(),
  signedAt: timestamp("signed_at").defaultNow().notNull(),
}, (t) => [
  index("ebl_transfer_ebl_idx").on(t.eblId),
]);

export const eBlTransferRelations = relations(eBlTransfer, ({ one }) => ({
  eBl: one(eBl, { fields: [eBlTransfer.eblId], references: [eBl.id] }),
}));
