const DEFAULT_PLATFORM_FEE_PERCENT = 5;

export function getPlatformFeePercent(): number {
  const raw = process.env.PLATFORM_FEE_PERCENT;
  if (!raw) return DEFAULT_PLATFORM_FEE_PERCENT;
  const n = parseFloat(raw);
  if (Number.isNaN(n) || n < 0 || n > 100) return DEFAULT_PLATFORM_FEE_PERCENT;
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

/** Creator receives (amount - platform fee). */
export function calculateCreatorAmount(amount: string, percent?: number): string {
  const fee = calculatePlatformFee(amount, percent);
  const amt = parseFloat(amount);
  const feeNum = parseFloat(fee);
  if (Number.isNaN(amt)) return amount;
  return (amt - feeNum).toFixed(8);
}
