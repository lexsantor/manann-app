CREATE TYPE "public"."rate_unit" AS ENUM('contenedor', 'bl', 'kg', 'cbm', 'unidad', 'plano');--> statement-breakpoint
CREATE TABLE "rate" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"concept" text NOT NULL,
	"service_type" charge_type NOT NULL,
	"unit" "rate_unit" NOT NULL,
	"base_price" numeric(12, 2) NOT NULL,
	"currency" text DEFAULT 'EUR' NOT NULL,
	"valid_from" date,
	"valid_to" date,
	"notes" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "rate" ADD CONSTRAINT "rate_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "rate_org_idx" ON "rate" USING btree ("organization_id");