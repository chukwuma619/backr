import Link from "next/link";
import { format } from "date-fns";
import { FileText, MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type NotificationItem = {
  id: string;
  type: "new_post" | "new_message";
  entityId: string;
  creatorId: string;
  creatorDisplayName: string;
  creatorUsername: string;
  creatorAvatarUrl: string | null;
  postTitle: string | null;
  readAt: Date | null;
  createdAt: Date;
};

export function NotificationsSection({
  notifications,
}: {
  notifications: NotificationItem[];
}) {
  if (notifications.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-12 text-center">
        <p className="text-muted-foreground text-sm">
          No notifications yet. When creators you support post new content or
          when there&apos;s activity in your community chats, you&apos;ll see it
          here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1 rounded-lg border bg-card">
      {notifications.map((n) => {
        const href =
          n.type === "new_post"
            ? `/c/${n.creatorUsername}`
            : `/dashboard/chats?chat=${n.entityId}`;
        const Icon = n.type === "new_post" ? FileText : MessageCircle;
        const label =
          n.type === "new_post"
            ? `New post: ${n.postTitle ?? "Untitled"}`
            : "New message in community chat";

        return (
          <Link
            key={n.id}
            href={href}
            className={cn(
              "flex items-start gap-3 p-4 transition-colors hover:bg-muted/50",
              !n.readAt && "bg-muted/30"
            )}
          >
            <Avatar size="sm" className="size-10 shrink-0">
              <AvatarImage src={n.creatorAvatarUrl ?? undefined} />
              <AvatarFallback>
                {n.creatorDisplayName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Icon className="size-4 shrink-0 text-muted-foreground" />
                <span className="font-medium text-sm">
                  {n.creatorDisplayName}
                </span>
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">{label}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {format(new Date(n.createdAt), "MMM d, h:mm a")}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
