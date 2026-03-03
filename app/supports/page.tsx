import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { getPatronagesByUserId } from "@/lib/db/queries";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";
import { CancelPatronageButton } from "@/components/supports/cancel-patronage-button";

export default async function SupportsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  const { data: patronages, error } = await getPatronagesByUserId(user.id);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <header className="border-b border-border px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Backr
          </Link>
        </header>
        <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
          <p className="text-destructive">Error loading your supports.</p>
        </main>
      </div>
    );
  }

  const activePatronages = patronages?.filter((p) => p.patronage.status === "active") ?? [];
  const cancelledPatronages = patronages?.filter((p) => p.patronage.status === "cancelled") ?? [];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground">
          Backr
        </Link>
        <div className="flex gap-4">
          <Link href="/supports" className="text-sm font-medium">
            My supports
          </Link>
          <Link href="/feed" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Feed
          </Link>
          <Link href="/discover" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Discover
          </Link>
        </div>
      </header>
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <h1 className="text-2xl font-semibold tracking-tight mb-2">My supports</h1>
        <p className="text-muted-foreground mb-8">
          Creators you support. Cancel or renew your support.
        </p>

        {activePatronages.length > 0 && (
          <div className="space-y-4 mb-8">
            <h2 className="text-lg font-medium">Active</h2>
            {activePatronages.map(({ patronage: p, creatorDisplayName, creatorSlug, creatorAvatarUrl, tierName, tierPrice, tierCurrency }) => (
              <Card key={p.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-4">
                    <Link href={`/c/${creatorSlug}`} className="flex items-center gap-3 hover:opacity-80">
                      {creatorAvatarUrl ? (
                        <Image
                          src={creatorAvatarUrl}
                          alt={creatorDisplayName}
                          width={40}
                          height={40}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-semibold text-muted-foreground">
                          {creatorDisplayName.slice(0, 1).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-base">{creatorDisplayName}</CardTitle>
                        <CardDescription>
                          {tierName} · {tierPrice} {tierCurrency}/mo
                        </CardDescription>
                      </div>
                    </Link>
                    <CancelPatronageButton patronageId={p.id} />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground">
                    Last payment: {p.lastPaymentAt ? format(new Date(p.lastPaymentAt), "MMM d, yyyy") : "—"}
                    {p.nextDueAt && (
                      <> · Next due: {format(new Date(p.nextDueAt), "MMM d, yyyy")}</>
                    )}
                  </p>
                  <Link
                    href={`/c/${creatorSlug}`}
                    className="text-sm text-primary mt-2 inline-block"
                  >
                    Renew support →
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {cancelledPatronages.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-muted-foreground">Cancelled</h2>
            {cancelledPatronages.map(({ patronage: p, creatorDisplayName, creatorSlug, creatorAvatarUrl, tierName }) => (
              <Card key={p.id} className="opacity-75">
                <CardHeader className="pb-2">
                  <Link href={`/c/${creatorSlug}`} className="flex items-center gap-3 hover:opacity-80">
                    {creatorAvatarUrl ? (
                      <Image
                        src={creatorAvatarUrl}
                        alt={creatorDisplayName}
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-semibold text-muted-foreground">
                        {creatorDisplayName.slice(0, 1).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-base">{creatorDisplayName}</CardTitle>
                      <CardDescription>{tierName} · Cancelled</CardDescription>
                    </div>
                  </Link>
                </CardHeader>
                <CardContent className="pt-0">
                  <Link
                    href={`/c/${creatorSlug}`}
                    className="text-sm text-primary"
                  >
                    Support again →
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {patronages?.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>No supports yet</CardTitle>
              <CardDescription>
                Discover creators and choose a tier to support them.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/discover">
                <span className="text-sm font-medium text-primary hover:underline">
                  Discover creators →
                </span>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
