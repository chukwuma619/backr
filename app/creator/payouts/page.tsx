import { getCreatorForDashboard } from "@/lib/creators/get-creator-for-dashboard";
import { getPaymentHistoryByCreatorId } from "@/lib/db/queries";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

function formatAddress(address: string) {
  if (address.length <= 16) return address;
  return `${address.slice(0, 8)}…${address.slice(-6)}`;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export default async function CreatorPayoutsPage() {
  const { creator } = await getCreatorForDashboard();
  if (!creator) return null;

  const { data: payments } = await getPaymentHistoryByCreatorId(creator.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Payouts</h1>
        <p className="text-muted-foreground">
          Subscription and payment history you have received.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Payment history</CardTitle>
          <CardDescription>
            All subscriptions and payments from your supporters.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!payments?.length ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No payments yet. When supporters subscribe to your tiers, they will
              appear here.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>From</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Subscribed</TableHead>
                  <TableHead className="text-right">Last payment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-mono text-sm">
                      {formatAddress(payment.patronCkbAddress)}
                    </TableCell>
                    <TableCell>{payment.tierName}</TableCell>
                    <TableCell>
                      ${payment.amount}
                      {payment.currency !== "CKB" ? ` ${payment.currency}` : ""}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          payment.status === "active" ? "default" : "secondary"
                        }
                      >
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(payment.subscribedAt)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {payment.lastPaymentAt
                        ? formatDate(payment.lastPaymentAt)
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
