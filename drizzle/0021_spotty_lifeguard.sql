CREATE TABLE "accounting_period" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"year" integer NOT NULL,
	"month" integer NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"closed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bank_statement_line" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"statement_date" date NOT NULL,
	"description" text NOT NULL,
	"amount" numeric(14, 2) NOT NULL,
	"currency" text DEFAULT 'EUR' NOT NULL,
	"reconciled" boolean DEFAULT false NOT NULL,
	"journal_entry_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accounting_period" ADD CONSTRAINT "accounting_period_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bank_statement_line" ADD CONSTRAINT "bank_statement_line_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bank_statement_line" ADD CONSTRAINT "bank_statement_line_journal_entry_id_journal_entry_id_fk" FOREIGN KEY ("journal_entry_id") REFERENCES "public"."journal_entry"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "accounting_period_org_ym_idx" ON "accounting_period" USING btree ("organization_id","year","month");--> statement-breakpoint
CREATE INDEX "accounting_period_org_idx" ON "accounting_period" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "bank_statement_line_org_idx" ON "bank_statement_line" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "bank_statement_line_date_idx" ON "bank_statement_line" USING btree ("statement_date");