import { clearPostNostrEventId } from "@/app/actions/post";
import { deleteNostrEvent } from "@/lib/nostr/publish-post";

/**
 * After a post becomes paid-only, remove the prior NIP-23 publication from relays (NIP-09)
 * and clear `nostrEventId`. Requires NIP-07 in the browser.
 */
export async function removeNostrPublicationForPaidPost(params: {
  nostrEventId: string | null | undefined;
  postId: number;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const id = params.nostrEventId?.trim();
  if (!id) return { ok: true };

  try {
    await deleteNostrEvent(id);
  } catch (e) {
    return {
      ok: false,
      error:
        e instanceof Error
          ? e.message
          : "Failed to remove this post from Nostr relays",
    };
  }

  const clear = await clearPostNostrEventId(params.postId);
  if (clear?.message) {
    return { ok: false, error: clear.message };
  }
  return { ok: true };
}
