import { decode } from "nostr-tools/nip19";

/**
 * Normalize a Nostr pubkey from NIP-07 (`getPublicKey`) to lowercase hex.
 * Accepts 64-char hex or `npub1…` bech32.
 */
export function normalizeNostrPubkeyHex(raw: string): string {
  const s = raw.trim();
  if (/^[a-fA-F0-9]{64}$/.test(s)) {
    return s.toLowerCase();
  }
  try {
    const d = decode(s);
    if (d.type === "npub" && /^[a-fA-F0-9]{64}$/.test(d.data)) {
      return d.data.toLowerCase();
    }
  } catch {
    // fall through
  }
  throw new Error("Invalid Nostr public key (expected hex or npub)");
}
