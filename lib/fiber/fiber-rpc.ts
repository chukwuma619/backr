/** Fiber JSON-RPC client — https://docs.fiber.world/ */

const CKB_SHANNONS = 100_000_000; // 1 CKB = 10^8 shannons

export type FiberInvoiceCurrency = "Fibb" | "Fibt" | "Fibd";

export function getFiberInvoiceCurrency(): FiberInvoiceCurrency {
  const raw = process.env.FIBER_INVOICE_CURRENCY?.trim();
  if (raw === "Fibb" || raw === "Fibt" || raw === "Fibd") {
    return raw;
  }
  return "Fibt";
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  const out = { ...obj };
  for (const k of Object.keys(out)) {
    if (out[k as keyof T] === undefined) {
      delete out[k as keyof T];
    }
  }
  return out;
}

export function ckbToShannons(ckbAmount: string): bigint {
  const n = parseFloat(ckbAmount);
  if (Number.isNaN(n) || n < 0) return BigInt(0);
  return BigInt(Math.round(n * CKB_SHANNONS));
}

export type NewInvoiceParams = {
  amountCkb: string;
  currency?: FiberInvoiceCurrency;
  description?: string;
  expiry?: number;
};

export type NewInvoiceResult = {
  invoice_address: string;
};

export type FiberPaymentCommandResult = {
  payment_hash: string;
  status: string;
  failed_error?: string | null;
};

export type SendPaymentParams = {
  invoice: string;
  timeout?: number;
  max_fee_amount?: string;
  max_fee_rate?: string | number;
  max_parts?: number;
  hop_hints?: unknown[];
};

export function getFiberPaymentPollIntervalMs(): number {
  const raw = process.env.FIBER_PAYMENT_POLL_INTERVAL_MS;
  if (!raw) return 800;
  const n = parseInt(raw, 10);
  if (Number.isNaN(n) || n < 100) return 800;
  return Math.min(n, 10_000);
}

export function getFiberPaymentMaxWaitMs(): number {
  const raw = process.env.FIBER_PAYMENT_MAX_WAIT_MS;
  if (!raw) return 120_000;
  const n = parseInt(raw, 10);
  if (Number.isNaN(n) || n < 1000) return 120_000;
  return Math.min(n, 900_000);
}

export function getFiberSendPaymentExtrasFromEnv(): Partial<SendPaymentParams> {
  const extras: Partial<SendPaymentParams> = {};
  const timeoutRaw = process.env.FIBER_SEND_PAYMENT_TIMEOUT_SECONDS?.trim();
  if (timeoutRaw) {
    const t = parseInt(timeoutRaw, 10);
    if (!Number.isNaN(t) && t > 0 && t <= 7200) {
      extras.timeout = t;
    }
  }
  const maxFee = process.env.FIBER_SEND_PAYMENT_MAX_FEE_AMOUNT_HEX?.trim();
  if (maxFee) {
    extras.max_fee_amount = maxFee.startsWith("0x") || maxFee.startsWith("0X")
      ? maxFee
      : `0x${maxFee}`;
  }
  const maxRate = process.env.FIBER_SEND_PAYMENT_MAX_FEE_RATE?.trim();
  if (maxRate) {
    const n = parseInt(maxRate, 10);
    extras.max_fee_rate = Number.isNaN(n) ? maxRate : n;
  }
  const maxParts = process.env.FIBER_SEND_PAYMENT_MAX_PARTS?.trim();
  if (maxParts) {
    const n = parseInt(maxParts, 10);
    if (!Number.isNaN(n) && n > 0 && n <= 128) {
      extras.max_parts = n;
    }
  }
  const hintsJson = process.env.FIBER_SEND_PAYMENT_HOP_HINTS?.trim();
  if (hintsJson) {
    try {
      const parsed = JSON.parse(hintsJson) as unknown;
      if (Array.isArray(parsed)) {
        extras.hop_hints = parsed;
      }
    } catch {
      console.warn(
        "FIBER_SEND_PAYMENT_HOP_HINTS is not valid JSON; expected a JSON array. Ignoring."
      );
    }
  }
  return extras;
}

export function mergeSendPaymentParams(
  invoice: string,
  envExtras: Partial<SendPaymentParams>,
  requestExtras: Partial<SendPaymentParams> | undefined
): SendPaymentParams {
  return {
    ...envExtras,
    ...requestExtras,
    invoice,
  };
}

