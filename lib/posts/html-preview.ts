/** Strip tags for card previews and feed snippets. */
export function htmlToPlainPreview(html: string, maxLen: number): string {
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= maxLen) return text;
  return `${text.slice(0, maxLen)}…`;
}
