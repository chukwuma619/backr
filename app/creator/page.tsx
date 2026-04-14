import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { getCreatorForDashboard } from "@/lib/creators/get-creator-for-dashboard";
import {
  getPatronageStatsByCreatorId,
  getNotificationsForUser,
} from "@/lib/db/queries";

export default async function CreatorDashboardPage() {
  const { user, creator } = await getCreatorForDashboard();

  if (!user || !creator) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">
          Creator dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          You need to be logged in as a creator to see your dashboard.
        </p>
      </div>
    );
  }

  const [{ data: patronStats }, { data: rawNotifications }] = await Promise.all([
    getPatronageStatsByCreatorId(creator.id),
    getNotificationsForUser(user.id, 50),
  ]);

  const notifications = rawNotifications.filter(
    (n) => n.creatorId === creator.id
  );

  const activePatrons = patronStats?.patronCount ?? 0;
  const monthlyRecurring = patronStats
    ? parseFloat(patronStats.totalEarnings).toFixed(2)
    : "0.00";

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const messagesThisWeek = notifications.filter(
    (n) => n.type === "new_message" && n.createdAt > oneWeekAgo
  ).length;

  const recentActivity = notifications.slice(0, 5);

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Creator dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          See how your membership is doing and jump back into your work.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground">
            Active patrons
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-tight">
            {activePatrons}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Total members currently supporting you.
          </p>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground">
            Monthly recurring
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-tight">
            {monthlyRecurring === "0.00" ? "—" : `${monthlyRecurring} CKB`}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Estimated recurring support across tiers.
          </p>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground">
            Messages this week
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-tight">
            {messagesThisWeek || "—"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Conversations happening with your community.
          </p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div className="space-y-4">
          <div className="rounded-lg border bg-card p-4">
            <h2 className="text-sm font-medium mb-3">Quick actions</h2>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/creator/post/draft"
                className="inline-flex items-center justify-center rounded-md border bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
              >
                Create a post
              </Link>
              <Link
                href="/creator/settings/membership-plan"
                className="inline-flex items-center justify-center rounded-md border bg-background px-3 py-1.5 text-xs font-medium shadow-sm transition-colors hover:bg-muted"
              >
                Manage tiers
              </Link>
              <Link
                href="/creator/chats"
                className="inline-flex items-center justify-center rounded-md border bg-background px-3 py-1.5 text-xs font-medium shadow-sm transition-colors hover:bg-muted"
              >
                Open chats
              </Link>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <h2 className="text-sm font-medium mb-2">Next steps</h2>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>• Set up your first membership tier.</li>
              <li>• Invite your existing audience to join.</li>
              <li>• Start a welcome post or community thread.</li>
            </ul>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <h2 className="text-sm font-medium mb-2">Recent activity</h2>
          {recentActivity.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              When fans start supporting you, you&apos;ll see new signups,
              upgrades, and messages here.
            </p>
          ) : (
            <ul className="space-y-2">
              {recentActivity.map((n) => (
                <li
                  key={n.id}
                  className="flex items-start justify-between gap-2 text-xs"
                >
                  <div className="space-y-0.5">
                    <p className="font-medium">
                      {n.type === "new_post"
                        ? "New post published"
                        : "New message in chat"}
                    </p>
                    <p className="text-muted-foreground">
                      {n.type === "new_post"
                        ? n.postTitle
                          ? `“${n.postTitle}”`
                          : "You published a new post."
                        : "There&apos;s new activity in your community chat."}
                    </p>
                  </div>
                  <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(n.createdAt, { addSuffix: true })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
