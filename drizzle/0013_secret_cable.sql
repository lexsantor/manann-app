ALTER TABLE "charge" ADD COLUMN "buy_amount" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "charge" ADD COLUMN "pass_through" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "charge" ADD COLUMN "at_risk" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "notification" ADD COLUMN "risk_amount" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "notification" ADD COLUMN "exception_kind" text;