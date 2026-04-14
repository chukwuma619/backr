import { getCreatorForDashboard } from "@/lib/creators/get-creator-for-dashboard";
import { getCreatorTopicSlugs } from "@/lib/db/queries";
import { BasicSettingsForm } from "@/components/creator/basic-settings-form";

export default async function BasicSettingsPage() {
  const { creator } = await getCreatorForDashboard();
  if (!creator) return null;

  const { data: topicSlugs } = await getCreatorTopicSlugs(creator.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Basic settings</h1>
        <p className="text-muted-foreground">
          Update your profile and account details.
        </p>
      </div>
      <BasicSettingsForm
        data={{
          username: creator.username,
          displayName: creator.displayName,
          bio: creator.bio,
          avatarUrl: creator.avatarUrl ?? null,
          coverImageUrl: creator.coverImageUrl ?? null,
          fiberNodeRpcUrl: creator.fiberNodeRpcUrl ?? null,
          topicSlugs: topicSlugs ?? [],
        }}
      />
    </div>
  );
}
