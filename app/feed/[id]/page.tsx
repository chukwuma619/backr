import { notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { getPostById, canPatronAccessPost } from "@/lib/db/queries";
import { format } from "date-fns";

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) notFound();

  const { data: post, error } = await getPostById(id);
  if (error || !post) notFound();

  const canAccess = await canPatronAccessPost(id, user.id);
  if (!canAccess) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <header className="border-b border-border px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Backr
          </Link>
          <Link href="/feed" className="text-sm font-medium">
            Feed
          </Link>
        </header>
        <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
          <h1 className="text-xl font-semibold">Access denied</h1>
          <p className="text-muted-foreground mt-2">
            You need to support this creator at the required tier to view this post.
          </p>
          <Link href="/feed" className="text-sm text-primary mt-4 inline-block">
            ← Back to feed
          </Link>
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
        <Link href="/feed" className="text-sm font-medium">
          Feed
        </Link>
      </header>
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <Link href="/feed" className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-block">
          ← Back to feed
        </Link>
        <article>
          <h1 className="text-2xl font-semibold tracking-tight">{post.title}</h1>
          <p className="text-sm text-muted-foreground mt-2">
            {format(new Date(post.publishedAt), "MMM d, yyyy")}
          </p>
          <div className="mt-6 prose prose-neutral dark:prose-invert max-w-none">
            <p className="whitespace-pre-wrap">{post.body}</p>
          </div>
        </article>
      </main>
    </div>
  );
}
