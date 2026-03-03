export function getPlatformFeePercent(): number {
  const raw = process.env.PLATFORM_FEE_PERCENT;
  if (!raw) return 0;
  const n = parseFloat(raw);
  if (Number.isNaN(n) || n < 0 || n > 100) return 0;
  return n;
}

export function calculatePlatformFee(amount: string, percent?: number): string {
  const pct = percent ?? getPlatformFeePercent();
  if (pct <= 0) return "0";
  const amt = parseFloat(amount);
  if (Number.isNaN(amt)) return "0";
  const fee = (amt * pct) / 100;
  return fee.toFixed(8);
}
