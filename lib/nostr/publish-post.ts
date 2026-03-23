/**
 * Publish posts to Nostr as NIP-23 long-form content (kind 30023).
 * Uses NIP-07 (window.nostr) for signing. Replaceable via d-tag = postId.
 */

import { SimplePool, type EventTemplate, type VerifiedEvent } from "nostr-tools";

import { DEFAULT_NOSTR_RELAYS } from "@/lib/nostr/default-relays";
import { normalizeNostrPubkeyHex } from "@/lib/nostr/normalize-pubkey";

declare global {
  interface Window {
    nostr?: {
      getPublicKey(): Promise<string>;
      signEvent(event: EventTemplate): Promise<VerifiedEvent>;
    };
  }
}

export type PublishPostParams = {
  postId: string | number;
  title: string;
  body: string;
  publishedAt?: Date;
};

function buildEventTemplate(params: PublishPostParams): EventTemplate {
  const tags: string[][] = [
    ["d", String(params.postId)],
    ["title", params.title],
    ["t", "backr"],
  ];
  if (params.publishedAt) {
    tags.push([
      "published_at",
      String(Math.floor(params.publishedAt.getTime() / 1000)),
    ]);
  }
  return {
    kind: 30023,
    created_at: Math.floor(Date.now() / 1000),
    tags,
    content: params.body,
  };
}

/** Get Nostr public key via NIP-07. Call from browser only. */
export async function getNostrPublicKey(): Promise<string> {
  if (typeof window === "undefined" || !window.nostr) {
    throw new Error(
      "Nostr extension (e.g. nos2x) not found. Install one to connect."
    );
  }
  const raw = await window.nostr.getPublicKey();
  return normalizeNostrPubkeyHex(raw);
}

export async function publishPostToNostr(
  params: PublishPostParams
): Promise<string> {
  if (typeof window === "undefined" || !window.nostr) {
    throw new Error(
      "Nostr extension (e.g. nos2x) not found. Install one to publish."
    );
  }
  const template = buildEventTemplate(params);
  const signed = await window.nostr.signEvent(template);
  const pool = new SimplePool();
  try {
    await Promise.all(pool.publish([...DEFAULT_NOSTR_RELAYS], signed));
    return signed.id;
  } finally {
    pool.close([...DEFAULT_NOSTR_RELAYS]);
  }
}

const NIP23_KIND = 30023;

/**
 * NIP-09 deletion request (kind 5). Relays that support it hide the target event.
 * Call from browser only (NIP-07).
 */
export async function deleteNostrEvent(eventIdHex: string): Promise<void> {
  if (typeof window === "undefined" || !window.nostr) {
    throw new Error(
      "Nostr extension (e.g. nos2x) not found. Install one to remove this post from relays."
    );
  }
  const id = eventIdHex.trim();
  if (!id) {
    throw new Error("Missing Nostr event id");
  }
  const template: EventTemplate = {
    kind: 5,
    created_at: Math.floor(Date.now() / 1000),
    tags: [
      ["e", id],
      ["k", String(NIP23_KIND)],
    ],
    content:
      "This post is no longer public on Nostr (paid-only on Backr).",
  };
  const signed = await window.nostr.signEvent(template);
  const pool = new SimplePool();
  try {
    await Promise.all(pool.publish([...DEFAULT_NOSTR_RELAYS], signed));
  } finally {
    pool.close([...DEFAULT_NOSTR_RELAYS]);
  }
}
