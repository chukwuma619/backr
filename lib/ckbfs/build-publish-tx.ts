/**
 * Build a CKB transaction to publish post content on-chain.
 * Uses a simple data cell: lock = creator, type = null, data = encoded post.
 * Content is stored on CKB for permanence and verification.
 */

import { Address, Transaction, fixedPointFrom } from "@ckb-ccc/core";
import type { Signer } from "@ckb-ccc/core";

const MIN_CELL_BASE_CKB = 61; // CKB minimum for empty cell

export type PublishPostParams = {
  title: string;
  body: string;
  postId: string;
  creatorAddress: string;
};

export function encodePostData(params: PublishPostParams): string {
  const payload = JSON.stringify({
    v: 1,
    postId: params.postId,
    title: params.title,
    body: params.body,
    ts: Date.now(),
  });
  return "0x" + Buffer.from(payload, "utf-8").toString("hex");
}

function capacityCkbForData(dataHex: string): number {
  const dataBytes = (dataHex.length - 2) / 2; // subtract "0x"
  return MIN_CELL_BASE_CKB + dataBytes;
}

export async function buildAndSendPublishTx(
  signer: Signer,
  params: PublishPostParams
): Promise<string> {
  const { script: lock } = await Address.fromString(
    params.creatorAddress,
    signer.client
  );
  const outputData = encodePostData(params);
  const capacityCkb = capacityCkbForData(outputData);

  const tx = Transaction.from({
    outputs: [
      {
        lock,
        capacity: fixedPointFrom(String(capacityCkb)),
        type: undefined,
      },
    ],
    outputsData: [outputData],
  });

  await tx.completeInputsByCapacity(signer);
  await tx.completeFeeBy(signer);
  const txHash = await signer.sendTransaction(tx);
  return txHash;
}

export function outpointFromTxHash(txHash: string, index = 0): string {
  return `${txHash}:${index}`;
}
