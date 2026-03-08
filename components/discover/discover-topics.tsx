"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { DISCOVER_TOPICS } from "@/lib/discover/constants";
import { cn } from "@/lib/utils";

export function DiscoverTopics() {
  const searchParams = useSearchParams();
  const selectedTopic = searchParams.get("topic");

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none">
      <Link
        href="/dashboard/discover"
        className={cn(
          "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
          !selectedTopic
            ? "bg-primary text-primary-foreground"
            : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
        )}
      >
        All
      </Link>
      {DISCOVER_TOPICS.map(({ slug, label }) => (
        <Link
          key={slug}
          href={`/dashboard/discover?topic=${slug}`}
          className={cn(
            "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
            selectedTopic === slug
              ? "bg-primary text-primary-foreground"
              : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
          )}
        >
          {label}
        </Link>
      ))}
    </div>
  );
}
