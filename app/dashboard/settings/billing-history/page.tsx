import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { getBillingHistoryForUser } from "@/lib/db/queries";
import { BillingHistorySection } from "@/components/dashboard/billing-history-section";

export default async function BillingHistoryPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/");
  }

  const { data: records } = await getBillingHistoryForUser(user.id);

  return (
    <div className="max-w-2xl mx-auto w-full">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold tracking-tight">
          Billing history
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Your payment history for creator support.
        </p>
      </div>

      <BillingHistorySection records={records ?? []} />
    </div>
  );
}
