import { noteEncode } from "nostr-tools/nip19";

/** Nostr gateway config: base URL and how to build event link. */
export const NOSTR_SHARE_GATEWAYS = [
  {
    name: "njump.me",
    url: (eventId: string) =>
      `https://njump.me/${noteEncode(eventId)}`,
  },
  {
    name: "nostr.band",
    url: (eventId: string) => `https://nostr.band/e/${eventId}`,
  },
  {
    name: "Snort",
    url: (eventId: string) => `https://snort.social/e/${eventId}`,
  },
  {
    name: "noStrudel",
    url: (eventId: string) => `https://nostrudel.ninja/e/${eventId}`,
  },
] as const;

/** Build njump.me URL for a Nostr event (shareable web link). */
export function getNjumpEventUrl(eventId: string): string {
  return NOSTR_SHARE_GATEWAYS[0].url(eventId);
}

/** Get all share URLs for a Nostr event. */
export function getNostrShareUrls(eventId: string) {
  return NOSTR_SHARE_GATEWAYS.map((g) => ({
    name: g.name,
    url: g.url(eventId),
  }));
}
