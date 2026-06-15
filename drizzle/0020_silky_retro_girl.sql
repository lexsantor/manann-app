CREATE TABLE "air_manifest" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"mawb_number" text NOT NULL,
	"flight_id" uuid,
	"origin_iata" text NOT NULL,
	"dest_iata" text NOT NULL,
	"carrier" text NOT NULL,
	"total_pieces" integer DEFAULT 0 NOT NULL,
	"total_weight_kg" numeric(10, 2) DEFAULT '0' NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "air_manifest_entry" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"manifest_id" uuid NOT NULL,
	"shipment_id" uuid,
	"hawb_number" text NOT NULL,
	"consignee" text,
	"pieces" integer DEFAULT 1 NOT NULL,
	"weight_kg" numeric(10, 2) DEFAULT '0' NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "flight" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"flight_number" text NOT NULL,
	"airline" text NOT NULL,
	"origin_iata" text NOT NULL,
	"dest_iata" text NOT NULL,
	"departure_date" date NOT NULL,
	"arrival_date" date NOT NULL,
	"aircraft_type" text,
	"capacity_kg" integer,
	"available_kg" integer,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "route_template" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"name" text NOT NULL,
	"mode" "transport_mode" DEFAULT 'maritimo' NOT NULL,
	"legs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"transit_days" integer,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transport_order" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"reference" text NOT NULL,
	"shipment_id" uuid,
	"carrier" text NOT NULL,
	"driver_name" text,
	"license_plate" text,
	"origin" text NOT NULL,
	"destination" text NOT NULL,
	"pickup_date" date,
	"delivery_date" date,
	"status" text DEFAULT 'pendiente' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "air_manifest" ADD CONSTRAINT "air_manifest_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "air_manifest" ADD CONSTRAINT "air_manifest_flight_id_flight_id_fk" FOREIGN KEY ("flight_id") REFERENCES "public"."flight"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "air_manifest_entry" ADD CONSTRAINT "air_manifest_entry_manifest_id_air_manifest_id_fk" FOREIGN KEY ("manifest_id") REFERENCES "public"."air_manifest"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "air_manifest_entry" ADD CONSTRAINT "air_manifest_entry_shipment_id_shipment_id_fk" FOREIGN KEY ("shipment_id") REFERENCES "public"."shipment"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flight" ADD CONSTRAINT "flight_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "route_template" ADD CONSTRAINT "route_template_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transport_order" ADD CONSTRAINT "transport_order_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transport_order" ADD CONSTRAINT "transport_order_shipment_id_shipment_id_fk" FOREIGN KEY ("shipment_id") REFERENCES "public"."shipment"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "air_manifest_org_idx" ON "air_manifest" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "air_manifest_entry_manifest_idx" ON "air_manifest_entry" USING btree ("manifest_id");--> statement-breakpoint
CREATE INDEX "flight_org_idx" ON "flight" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "route_template_org_idx" ON "route_template" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "transport_order_org_idx" ON "transport_order" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "transport_order_org_ref_idx" ON "transport_order" USING btree ("organization_id","reference");