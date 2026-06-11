CREATE TABLE "field_change" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shipment_id" uuid NOT NULL,
	"entity" text NOT NULL,
	"entity_id" uuid NOT NULL,
	"field" text NOT NULL,
	"old_value" text,
	"new_value" text,
	"changed_by" uuid,
	"source" text DEFAULT 'user' NOT NULL,
	"changed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tracking_subscription" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shipment_id" uuid NOT NULL,
	"provider" text DEFAULT 'shipsgo' NOT NULL,
	"external_id" text,
	"container_number" text NOT NULL,
	"shipping_line" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"last_synced_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "shipment" ADD COLUMN "ai_summary" text;--> statement-breakpoint
ALTER TABLE "shipment" ADD COLUMN "ai_summary_at" timestamp;--> statement-breakpoint
ALTER TABLE "shipment" ADD COLUMN "assigned_to" uuid;--> statement-breakpoint
ALTER TABLE "field_change" ADD CONSTRAINT "field_change_shipment_id_shipment_id_fk" FOREIGN KEY ("shipment_id") REFERENCES "public"."shipment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "field_change" ADD CONSTRAINT "field_change_changed_by_member_id_fk" FOREIGN KEY ("changed_by") REFERENCES "public"."member"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tracking_subscription" ADD CONSTRAINT "tracking_subscription_shipment_id_shipment_id_fk" FOREIGN KEY ("shipment_id") REFERENCES "public"."shipment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "field_change_shipment_idx" ON "field_change" USING btree ("shipment_id","changed_at");--> statement-breakpoint
CREATE INDEX "tracking_sub_shipment_idx" ON "tracking_subscription" USING btree ("shipment_id");