CREATE TYPE "public"."booking_status" AS ENUM('pendiente', 'recibido', 'confirmado', 'rechazado');--> statement-breakpoint
CREATE TABLE "booking" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"shipment_id" uuid,
	"carrier_booking_ref" text,
	"carrier_code" text NOT NULL,
	"vessel_name" text,
	"voyage_number" text,
	"pol" text,
	"pod" text,
	"etd" timestamp,
	"eta" timestamp,
	"cutoff_date" timestamp,
	"status" "booking_status" DEFAULT 'pendiente' NOT NULL,
	"notes" text,
	"created_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "opportunity" DROP CONSTRAINT "opportunity_assigned_to_user_id_fk";
--> statement-breakpoint
ALTER TABLE "container" ADD COLUMN "vgm_weight_kg" integer;--> statement-breakpoint
ALTER TABLE "container" ADD COLUMN "vgm_method" text;--> statement-breakpoint
ALTER TABLE "container" ADD COLUMN "vgm_declared_at" timestamp;--> statement-breakpoint
ALTER TABLE "shipment" ADD COLUMN "load_type" text DEFAULT 'fcl';--> statement-breakpoint
ALTER TABLE "shipment" ADD COLUMN "courier_provider" text;--> statement-breakpoint
ALTER TABLE "shipment" ADD COLUMN "courier_tracking_number" text;--> statement-breakpoint
ALTER TABLE "shipment" ADD COLUMN "courier_estimated_delivery" date;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_shipment_id_shipment_id_fk" FOREIGN KEY ("shipment_id") REFERENCES "public"."shipment"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "booking_org_id_idx" ON "booking" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "booking_shipment_id_idx" ON "booking" USING btree ("shipment_id");