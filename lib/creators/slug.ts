const SLUG_REGEX = /^[a-z0-9-_]+$/;
const SLUG_MIN_LENGTH = 2;
const SLUG_MAX_LENGTH = 64;
const RESERVED_SLUGS = new Set(["api", "dashboard", "c", "me", "onboarding"]);

export function validateSlug(slug: unknown): { ok: true; slug: string } | { ok: false; error: string } {
  if (typeof slug !== "string") {
    return { ok: false, error: "Slug must be a string" };
  }
  const trimmed = slug.trim().toLowerCase();
  if (trimmed.length < SLUG_MIN_LENGTH) {
    return { ok: false, error: `Slug must be at least ${SLUG_MIN_LENGTH} characters` };
  }
  if (trimmed.length > SLUG_MAX_LENGTH) {
    return { ok: false, error: `Slug must be at most ${SLUG_MAX_LENGTH} characters` };
  }
  if (!SLUG_REGEX.test(trimmed)) {
    return { ok: false, error: "Slug can only contain lowercase letters, numbers, hyphens, and underscores" };
  }
  if (RESERVED_SLUGS.has(trimmed)) {
    return { ok: false, error: "This slug is reserved" };
  }
  return { ok: true, slug: trimmed };
}