function normalizePaymentHashForRpc(paymentHash: string): string {
  const h = paymentHash.trim();
  if (h.startsWith("0x") || h.startsWith("0X")) {
    return h;
  }
  return `0x${h}`;
}

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
  const { amountCkb, currency: currencyOverride, description, expiry } = params;
  const shannons = ckbToShannons(amountCkb);
  const amountHex = shannons.toString(16);
  const currency = currencyOverride ?? getFiberInvoiceCurrency();
  const rpcParams = {
    amount: `0x${amountHex}`,
    currency,
    description: description ?? undefined,
    expiry: expiry ?? 3600,
  };
  return fiberRpc<NewInvoiceResult>(nodeRpcUrl, "new_invoice", rpcParams);
}

export function fiberPaymentSucceeded(status: string): boolean {
  const s = status.trim();
  return (
    s === "Success" ||
    s === "Succeeded" ||
    s.toLowerCase() === "success" ||
    s.toLowerCase() === "succeeded"
  );
}

export function fiberPaymentFailed(status: string): boolean {
  const s = status.trim();
  return s === "Failed" || s.toLowerCase() === "failed";
}

export function fiberPaymentPending(status: string): boolean {
  if (fiberPaymentSucceeded(status) || fiberPaymentFailed(status)) {
    return false;
  }
  const s = status.trim();
  return (
    s === "Created" ||
    s === "Inflight" ||
    s.toLowerCase() === "created" ||
    s.toLowerCase() === "inflight"
  );
}

export async function getPayment(
  nodeRpcUrl: string,
  paymentHash: string
): Promise<FiberPaymentCommandResult> {
  const rpcParams = {
    payment_hash: normalizePaymentHashForRpc(paymentHash),
  };
  return fiberRpc<FiberPaymentCommandResult>(nodeRpcUrl, "get_payment", rpcParams);
}

async function sendPaymentRpc(
  nodeRpcUrl: string,
  params: SendPaymentParams
): Promise<FiberPaymentCommandResult> {
  const { invoice, ...rest } = params;
  const rpcParams = stripUndefined({
    invoice,
    ...rest,
  } as Record<string, unknown>);
  return fiberRpc<FiberPaymentCommandResult>(
    nodeRpcUrl,
    "send_payment",
    rpcParams
  );
}

export async function sendPayment(
  nodeRpcUrl: string,
  params: SendPaymentParams
): Promise<FiberPaymentCommandResult> {
  return sendPaymentRpc(nodeRpcUrl, params);
}

export async function waitForFiberPayment(
  nodeRpcUrl: string,
  initial: FiberPaymentCommandResult,
  options?: { maxWaitMs?: number; pollIntervalMs?: number }
): Promise<FiberPaymentCommandResult> {
  const maxWait = options?.maxWaitMs ?? getFiberPaymentMaxWaitMs();
  const interval = options?.pollIntervalMs ?? getFiberPaymentPollIntervalMs();
  const start = Date.now();
  let current = initial;
  const hashKey = current.payment_hash;

  while (fiberPaymentPending(current.status)) {
    if (Date.now() - start > maxWait) {
      throw new Error(
        `Fiber payment still "${current.status}" after ${maxWait}ms (payment_hash: ${hashKey})`
      );
    }
    await sleep(interval);
    current = await getPayment(nodeRpcUrl, hashKey);
  }

  if (fiberPaymentFailed(current.status)) {
    const msg = current.failed_error?.trim();
    throw new Error(
      msg
        ? `Fiber payment failed (${current.status}): ${msg}`
        : `Fiber payment failed (${current.status})`
    );
  }

  if (!fiberPaymentSucceeded(current.status)) {
    throw new Error(
      `Fiber payment ended with unexpected status: ${current.status}`
    );
  }

  return current;
}

export async function sendPaymentAndWait(
  nodeRpcUrl: string,
  params: SendPaymentParams
): Promise<FiberPaymentCommandResult> {
  const initial = await sendPaymentRpc(nodeRpcUrl, params);
  if (fiberPaymentSucceeded(initial.status)) {
    return initial;
  }
  if (fiberPaymentFailed(initial.status)) {
    const msg = initial.failed_error?.trim();
    throw new Error(
      msg
        ? `Fiber payment failed (${initial.status}): ${msg}`
        : `Fiber payment failed (${initial.status})`
    );
  }
  return waitForFiberPayment(nodeRpcUrl, initial);
}
