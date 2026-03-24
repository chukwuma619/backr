/** Build URLs for files pinned on the configured Pinata gateway (same shape as client uploads). */

export function normalizeGatewayBase(gateway: string): string {
  const g = gateway.trim().replace(/\/$/, "");
  if (g.startsWith("http://") || g.startsWith("https://")) return g;
  return `https://${g}`;
}

export function gatewayFileUrl(cid: string): string {
  const gateway = process.env.NEXT_PUBLIC_GATEWAY_URL;
  if (!gateway) {
    throw new Error("Missing NEXT_PUBLIC_GATEWAY_URL.");
  }
  const base = normalizeGatewayBase(gateway);
  return `${base}/files/${cid}`;
}
