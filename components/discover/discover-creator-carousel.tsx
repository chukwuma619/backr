"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DiscoverCreatorCard } from "@/components/discover/discover-creator-card";
import type { Creator } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

export function DiscoverCreatorCarousel({
  creators,
  title,
  description,
  className,
}: {
  creators: Creator[];
  title: string;
  description?: string;
  className?: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = 300;
    el.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  if (creators.length === 0) return null;

  return (
    <section className={cn("space-y-4", className)}>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          {description && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => scroll("left")}
            aria-label="Previous"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => scroll("right")}
            aria-label="Next"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none snap-x snap-mandatory"
      >
        {creators.map((creator) => (
          <div key={creator.id} className="snap-start">
            <DiscoverCreatorCard creator={creator} />
          </div>
        ))}
      </div>
    </section>
  );
}
