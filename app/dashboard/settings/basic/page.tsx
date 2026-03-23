import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { BasicSettingsForm } from "@/components/dashboard/basic-settings-form";

export default async function BasicSettingsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/");
  }

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Basic</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your account details and preferences.
        </p>
      </div>
      <BasicSettingsForm
        data={{
          ckbAddress: user.ckbAddress,
          avatarUrl: user.avatarUrl,
          fiberNodeRpcUrl: user.fiberNodeRpcUrl,
        }}
      />
    </div>
  );
}
