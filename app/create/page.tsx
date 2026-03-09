import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { getCreatorByUserId } from "@/lib/db/queries";
import { CreatorRegistrationForm } from "@/components/create/creator-registration-form";

export default async function CreatePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/");
  }

  const { data: creator } = await getCreatorByUserId(user.id);
  if (creator) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl space-y-6">
        <CreatorRegistrationForm />
      </div>
    </div>
  );
}
