import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import {
  getPublicCreatorBySlug,
  getPublicGroupChatsForCreator,
} from "@/lib/db/queries";
import { PublicCreatorPageShell } from "@/components/creator/public-creator-page-shell";
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

  const displayTitle = (name: string | null) => {
    const n = name?.trim();
    if (n) return n;
    return `${creator.displayName} · Community`;
  };

  return (
    <PublicCreatorPageShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Chats</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Community spaces from {creator.displayName}. Join a tier if a chat
            is for members.
          </p>
        </div>

        {groupChats.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No community chats yet.
          </p>
        ) : (
          <ul className="space-y-4">
            {groupChats.map((chat) => (
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
                          {chat.audience === "paid" ? (
                            <Badge variant="secondary">Members</Badge>
                          ) : (
                            <Badge variant="outline">Free</Badge>
                          )}
                        </div>
                        <CardDescription>
                          Group chat · open in your dashboard to participate
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      {user ? (
                        <Button asChild size="sm" variant="default">
                          <Link href={`/dashboard/chats?chat=${chat.id}`}>
                            Open chat
                          </Link>
                        </Button>
                      ) : (
                        <Button asChild size="sm" variant="outline">
                          <Link href="/">Connect wallet to chat</Link>
                        </Button>
                      )}
                      <Button asChild size="sm" variant="ghost">
                        <Link href={`/c/${username}/membership`}>
                          Membership
                        </Link>
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>
    </PublicCreatorPageShell>
  );
}
