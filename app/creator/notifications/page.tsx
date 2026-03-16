import { formatDistanceToNow } from "date-fns";
import { getCreatorForDashboard } from "@/lib/creators/get-creator-for-dashboard";
import { getNotificationsForUser } from "@/lib/db/queries";

export default async function CreatorNotificationsPage() {
  const { user, creator } = await getCreatorForDashboard();

  if (!user || !creator) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
        <p className="text-sm text-muted-foreground">
          You need to be logged in as a creator to view notifications here.
        </p>
      </div>
    );
  }

  const { data } = await getNotificationsForUser(user.id);
  const notifications = data.filter((n) => n.creatorId === creator.id);

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Notifications
        </h1>
        <p className="text-sm text-muted-foreground">
          See what&apos;s new from your members across chats and posts.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)]">
        <div className="rounded-lg border bg-card">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h2 className="text-sm font-medium">All notifications</h2>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-muted-foreground">
                {notifications.length} total
              </span>
            </div>
          </div>

          <div className="divide-y">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-12 text-center text-sm text-muted-foreground">
                <p className="font-medium mb-1">You&apos;re all caught up</p>
                <p className="max-w-sm">
                  When supporters message you or interact with your work,
                  their activity will show up here.
                </p>
              </div>
            ) : (
              notifications.map((n) => {
                const isUnread = !n.readAt;
                const createdLabel = formatDistanceToNow(n.createdAt, {
                  addSuffix: true,
                });

                let title: string;
                let body: string;

                if (n.type === "new_post") {
                  title = "New post published";
                  body = n.postTitle
                    ? `You published “${n.postTitle}”.`
                    : "You published a new post.";
                } else {
                  title = "New message in chat";
                  body = "There&apos;s new activity in your community chat.";
                }

                return (
                  <div
                    key={n.id}
                    className={`flex items-start gap-3 px-4 py-3 ${
                      isUnread ? "bg-muted/50" : ""
                    }`}
                  >
                    <div className="mt-1 h-2 w-2 rounded-full bg-primary/70 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium truncate">{title}</p>
                        <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                          {createdLabel}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {body}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border bg-card p-4">
            <h2 className="text-sm font-medium mb-2">Filters</h2>
            <p className="text-xs text-muted-foreground mb-3">
              Notifications here are already scoped to your creator profile
              ({creator.displayName}).
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center justify-center rounded-md border bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-sm">
                All activity
              </span>
              <span className="inline-flex items-center justify-center rounded-md border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground">
                Posts
              </span>
              <span className="inline-flex items-center justify-center rounded-md border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground">
                Messages
              </span>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <h2 className="text-sm font-medium mb-2">How this works</h2>
            <p className="text-xs text-muted-foreground mb-3">
              We store notifications in the database so you can always see a
              history of what&apos;s happened with your community.
            </p>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>• New post notifications are created for eligible patrons.</li>
              <li>• New message notifications fire for other chat participants.</li>
              <li>• Only notifications tied to your creator profile show here.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

