import type { Post } from "@/lib/db/schema";

const MARKDOWN_IMG = /!\[[^\]]*\]\((https?:\/\/[^)\s]+)\)/i;
const PLAIN_IMG_URL =
  /(https?:\/\/[^\s<>"']+\.(?:png|jpe?g|gif|webp|avif)(?:\?[^\s<>"']*)?)/i;

/** Public hero image: explicit cover, else first image URL in body text. */
export function getPublicPostHeroImage(
  post: Pick<Post, "coverImageUrl" | "content">
): string | null {
  const trimmed = post.coverImageUrl?.trim();
  if (trimmed) return trimmed;

  const content = post.content?.trim();
  if (!content) return null;

  const md = MARKDOWN_IMG.exec(content);
  if (md?.[1]) return md[1];

  const plain = PLAIN_IMG_URL.exec(content);
  if (plain?.[1]) return plain[1];

  return null;
}
