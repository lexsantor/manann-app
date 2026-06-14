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
