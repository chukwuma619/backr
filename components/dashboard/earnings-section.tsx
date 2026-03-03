import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getPatronageStatsByCreatorId,
  getPatronsByCreatorId,
  getEarningsOverTimeByCreatorId,
  getTopTiersByCreatorId,
} from "@/lib/db/queries";
import { format, parseISO } from "date-fns";

function truncateAddress(addr: string, head = 8, tail = 6) {
  if (addr.length <= head + tail) return addr;
  return `${addr.slice(0, head)}…${addr.slice(-tail)}`;
}

export async function EarningsSection({ creatorId }: { creatorId: string }) {
  const [
    { data: stats, error: statsError },
    { data: patrons, error: patronsError },
    { data: earningsOverTime },
    { data: topTiers },
  ] = await Promise.all([
    getPatronageStatsByCreatorId(creatorId),
    getPatronsByCreatorId(creatorId),
    getEarningsOverTimeByCreatorId(creatorId),
    getTopTiersByCreatorId(creatorId),
  ]);

  if (statsError || patronsError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Earnings</CardTitle>
          <CardDescription>Unable to load earnings data.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const totalEarnings = stats?.totalEarnings ?? "0";
  const patronCount = stats?.patronCount ?? 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Earnings</CardTitle>
        <CardDescription>
          Total earnings and patron list from your supporters.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">Total earnings</p>
            <p className="text-2xl font-semibold">
              {totalEarnings} CKB
            </p>
          </div>
          <div className="rounded-lg border bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">Patrons</p>
            <p className="text-2xl font-semibold">{patronCount}</p>
          </div>
        </div>

        {earningsOverTime && earningsOverTime.length > 0 && (
          <div>
            <h3 className="text-sm font-medium mb-2">Earnings over time</h3>
            <ul className="space-y-2">
              {earningsOverTime.map((row) => (
                <li
                  key={row.month}
                  className="flex items-center justify-between text-sm py-2 border-b last:border-0"
                >
                  <span className="text-muted-foreground">
                    {format(parseISO(`${row.month}-01`), "MMM yyyy")}
                  </span>
                  <span>{row.total} CKB</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {topTiers && topTiers.length > 0 && (
          <div>
            <h3 className="text-sm font-medium mb-2">Top tiers</h3>
            <ul className="space-y-2">
              {topTiers.map((row) => (
                <li
                  key={row.tierName}
                  className="flex items-center justify-between text-sm py-2 border-b last:border-0"
                >
                  <span>{row.tierName}</span>
                  <span className="text-muted-foreground">
                    {row.patronCount} patrons · {row.totalAmount} CKB
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {patrons && patrons.length > 0 ? (
          <div>
            <h3 className="text-sm font-medium mb-2">Recent patrons</h3>
            <ul className="space-y-2">
              {patrons.slice(0, 10).map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between text-sm py-2 border-b last:border-0"
                >
                  <span className="text-muted-foreground font-mono">
                    {p.patronAddress
                      ? truncateAddress(p.patronAddress)
                      : "—"}
                  </span>
                  <span>
                    {p.amount} {p.currency}
                    {p.lastPaymentAt && (
                      <span className="text-muted-foreground ml-2">
                        · {format(new Date(p.lastPaymentAt), "MMM d")}
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No patrons yet. Share your creator hub to get support!
          </p>
        )}
      </CardContent>
    </Card>
  );
}
