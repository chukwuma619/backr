import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { HomeFeedSection } from "@/components/dashboard/home-feed-section";
import { RecommendationsSection } from "@/components/dashboard/recommendations-section";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/");
  }


  return (
    <div className="max-w-2xl mx-auto w-full space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Home</h1>
        <p className="text-muted-foreground mt-1">
          Latest updates from creators you follow, with recommendations below.
        </p>
      </div>

      <HomeFeedSection userId={user.id} />
      <RecommendationsSection userId={user.id} />
    </div>
  );
}
