/**
 * Build a CKB transaction to publish post content on-chain.
 * Uses a simple data cell: lock = creator, type = null, data = encoded post.
 * Content is stored on CKB for permanence and verification.
 * Option 2: When updating, consumes the old cell and reuses its capacity.
 */

import {
  Address,
  Transaction,
  CellInput,
  OutPoint,
  fixedPointFrom,
} from "@ckb-ccc/core";
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

export function parseOutpoint(outpoint: string): { txHash: string; index: number } {
  const [txHash, indexStr] = outpoint.split(":");
  const index = parseInt(indexStr ?? "0", 10);
  if (!txHash || Number.isNaN(index)) {
    throw new Error(`Invalid outpoint: ${outpoint}`);
  }
  return { txHash, index };
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

/**
 * Update post on CKB: consume old cell, create new cell with updated content.
 * Creator pays the transaction fee (only). If new content is larger, creator pays extra capacity.
 */
export async function buildAndSendUpdateTx(
  signer: Signer,
  params: PublishPostParams & { oldOutpoint: string }
): Promise<string> {
  const { txHash, index } = parseOutpoint(params.oldOutpoint);
  const { script: lock } = await Address.fromString(
    params.creatorAddress,
    signer.client
  );
  const outputData = encodePostData(params);
  const capacityCkb = capacityCkbForData(outputData);
  const newCapacityShannons = fixedPointFrom(String(capacityCkb));

  const cellInput = CellInput.from({
    previousOutput: OutPoint.from({ txHash, index }),
  });
  await cellInput.completeExtraInfos(signer.client);

  const oldCapacity =
    cellInput.cellOutput?.capacity ?? BigInt(0);
  const capacityDeficit =
    newCapacityShannons > oldCapacity
      ? newCapacityShannons - oldCapacity
      : BigInt(0);

  const tx = Transaction.from({
    inputs: [cellInput],
    outputs: [
      {
        lock,
        capacity: fixedPointFrom(String(capacityCkb)),
        type: undefined,
      },
    ],
    outputsData: [outputData],
  });

  if (capacityDeficit > BigInt(0)) {
    await tx.completeInputsByCapacity(signer, capacityDeficit);
  }
  await tx.completeFeeBy(signer);
  const txHashResult = await signer.sendTransaction(tx);
  return txHashResult;
}

export function outpointFromTxHash(txHash: string, index = 0): string {
  return `${txHash}:${index}`;
}
