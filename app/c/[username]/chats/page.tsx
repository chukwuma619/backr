import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import {
  canPatronAccessGroupChat,
  getPublicCreatorBySlug,
  getPublicGroupChatsForCreator,
} from "@/lib/db/queries";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Props = {
  params: Promise<{ username: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const { data: creator } = await getPublicCreatorBySlug(username);
  if (!creator) {
    return { title: "Chats" };
  }
  return {
    title: `Chats · ${creator.displayName} (@${creator.username})`,
  };
}

export default async function CreatorChatsPage({ params }: Props) {
  const { username } = await params;
  const { data: creator } = await getPublicCreatorBySlug(username);
  if (!creator) {
    notFound();
  }

  const [user, { data: groupChats = [] }] = await Promise.all([
    getCurrentUser(),
    getPublicGroupChatsForCreator(creator.id),
  ]);

  const paidAccessByChatId = new Map<string, boolean>();
  if (user) {
    await Promise.all(
      groupChats
        .filter((c) => c.audience === "paid")
        .map(async (c) => {
          paidAccessByChatId.set(
            c.id,
            await canPatronAccessGroupChat(c.id, user.id)
          );
        })
    );
  }

  const displayTitle = (name: string | null) => {
    const n = name?.trim();
    if (n) return n;
    return `${creator.displayName} · Community`;
  };

  return (
    <div className="w-full px-4 pb-16 pt-6">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Chats</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            All community groups from {creator.displayName}. Member-only chats
            need a tier; free chats are open to everyone.
          </p>
        </div>

        {groupChats.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No community chats yet.
          </p>
        ) : (
          <ul className="space-y-4">
            {groupChats.map((chat) => {
              const isPaid = chat.audience === "paid";
              const hasPaidAccess =
                Boolean(user) && paidAccessByChatId.get(chat.id) === true;
              const dashboardHref = `/dashboard/chats?chat=${chat.id}`;
              const membershipHref = `/c/${username}/membership`;

              return (
                <li key={chat.id}>
                  <Card>
                    <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex min-w-0 gap-3">
                        <Avatar className="size-12 shrink-0">
                          <AvatarImage
                            src={chat.imageUrl ?? undefined}
                            alt=""
                            className="object-cover"
                          />
                          <AvatarFallback>
                            <MessageCircle
                              className="text-muted-foreground size-5"
                              aria-hidden
                            />
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <CardTitle className="text-lg">
                              {displayTitle(chat.name)}
                            </CardTitle>
                            {isPaid ? (
                              <Badge variant="secondary">Members</Badge>
                            ) : (
                              <Badge variant="outline">Free</Badge>
                            )}
                          </div>
                          <CardDescription>
                            {isPaid
                              ? "Members-only · join the right tier to unlock."
                              : "Free community chat · join from your dashboard."}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-wrap gap-2">
                        {!isPaid ? (
                          <>
                            <Button asChild size="sm" variant="default">
                              <Link href={user ? dashboardHref : "/"}>
                                Join for free
                              </Link>
                            </Button>
                            <Button asChild size="sm" variant="ghost">
                              <Link href={membershipHref}>Membership</Link>
                            </Button>
                          </>
                        ) : hasPaidAccess ? (
                          <>
                            <Button asChild size="sm" variant="default">
                              <Link href={dashboardHref}>Open chat</Link>
                            </Button>
                            <Button asChild size="sm" variant="ghost">
                              <Link href={membershipHref}>Membership</Link>
                            </Button>
                          </>
                        ) : (
                          <Button asChild size="sm" variant="default">
                            <Link href={membershipHref}>Join to unlock</Link>
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
