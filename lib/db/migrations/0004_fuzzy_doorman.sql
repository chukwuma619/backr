ALTER TABLE "creators" ADD COLUMN "fiber_node_rpc_url" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "fiber_node_rpc_url" text;--> statement-breakpoint
ALTER TABLE "patronage" DROP COLUMN "ckb_tx_hash";