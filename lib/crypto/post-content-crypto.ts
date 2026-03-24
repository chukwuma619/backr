"server only";

import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from "node:crypto";

const ALGO = "aes-256-gcm";
const IV_LENGTH = 12;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;

export function getPostContentMasterKey(): Buffer {
  const raw = process.env.POST_CONTENT_MASTER_KEY?.trim();
  if (!raw) {
    throw new Error(
      "POST_CONTENT_MASTER_KEY is required for encrypted paid posts (32-byte key as base64 or 64-char hex)."
    );
  }
  if (/^[0-9a-fA-F]{64}$/.test(raw)) {
    return Buffer.from(raw, "hex");
  }
  const buf = Buffer.from(raw, "base64");
  if (buf.length === KEY_LENGTH) {
    return buf;
  }
  throw new Error(
    "POST_CONTENT_MASTER_KEY must decode to 32 bytes (use openssl rand -base64 32)."
  );
}

export function generatePostContentKey(): Buffer {
  return randomBytes(KEY_LENGTH);
}

export function encryptHtmlPostContent(
  html: string,
  key: Buffer
): { iv: string; ciphertext: string; tag: string } {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGO, key, iv);
  const enc = Buffer.concat([
    cipher.update(Buffer.from(html, "utf8")),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return {
    iv: iv.toString("base64"),
    ciphertext: enc.toString("base64"),
    tag: tag.toString("base64"),
  };
}

export function decryptHtmlPostContent(
  encrypted: { iv: string; ciphertext: string; tag: string },
  key: Buffer
): string {
  const iv = Buffer.from(encrypted.iv, "base64");
  const ciphertext = Buffer.from(encrypted.ciphertext, "base64");
  const tag = Buffer.from(encrypted.tag, "base64");
  const decipher = createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return dec.toString("utf8");
}

/** Seal the per-post AES key for storage in Postgres (encrypted at rest with app master key). */
export function sealPostKeyForStorage(postKey: Buffer): string {
  const master = getPostContentMasterKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGO, master, iv);
  const enc = Buffer.concat([cipher.update(postKey), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, enc, tag]).toString("base64");
}

export function unsealPostKeyFromStorage(sealed: string): Buffer {
  const master = getPostContentMasterKey();
  const buf = Buffer.from(sealed, "base64");
  const iv = buf.subarray(0, IV_LENGTH);
  const tag = buf.subarray(buf.length - TAG_LENGTH);
  const enc = buf.subarray(IV_LENGTH, buf.length - TAG_LENGTH);
  const decipher = createDecipheriv(ALGO, master, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(enc), decipher.final()]);
}
