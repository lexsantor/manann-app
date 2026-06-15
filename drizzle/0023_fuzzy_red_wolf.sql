CREATE TABLE "ebl" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shipment_id" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	"bl_hash" text NOT NULL,
	"status" text DEFAULT 'Original' NOT NULL,
	"current_holder" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ebl_transfer" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ebl_id" uuid NOT NULL,
	"from_party" text NOT NULL,
	"to_party" text NOT NULL,
	"action" text NOT NULL,
	"signed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "network_agent" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"country" text NOT NULL,
	"city" text,
	"modes" text[] DEFAULT '{}' NOT NULL,
	"corridors" text[] DEFAULT '{}' NOT NULL,
	"specialties" text[] DEFAULT '{}' NOT NULL,
	"languages" text[] DEFAULT '{}' NOT NULL,
	"contact_name" text,
	"contact_email" text,
	"verified_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "org_profile" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"specialties" text[] DEFAULT '{}' NOT NULL,
	"corridors" text[] DEFAULT '{}' NOT NULL,
	"certifications" text[] DEFAULT '{}' NOT NULL,
	"languages" text[] DEFAULT '{}' NOT NULL,
	"monthly_capacity" integer,
	"bio" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "org_profile_organization_id_unique" UNIQUE("organization_id")
);
--> statement-breakpoint
CREATE TABLE "tender" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"title" text NOT NULL,
	"origin" text NOT NULL,
	"destination" text NOT NULL,
	"mode" text NOT NULL,
	"cargo_description" text,
	"weight" numeric(10, 2),
	"volume" numeric(10, 2),
	"target_date" date,
	"response_deadline" date,
	"status" text DEFAULT 'abierto' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tender_bid" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tender_id" uuid NOT NULL,
	"agent_id" uuid,
	"agent_name" text NOT NULL,
	"price" numeric(12, 2) NOT NULL,
	"currency" text DEFAULT 'EUR' NOT NULL,
	"transit_days" integer,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ebl" ADD CONSTRAINT "ebl_shipment_id_shipment_id_fk" FOREIGN KEY ("shipment_id") REFERENCES "public"."shipment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ebl" ADD CONSTRAINT "ebl_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ebl_transfer" ADD CONSTRAINT "ebl_transfer_ebl_id_ebl_id_fk" FOREIGN KEY ("ebl_id") REFERENCES "public"."ebl"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_profile" ADD CONSTRAINT "org_profile_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tender" ADD CONSTRAINT "tender_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tender_bid" ADD CONSTRAINT "tender_bid_tender_id_tender_id_fk" FOREIGN KEY ("tender_id") REFERENCES "public"."tender"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tender_bid" ADD CONSTRAINT "tender_bid_agent_id_network_agent_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."network_agent"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ebl_shipment_idx" ON "ebl" USING btree ("shipment_id");--> statement-breakpoint
CREATE INDEX "ebl_org_idx" ON "ebl" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "ebl_transfer_ebl_idx" ON "ebl_transfer" USING btree ("ebl_id");--> statement-breakpoint
CREATE INDEX "network_agent_country_idx" ON "network_agent" USING btree ("country");--> statement-breakpoint
CREATE INDEX "tender_org_idx" ON "tender" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "tender_bid_tender_idx" ON "tender_bid" USING btree ("tender_id");