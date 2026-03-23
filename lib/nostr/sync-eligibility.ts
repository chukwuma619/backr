import type { PostAudience, PostStatus } from "@/lib/db/schema";

/**
 * Only sync **published, free** posts to public relays when Nostr is connected.
 * Skips drafts (not ready) and paid posts (full body must not be broadcast publicly).
 */
export function shouldSyncPostToNostr(params: {
  nostrPubkey: string | null | undefined;
  postStatus: PostStatus;
  audience: PostAudience | null | undefined;
}): boolean {
  if (!params.nostrPubkey?.trim()) return false;
  if (params.postStatus !== "published") return false;
  if ((params.audience ?? "free") !== "free") return false;
  return true;
}
