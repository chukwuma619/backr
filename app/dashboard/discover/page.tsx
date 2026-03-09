import Link from "next/link";
import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import {
  getAllCreatorsForDiscovery,
  getTrendingCreators,
  getNewCreators,
  getCreatorsByCategory,
  getRecommendedCreatorsForUser,
} from "@/lib/db/queries";
import { DiscoverSearch } from "@/components/discover/discover-search";
import { DiscoverTopics } from "@/components/discover/discover-topics";
import { DiscoverCreatorCarousel } from "@/components/discover/discover-creator-carousel";
import { DiscoverCreatorCard } from "@/components/discover/discover-creator-card";
import { DISCOVER_TOPICS } from "@/lib/discover/constants";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function DashboardDiscoverPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; topic?: string }>;
}) {
  const { q, topic } = await searchParams;
  const user = await getCurrentUser();

  const topicLabel = topic
    ? DISCOVER_TOPICS.find((t) => t.slug === topic)?.label ?? topic
    : null;

  const isSearchOrTopic = Boolean(q?.trim() || topic?.trim());

  const [
    searchResult,
    trendingResult,
    newResult,
    categoryResult,
    recommendedResult,
  ] = await Promise.all([
    getAllCreatorsForDiscovery(q, topic ?? undefined),
    getTrendingCreators(12),
    getNewCreators(12),
    topic ? getCreatorsByCategory(topic, 24) : Promise.resolve({ data: [] }),
    user ? getRecommendedCreatorsForUser(user.id, 12) : Promise.resolve({ data: [] }),
  ]);

  const searchCreators = searchResult.data ?? [];
  const trendingCreators = trendingResult.data ?? [];
  const newCreators = newResult.data ?? [];
  const categoryCreators = categoryResult.data ?? [];
  const recommendedCreators = recommendedResult.data ?? [];

  if (searchResult.error) {
    return (
      <div className=" mx-auto px-4 py-8">
        <p className="text-destructive">Error loading creators.</p>
      </div>
    );
  }

  return (
    <div className=" mx-auto w-full px-4 py-8 space-y-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight mb-2">
          Discover creators
        </h1>
        <p className="text-muted-foreground mb-6">
          Explore and support creators on Backr. Find creators by topic, browse
          trending and new arrivals, or search by name.
        </p>

        <Suspense
          fallback={
            <div className="h-10 mb-6 bg-muted rounded-md animate-pulse" />
          }
        >
          <DiscoverSearch defaultValue={q} className="mb-6" />
        </Suspense>

        <div className="mb-8">
          <p className="text-sm font-medium text-muted-foreground mb-3">
            Topics
          </p>
          <DiscoverTopics />
        </div>
      </div>

      {isSearchOrTopic ? (
        <section>
          <h2 className="text-lg font-semibold tracking-tight mb-4">
            {topicLabel
              ? `Creators in ${topicLabel}`
              : "Search results"}
          </h2>
          {searchCreators.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {searchCreators.map((creator) => (
                <DiscoverCreatorCard
                  key={creator.id}
                  creator={creator}
                  variant="grid"
                  topicLabel={topicLabel ?? undefined}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No creators found</CardTitle>
                <CardDescription>
                  {q
                    ? "Try a different search term."
                    : topicLabel
                      ? `No creators in ${topicLabel} yet.`
                      : "No creators have joined yet. Be the first!"}
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </section>
      ) : (
        <div className="space-y-12">
          {recommendedCreators.length > 0 && (
            <DiscoverCreatorCarousel
              creators={recommendedCreators}
              title="For you"
              description="Based on your memberships and interests"
            />
          )}

          <DiscoverCreatorCarousel
            creators={trendingCreators}
            title="Popular creators"
            description="Creators with the most supporters"
          />

          <DiscoverCreatorCarousel
            creators={newCreators}
            title="New on Backr"
            description="Recently joined creators"
          />
        </div>
      )}
    </div>
  );
}
