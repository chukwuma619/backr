import { z } from "zod";
import type { SendPaymentParams } from "@/lib/fiber/fiber-rpc";

const hopHintSchema = z
  .object({
    pubkey: z.string().min(1),
  })
  .passthrough();

export const fiberPayBodySchema = z.object({
  creatorId: z.string().min(1),
  tierId: z.string().min(1),
  sendPaymentOptions: z
    .object({
      hop_hints: z.array(hopHintSchema).max(32).optional(),
      timeout: z.number().int().positive().max(7200).optional(),
      max_fee_amount: z.string().min(1).optional(),
      max_fee_rate: z.union([z.string(), z.number()]).optional(),
      max_parts: z.number().int().positive().max(128).optional(),
    })
    .strict()
    .optional(),
});

export type FiberPayBody = z.infer<typeof fiberPayBodySchema>;

export function fiberPayBodyToSendOptions(
  body: FiberPayBody
): Partial<SendPaymentParams> | undefined {
  const o = body.sendPaymentOptions;
  if (!o) return undefined;
  const out: Partial<SendPaymentParams> = {};
  if (o.hop_hints !== undefined) out.hop_hints = o.hop_hints;
  if (o.timeout !== undefined) out.timeout = o.timeout;
  if (o.max_fee_amount !== undefined) out.max_fee_amount = o.max_fee_amount;
  if (o.max_fee_rate !== undefined) out.max_fee_rate = o.max_fee_rate;
  if (o.max_parts !== undefined) out.max_parts = o.max_parts;
  return out;
}
