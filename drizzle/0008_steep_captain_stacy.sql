ALTER TABLE "invoice" ADD COLUMN "client_name" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "invoice" ADD COLUMN "client_nif" text;