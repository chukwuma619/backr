import Link from "next/link";
import { notFound } from "next/navigation";
import { getCreatorBySlug } from "@/lib/db/queries";
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
  const { data: creator } = await getCreatorBySlug(username);

  if (!creator) {
    notFound();
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
              <Button asChild size="sm" className="mt-4">
                <Link href={`/c/${username}/membership`}>View membership</Link>
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}
