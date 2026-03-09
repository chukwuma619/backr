import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { getNotificationsForUser } from "@/lib/db/queries";
import { NotificationsSection } from "@/components/dashboard/notifications-section";

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/");
  }

  const { data: notifications } = await getNotificationsForUser(user.id);

  return (
    <div className=" w-full">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground text-sm mt-1">
          What&apos;s new with your favourite creators and their community. Tap
          any notification to view it.
        </p>
      </div>

      <NotificationsSection notifications={notifications ?? []} />
    </div>
  );
}
