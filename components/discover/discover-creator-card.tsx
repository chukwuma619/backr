import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { Creator } from "@/lib/db/schema";
import { DISCOVER_TOPICS } from "@/lib/discover/constants";

function getCategoryLabel(category: string | null): string | null {
  if (!category) return null;
  const topic = DISCOVER_TOPICS.find((t) => t.slug === category);
  return topic?.label ?? null;
}

export function DiscoverCreatorCard({
  creator,
  variant = "carousel",
}: {
  creator: Creator;
  variant?: "carousel" | "grid";
}) {
  const categoryLabel = getCategoryLabel(creator.category);

  return (
    <Link href={`/c/${creator.username}`}>
      <Card
        className={cn(
          "h-full hover:bg-muted/50 transition-colors cursor-pointer",
          variant === "carousel" && "shrink-0 w-[280px]"
        )}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <Avatar size="lg" className="size-12">
              <AvatarFallback className="text-lg font-semibold">
                {creator.displayName.slice(0, 1).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base truncate">
                {creator.displayName}
              </CardTitle>
              <CardDescription className="truncate">
                @{creator.username}
              </CardDescription>
              {categoryLabel && (
                <span className="text-xs text-muted-foreground/80 mt-0.5 block">
                  {categoryLabel}
                </span>
              )}
            </div>
          </div>
        </CardHeader>
        {creator.bio && (
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {creator.bio}
            </p>
          </CardContent>
        )}
      </Card>
    </Link>
  );
}
