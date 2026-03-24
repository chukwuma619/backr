"server only";

import { cache } from "react";
import { pinata } from "@/lib/pinata-config";
import { gatewayFileUrl } from "@/lib/posts/gateway";
import {
  decryptHtmlPostContent,
  encryptHtmlPostContent,
  generatePostContentKey,
  sealPostKeyForStorage,
} from "@/lib/crypto/post-content-crypto";

export const POST_BODY_IPFS_VERSION = 1 as const;
export const POST_BODY_IPFS_VERSION_ENCRYPTED = 2 as const;

export type PostBodyIpfsPayloadPlain = {
  version: typeof POST_BODY_IPFS_VERSION;
  format: "tiptap-html";
  html: string;
};

export type PostBodyIpfsPayloadEncrypted = {
  version: typeof POST_BODY_IPFS_VERSION_ENCRYPTED;
  format: "tiptap-html+aes-gcm-v1";
  encrypted: { iv: string; ciphertext: string; tag: string };
};

export type PostBodyIpfsPayload =
  | PostBodyIpfsPayloadPlain
  | PostBodyIpfsPayloadEncrypted;

export async function uploadPostBodyToIpfs(
  html: string,
  postId: number,
  options: { encrypt: boolean }
): Promise<{ cid: string; postKeyEncrypted: string | null }> {
  if (!options.encrypt) {
    const payload: PostBodyIpfsPayloadPlain = {
      version: POST_BODY_IPFS_VERSION,
      format: "tiptap-html",
      html,
    };
    const result = await pinata.upload
      .public.json(payload)
      .name(`backr-post-${postId}.json`);
    if (!result.cid) {
      throw new Error("IPFS upload did not return a CID.");
    }
    return { cid: result.cid, postKeyEncrypted: null };
  }

  const postKey = generatePostContentKey();
  const encrypted = encryptHtmlPostContent(html, postKey);
  const payload: PostBodyIpfsPayloadEncrypted = {
    version: POST_BODY_IPFS_VERSION_ENCRYPTED,
    format: "tiptap-html+aes-gcm-v1",
    encrypted,
  };
  const result = await pinata.upload
    .public.json(payload)
    .name(`backr-post-${postId}.json`);
  if (!result.cid) {
    throw new Error("IPFS upload did not return a CID.");
  }
  const postKeyEncrypted = sealPostKeyForStorage(postKey);
  return { cid: result.cid, postKeyEncrypted };
}

export function parsePlainPayload(raw: unknown): string | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (o.version !== POST_BODY_IPFS_VERSION) return null;
  if (o.format !== "tiptap-html") return null;
  if (typeof o.html !== "string") return null;
  return o.html;
}

export function parseEncryptedPayload(
  raw: unknown
): PostBodyIpfsPayloadEncrypted | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (o.version !== POST_BODY_IPFS_VERSION_ENCRYPTED) return null;
  if (o.format !== "tiptap-html+aes-gcm-v1") return null;
  const enc = o.encrypted;
  if (!enc || typeof enc !== "object") return null;
  const e = enc as Record<string, unknown>;
  if (
    typeof e.iv !== "string" ||
    typeof e.ciphertext !== "string" ||
    typeof e.tag !== "string"
  ) {
    return null;
  }
  return {
    version: POST_BODY_IPFS_VERSION_ENCRYPTED,
    format: "tiptap-html+aes-gcm-v1",
    encrypted: { iv: e.iv, ciphertext: e.ciphertext, tag: e.tag },
  };
}

async function fetchTextWithFallback(urls: string[]): Promise<string> {
  let lastErr: unknown;
  for (const url of urls) {
    try {
      const res = await fetch(url, { next: { revalidate: 300 } });
      if (!res.ok) continue;
      return await res.text();
    } catch (e) {
      lastErr = e;
    }
  }
  if (lastErr) throw lastErr;
  throw new Error("Failed to fetch post body from IPFS.");
}

function ipfsPublicGatewayUrls(cid: string): string[] {
  return [
    `https://ipfs.io/ipfs/${cid}`,
    `https://cloudflare-ipfs.com/ipfs/${cid}`,
  ];
}

export const fetchPostBodyJsonFromCid = cache(async function fetchPostBodyJsonFromCid(
  cid: string
): Promise<unknown | null> {
  const primary = gatewayFileUrl(cid);
  const urls = [primary, ...ipfsPublicGatewayUrls(cid)];
  const text = await fetchTextWithFallback(urls);
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
});
