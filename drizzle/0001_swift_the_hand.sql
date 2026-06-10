CREATE TYPE "public"."charge_type" AS ENUM('flete', 'aduana', 'manipulacion', 'seguro', 'documentacion', 'almacenaje', 'otro');--> statement-breakpoint
CREATE TYPE "public"."document_status" AS ENUM('uploaded', 'processing', 'extracted', 'confirmed', 'error');--> statement-breakpoint
CREATE TYPE "public"."document_type" AS ENUM('bl', 'factura_comercial', 'packing_list', 'dua', 'certificado_origen', 'otro');--> statement-breakpoint
CREATE TYPE "public"."member_role" AS ENUM('owner', 'member');--> statement-breakpoint
CREATE TYPE "public"."party_role" AS ENUM('shipper', 'consignee', 'notify', 'carrier', 'agent', 'forwarder');--> statement-breakpoint
CREATE TYPE "public"."shipment_priority" AS ENUM('low', 'med', 'high', 'urgent');--> statement-breakpoint
CREATE TYPE "public"."shipment_status" AS ENUM('borrador', 'confirmado', 'en_transito', 'en_aduana', 'entregado', 'cerrado');--> statement-breakpoint
CREATE TYPE "public"."tracking_event_type" AS ENUM('booking', 'gate_in', 'cargado', 'salida', 'en_transito', 'llegada', 'descargado', 'aduana', 'entregado');--> statement-breakpoint
CREATE TYPE "public"."tracking_source" AS ENUM('mock', 'shipsgo', 'manual');--> statement-breakpoint
CREATE TYPE "public"."transport_mode" AS ENUM('maritimo', 'aereo', 'terrestre', 'ferroviario', 'multimodal');--> statement-breakpoint
CREATE TABLE "cargo_line" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shipment_id" uuid NOT NULL,
	"container_id" uuid,
	"description" text NOT NULL,
	"hs_code" text,
	"packages" integer,
	"package_type" text,
	"gross_weight_kg" integer,
	"volume_cbm" numeric(10, 3),
	"marks" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "charge" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shipment_id" uuid NOT NULL,
	"type" charge_type DEFAULT 'otro' NOT NULL,
	"description" text,
	"amount" numeric(12, 2) NOT NULL,
	"currency" text DEFAULT 'EUR' NOT NULL,
	"payable_by" "party_role",
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "container" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shipment_id" uuid NOT NULL,
	"container_number" text NOT NULL,
	"seal_number" text,
	"iso_type" text,
	"tare_kg" integer,
	"gross_weight_kg" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "document" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shipment_id" uuid NOT NULL,
	"type" "document_type" DEFAULT 'otro' NOT NULL,
	"status" "document_status" DEFAULT 'uploaded' NOT NULL,
	"filename" text NOT NULL,
	"blob_url" text,
	"mime_type" text,
	"size_bytes" integer,
	"ai_confidence" numeric(4, 3),
	"uploaded_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "member" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"role" "member_role" DEFAULT 'member' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "member_org_user_uq" UNIQUE("organization_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "organization" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "organization_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "party" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shipment_id" uuid NOT NULL,
	"role" "party_role" NOT NULL,
	"name" text NOT NULL,
	"tax_id" text,
	"address" text,
	"city" text,
	"country" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shipment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"reference" text NOT NULL,
	"status" "shipment_status" DEFAULT 'borrador' NOT NULL,
	"mode" "transport_mode" DEFAULT 'maritimo' NOT NULL,
	"priority" "shipment_priority" DEFAULT 'med' NOT NULL,
	"pol" text,
	"pod" text,
	"carrier" text,
	"vessel" text,
	"voyage" text,
	"bl_number" text,
	"incoterm" text,
	"freight_terms" text,
	"etd" timestamp,
	"eta" timestamp,
	"created_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "shipment_org_reference_uq" UNIQUE("organization_id","reference")
);
--> statement-breakpoint
CREATE TABLE "tracking_event" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shipment_id" uuid NOT NULL,
	"type" "tracking_event_type" NOT NULL,
	"location" text,
	"description" text,
	"vessel" text,
	"source" "tracking_source" DEFAULT 'mock' NOT NULL,
	"occurred_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cargo_line" ADD CONSTRAINT "cargo_line_shipment_id_shipment_id_fk" FOREIGN KEY ("shipment_id") REFERENCES "public"."shipment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cargo_line" ADD CONSTRAINT "cargo_line_container_id_container_id_fk" FOREIGN KEY ("container_id") REFERENCES "public"."container"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "charge" ADD CONSTRAINT "charge_shipment_id_shipment_id_fk" FOREIGN KEY ("shipment_id") REFERENCES "public"."shipment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "container" ADD CONSTRAINT "container_shipment_id_shipment_id_fk" FOREIGN KEY ("shipment_id") REFERENCES "public"."shipment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document" ADD CONSTRAINT "document_shipment_id_shipment_id_fk" FOREIGN KEY ("shipment_id") REFERENCES "public"."shipment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document" ADD CONSTRAINT "document_uploaded_by_user_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "party" ADD CONSTRAINT "party_shipment_id_shipment_id_fk" FOREIGN KEY ("shipment_id") REFERENCES "public"."shipment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipment" ADD CONSTRAINT "shipment_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipment" ADD CONSTRAINT "shipment_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tracking_event" ADD CONSTRAINT "tracking_event_shipment_id_shipment_id_fk" FOREIGN KEY ("shipment_id") REFERENCES "public"."shipment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cargo_line_shipment_id_idx" ON "cargo_line" USING btree ("shipment_id");--> statement-breakpoint
CREATE INDEX "charge_shipment_id_idx" ON "charge" USING btree ("shipment_id");--> statement-breakpoint
CREATE INDEX "container_shipment_id_idx" ON "container" USING btree ("shipment_id");--> statement-breakpoint
CREATE INDEX "document_shipment_id_idx" ON "document" USING btree ("shipment_id");--> statement-breakpoint
CREATE INDEX "member_user_id_idx" ON "member" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "party_shipment_id_idx" ON "party" USING btree ("shipment_id");--> statement-breakpoint
CREATE INDEX "shipment_org_id_idx" ON "shipment" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "shipment_status_idx" ON "shipment" USING btree ("status");--> statement-breakpoint
CREATE INDEX "tracking_event_shipment_id_idx" ON "tracking_event" USING btree ("shipment_id");