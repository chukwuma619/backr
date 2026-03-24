import type { Post } from "@/lib/db/schema";

const HTML_IMG = /<img[^>]+src=["']([^"']+)["']/i;
const MARKDOWN_IMG = /!\[[^\]]*\]\((https?:\/\/[^)\s]+)\)/i;
const PLAIN_IMG_URL =
  /(https?:\/\/[^\s<>"']+\.(?:png|jpe?g|gif|webp|avif)(?:\?[^\s<>"']*)?)/i;

/** Public hero image: explicit cover, else first image URL in body text. */
export function getPublicPostHeroImage(
  post: Pick<Post, "coverImageUrl" | "content" | "contentCid">,
  resolvedBodyHtml?: string
): string | null {
  const trimmed = post.coverImageUrl?.trim();
  if (trimmed) return trimmed;

  const content = (resolvedBodyHtml ?? post.content)?.trim();
  if (!content) return null;

  const htmlImg = HTML_IMG.exec(content);
  if (htmlImg?.[1]) return htmlImg[1];

  const md = MARKDOWN_IMG.exec(content);
  if (md?.[1]) return md[1];

  const plain = PLAIN_IMG_URL.exec(content);
  if (plain?.[1]) return plain[1];

  return null;
}
