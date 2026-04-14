import type { CreatorCategory } from "@/lib/db/schema";

export const DISCOVER_TOPICS: { slug: CreatorCategory; label: string }[] = [
  { slug: "art", label: "Art & Design" },
  { slug: "music", label: "Music & Audio" },
  { slug: "podcasts", label: "Podcasts" },
  { slug: "gaming", label: "Gaming" },
  { slug: "writing", label: "Writing & Literature" },
  { slug: "tech", label: "Tech & Software" },
  { slug: "education", label: "Education" },
  { slug: "health", label: "Health & Fitness" },
  { slug: "lifestyle", label: "Lifestyle" },
  { slug: "comedy", label: "Comedy & Entertainment" },
  { slug: "photography", label: "Photography" },
  { slug: "video", label: "Video & Film" },
];
