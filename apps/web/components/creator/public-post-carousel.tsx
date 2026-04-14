"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { PublicPostCard } from "@/components/creator/public-post-card";

export type PublicPostSlide = {
  id: number;
  title: string;
  dateLabel: string;
  heroImageUrl: string | null;
  canView: boolean;
  isPaid: boolean;
  previewText: string;
};

export function PublicPostCarousel({
  title,
  description,
  username,
  slides,
}: {
  title: string;
  description?: string;
  username: string;
  slides: PublicPostSlide[];
}) {
  if (slides.length === 0) return null;

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {description ? (
          <p className="text-muted-foreground mt-0.5 text-sm">{description}</p>
        ) : null}
      </div>

      <Carousel
        opts={{ align: "start", dragFree: true }}
        className="w-full"
      >
        <CarouselContent className="-ml-3">
          {slides.map((slide) => (
            <CarouselItem
              key={slide.id}
              className="basis-[min(100%,18rem)] pl-3 sm:basis-[45%] md:basis-[32%]"
            >
              <PublicPostCard
                username={username}
                title={slide.title}
                dateLabel={slide.dateLabel}
                heroImageUrl={slide.heroImageUrl}
                canView={slide.canView}
                isPaid={slide.isPaid}
                previewText={
                  slide.canView ? slide.previewText : undefined
                }
                variant="carousel"
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-1 top-[42%] -translate-y-1/2 sm:left-0" />
        <CarouselNext className="right-1 top-[42%] -translate-y-1/2 sm:right-0" />
      </Carousel>
    </section>
  );
}
