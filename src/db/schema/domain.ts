// Dominio transitario de Manann.
// IDs UUID internos (gen_random_uuid). Identificadores externos (BL, contenedor,
// NIF) se guardan como CAMPOS, nunca como clave primaria.
import {
  pgTable,
  uuid,
  text,
  integer,
  numeric,
  timestamp,
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
    payableBy: partyRole("payable_by"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("charge_shipment_id_idx").on(t.shipmentId)],
);

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
}));

export const partyRelations = relations(party, ({ one }) => ({
  shipment: one(shipment, {
    fields: [party.shipmentId],
    references: [shipment.id],
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
