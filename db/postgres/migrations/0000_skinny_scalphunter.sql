CREATE TABLE "dhiya_demo_orders" (
	"id" text PRIMARY KEY NOT NULL,
	"session" text NOT NULL,
	"items" jsonb NOT NULL,
	"total" integer NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"method" text NOT NULL
);
--> statement-breakpoint
CREATE INDEX "dhiya_demo_orders_session_created_idx" ON "dhiya_demo_orders" USING btree ("session","created_at");