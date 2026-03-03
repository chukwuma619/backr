import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { getAllCreatorsForDiscovery } from "@/lib/db/queries";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DiscoverSearch } from "@/components/discover/discover-search";

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const { data: creators, error } = await getAllCreatorsForDiscovery(q);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <header className="border-b border-border px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Backr
          </Link>
        </header>
        <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
          <p className="text-destructive">Error loading creators.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground">
          Backr
        </Link>
        <div className="flex gap-4">
          <Link href="/discover" className="text-sm font-medium">
            Discover
          </Link>
          <Link href="/feed" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Feed
          </Link>
          <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Dashboard
          </Link>
        </div>
      </header>
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        <h1 className="text-2xl font-semibold tracking-tight mb-2">Discover creators</h1>
        <p className="text-muted-foreground mb-6">
          Explore and support creators on Backr.
        </p>

        <Suspense fallback={<div className="h-10 mb-8 bg-muted rounded-md animate-pulse" />}>
          <DiscoverSearch defaultValue={q} className="mb-8" />
        </Suspense>

        {creators && creators.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {creators.map((creator) => (
              <Link key={creator.id} href={`/c/${creator.slug}`}>
                <Card className="h-full hover:bg-muted/50 transition-colors cursor-pointer">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      {creator.avatarUrl ? (
                        <Image
                          src={creator.avatarUrl}
                          alt={creator.displayName}
                          width={48}
                          height={48}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-lg font-semibold text-muted-foreground">
                          {creator.displayName.slice(0, 1).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-base">{creator.displayName}</CardTitle>
                        <CardDescription>@{creator.slug}</CardDescription>
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
            ))}
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>No creators found</CardTitle>
              <CardDescription>
                {q
                  ? "Try a different search term."
                  : "No creators have joined yet. Be the first!"}
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </main>
    </div>
  );
}
