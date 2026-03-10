/**
 * Publish posts to Nostr as NIP-23 long-form content (kind 30023).
 * Uses NIP-07 (window.nostr) for signing. Replaceable via d-tag = postId.
 */

import { SimplePool, type EventTemplate, type VerifiedEvent } from "nostr-tools";

declare global {
  interface Window {
    nostr?: {
      getPublicKey(): Promise<string>;
      signEvent(event: EventTemplate): Promise<VerifiedEvent>;
    };
  }
}

const RELAYS = [
  "wss://relay.damus.io",
  "wss://relay.nostr.band",
  "wss://nos.lol",
];

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
  return window.nostr.getPublicKey();
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
    await Promise.all(pool.publish(RELAYS, signed));
    return signed.id;
  } finally {
    pool.close(RELAYS);
  }
}
