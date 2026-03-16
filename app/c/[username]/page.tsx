import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import {
  getCreatorBySlug,
  getCreatorSubscriptionForUser,
  getPatronagesByUserId,
} from "@/lib/db/queries";
import { SubscribeButton } from "@/components/creator/subscribe-button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

type Props = {
  params: Promise<{ username: string }>;
};

export default async function CreatorProfilePage({ params }: Props) {
  const { username } = await params;
  const [user, { data: creator }] = await Promise.all([
    getCurrentUser(),
    getCreatorBySlug(username),
  ]);

  if (!creator) {
    notFound();
  }

  let isSubscribed = false;
  let isPatron = false;

  if (user) {
    const [{ data: subscription }, { data: patronages }] = await Promise.all([
      getCreatorSubscriptionForUser(user.id, creator.id),
      getPatronagesByUserId(user.id),
    ]);

    isSubscribed = !!subscription;
    isPatron = patronages.some((p) => p.creatorId === creator.id);
  }

  return (
    <div className="container max-w-2xl py-8 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start gap-4">
            <Avatar size="lg" className="size-16 shrink-0">
              <AvatarFallback className="text-2xl font-semibold">
                {creator.displayName.slice(0, 1).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-2xl">{creator.displayName}</CardTitle>
              <CardDescription>@{creator.username}</CardDescription>
              {creator.bio && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {creator.bio}
                </p>
              )}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link href={`/c/${username}/membership`}>View membership</Link>
                </Button>
                {user && (
                  <SubscribeButton
                    username={username}
                    isSubscribed={isSubscribed}
                    isPatron={isPatron}
                  />
                )}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}
