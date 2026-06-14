CREATE TYPE "public"."opportunity_stage" AS ENUM('prospecto', 'propuesta', 'negociacion', 'ganado', 'perdido');--> statement-breakpoint
CREATE TABLE "opportunity" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"contact_id" uuid,
	"title" text NOT NULL,
	"stage" "opportunity_stage" DEFAULT 'prospecto' NOT NULL,
	"mode" "transport_mode",
	"pol" text,
	"pod" text,
	"cargo_type" text,
	"estimated_value" numeric(12, 2),
	"currency" text DEFAULT 'EUR' NOT NULL,
	"notes" text,
	"assigned_to" uuid,
	"closed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "opportunity" ADD CONSTRAINT "opportunity_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunity" ADD CONSTRAINT "opportunity_contact_id_contact_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contact"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunity" ADD CONSTRAINT "opportunity_assigned_to_user_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "opportunity_org_id_idx" ON "opportunity" USING btree ("organization_id");