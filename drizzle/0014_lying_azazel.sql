ALTER TYPE "public"."shipment_status" ADD VALUE 'facturado' BEFORE 'cerrado';--> statement-breakpoint
ALTER TABLE "charge" ADD COLUMN "accrual_amount" numeric(12, 2);