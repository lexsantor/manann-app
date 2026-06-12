CREATE TYPE "public"."charge_direction" AS ENUM('cost', 'revenue');--> statement-breakpoint
CREATE TYPE "public"."invoice_status" AS ENUM('borrador', 'emitida', 'enviada', 'pagada', 'vencida', 'anulada');--> statement-breakpoint
CREATE TABLE "invoice" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shipment_id" uuid NOT NULL,
	"reference" text NOT NULL,
	"status" "invoice_status" DEFAULT 'borrador' NOT NULL,
	"issue_date" date,
	"due_date" date,
	"subtotal" numeric(12, 2) DEFAULT '0' NOT NULL,
	"tax_rate" numeric(5, 2) DEFAULT '21' NOT NULL,
	"total" numeric(12, 2) DEFAULT '0' NOT NULL,
	"currency" text DEFAULT 'EUR' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoice_line" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_id" uuid NOT NULL,
	"concept" text NOT NULL,
	"quantity" numeric(10, 3) DEFAULT '1' NOT NULL,
	"unit_price" numeric(12, 2) NOT NULL,
	"tax_rate" numeric(5, 2) DEFAULT '21' NOT NULL,
	"subtotal" numeric(12, 2) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "charge" ADD COLUMN "direction" charge_direction DEFAULT 'cost' NOT NULL;--> statement-breakpoint
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_shipment_id_shipment_id_fk" FOREIGN KEY ("shipment_id") REFERENCES "public"."shipment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_line" ADD CONSTRAINT "invoice_line_invoice_id_invoice_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoice"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "invoice_shipment_id_idx" ON "invoice" USING btree ("shipment_id");