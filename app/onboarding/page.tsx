import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { getCreatorByUserId } from "@/lib/db/queries";
import { OnboardingForm } from "@/components/dashboard/onboarding-form";

export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/");
  }

  const { data, error } = await getCreatorByUserId(user.id);
  if (error) {
    console.error(error);
    return <div>Error: {error.message}</div>;
  }
  if (data) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground">
          Backr
        </Link>
        <Link href="/dashboard" className="text-sm font-medium">
          Dashboard
        </Link>
      </header>
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <OnboardingForm />
      </main>
    </div>
  );
}
