"server only";

import type { Post } from "@/lib/db/schema";
import {
  fetchPostBodyJsonFromCid,
  parseEncryptedPayload,
  parsePlainPayload,
} from "@/lib/posts/post-body-ipfs";
import {
  decryptHtmlPostContent,
  unsealPostKeyFromStorage,
} from "@/lib/crypto/post-content-crypto";

/** Safe to pass to client components (no sealed post key). */
export type PostWithResolvedBody = Omit<Post, "postKeyEncrypted"> & {
  resolvedBody: string;
};

function stripPostKey(post: Post): Omit<Post, "postKeyEncrypted"> {
  const { postKeyEncrypted: _, ...rest } = post;
  return rest;
}

/** Omit sealed key before passing `Post` to client components. */
export function stripPostKeyForClient(post: Post): Omit<Post, "postKeyEncrypted"> {
  return stripPostKey(post);
}

/**
 * @param canDecryptPaid — return true if the viewer may read full paid post body
 * (creator, or patron whose tier is in `post_paid_audience_tiers` for this post).
 */
export async function resolvePostBodyHtml(
  post: Post,
  canDecryptPaid: (post: Post) => boolean
): Promise<string> {
  const canReadPaid = canDecryptPaid(post);
  const cid = post.contentCid?.trim();

  if (!cid) {
    if (post.audience === "paid" && !canReadPaid) {
      return "";
    }
    return post.content ?? "";
  }

  let payload: unknown;
  try {
    payload = await fetchPostBodyJsonFromCid(cid);
  } catch {
    return post.content ?? "";
  }
  if (payload == null) {
    return post.content ?? "";
  }

  const plain = parsePlainPayload(payload);
  if (plain != null) {
    if (post.audience === "paid" && !canReadPaid) {
      return "";
    }
    return plain;
  }

  const encrypted = parseEncryptedPayload(payload);
  if (encrypted != null) {
    if (post.audience === "paid" && !canReadPaid) {
      return "";
    }
    const sealed = post.postKeyEncrypted?.trim();
    if (!sealed) {
      return "";
    }
    try {
      const postKey = unsealPostKeyFromStorage(sealed);
      return decryptHtmlPostContent(encrypted.encrypted, postKey);
    } catch {
      return "";
    }
  }

  return post.content ?? "";
}

export async function attachResolvedPostBodies(
  posts: Post[],
  canDecryptPaid: (post: Post) => boolean
): Promise<PostWithResolvedBody[]> {
  const bodies = await Promise.all(
    posts.map((p) => resolvePostBodyHtml(p, canDecryptPaid))
  );
  return posts.map((post, i) => ({
    ...stripPostKey(post),
    resolvedBody: bodies[i] ?? "",
  }));
}
