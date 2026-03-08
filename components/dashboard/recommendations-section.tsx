import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getRecommendedCreatorsForUser } from "@/lib/db/queries";

export async function RecommendationsSection({ userId }: { userId: string }) {
  const { data: creators, error } = await getRecommendedCreatorsForUser(
    userId,
    6
  );

  if (error) {
    return null;
  }

  if (!creators || creators.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6 pt-8 border-t">
      <div>
        <h2 className="text-lg font-semibold tracking-tight mb-1">
          Recommendations
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Creators you might want to support
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {creators.map((creator) => (
          <Link key={creator.id} href={`/c/${creator.username}`}>
            <Card className="h-full hover:bg-muted/50 transition-colors cursor-pointer">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-lg font-semibold text-muted-foreground">
                    {creator.displayName.slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <CardTitle className="text-base">
                      {creator.displayName}
                    </CardTitle>
                    <CardDescription>@{creator.username}</CardDescription>
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
    </div>
  );
}
