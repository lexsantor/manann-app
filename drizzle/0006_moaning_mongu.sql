ALTER TABLE "shipment" ADD COLUMN "share_token" text;--> statement-breakpoint
ALTER TABLE "shipment" ADD CONSTRAINT "shipment_share_token_unique" UNIQUE("share_token");