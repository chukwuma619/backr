/**
 * Fiber node JSON-RPC client.
 * Call invoice.new_invoice and payment.send_payment on a Fiber node.
 */

const CKB_SHANNONS = 100_000_000; // 1 CKB = 10^8 shannons

export function ckbToShannons(ckbAmount: string): bigint {
  const n = parseFloat(ckbAmount);
  if (Number.isNaN(n) || n < 0) return BigInt(0);
  return BigInt(Math.round(n * CKB_SHANNONS));
}

export type NewInvoiceParams = {
  amountCkb: string;
  currency: "CKB";
  description?: string;
  expiry?: number; // seconds
};

export type NewInvoiceResult = {
  invoice_address: string;
};

export type SendPaymentParams = {
  invoice: string;
};

export type SendPaymentResult = {
  payment_hash: string;
  status: string;
};

async function fiberRpc<T>(
  baseUrl: string,
  method: string,
  params: unknown
): Promise<T> {
  const url = baseUrl.replace(/\/$/, "");
  const res = await fetch(`${url}/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method,
      params: [params],
    }),
  });

  if (!res.ok) {
    throw new Error(`Fiber RPC HTTP ${res.status}: ${await res.text()}`);
  }

  const json = (await res.json()) as {
    jsonrpc?: string;
    id?: number;
    result?: T;
    error?: { code: number; message: string };
  };

  if (json.error) {
    throw new Error(`Fiber RPC error: ${json.error.message}`);
  }

  if (json.result === undefined) {
    throw new Error("Fiber RPC: no result");
  }

  return json.result as T;
}

export async function newInvoice(
  nodeRpcUrl: string,
  params: NewInvoiceParams
): Promise<NewInvoiceResult> {
  const { amountCkb, currency, description, expiry } = params;
  const shannons = ckbToShannons(amountCkb);
  const amountHex = shannons.toString(16);
  const rpcParams = {
    amount: `0x${amountHex}`,
    currency,
    description: description ?? undefined,
    expiry: expiry ?? 3600,
  };
  return fiberRpc<NewInvoiceResult>(nodeRpcUrl, "new_invoice", rpcParams);
}

export async function sendPayment(
  nodeRpcUrl: string,
  params: SendPaymentParams
): Promise<SendPaymentResult> {
  const rpcParams = { invoice: params.invoice };
  return fiberRpc<SendPaymentResult>(nodeRpcUrl, "send_payment", rpcParams);
}
