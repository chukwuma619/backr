import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { getGatedFeedForPatron } from "@/lib/db/queries";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";

export default async function FeedPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  const { data: feedItems, error } = await getGatedFeedForPatron(user.id);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <header className="border-b border-border px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Backr
          </Link>
        </header>
        <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
          <p className="text-destructive">Error loading feed.</p>
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
          <Link href="/feed" className="text-sm font-medium">
            Feed
          </Link>
          <Link href="/supports" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            My supports
          </Link>
          <Link href="/discover" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Discover
          </Link>
          <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Dashboard
          </Link>
        </div>
      </header>
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <h1 className="text-2xl font-semibold tracking-tight mb-2">Your feed</h1>
        <p className="text-muted-foreground mb-8">
          Exclusive posts from creators you support.
        </p>

        {feedItems && feedItems.length > 0 ? (
          <div className="space-y-4">
            {feedItems.map(({ post, creatorDisplayName, minTierName }) => (
              <Link key={post.id} href={`/feed/${post.id}`}>
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-base">{post.title}</CardTitle>
                        <CardDescription>
                          By {creatorDisplayName} · {minTierName} tier
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {post.body}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {format(new Date(post.publishedAt), "MMM d, yyyy")}
                    </p>
                  </CardContent>
              </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>No posts yet</CardTitle>
              <CardDescription>
                Support creators to see their exclusive content here. Visit a creator hub and choose a tier to support.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/">
                <Button variant="outline">Discover creators</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
