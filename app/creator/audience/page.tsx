import { getCreatorForDashboard } from "@/lib/creators/get-creator-for-dashboard";
import { getSubscribersByCreatorId } from "@/lib/db/queries";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

export default async function CreatorAudiencePage() {
  const { creator } = await getCreatorForDashboard();
  if (!creator) return null;

  const { data: subscribers } = await getSubscribersByCreatorId(creator.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Audience</h1>
        <p className="text-muted-foreground">
          View and manage your supporters and patrons.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Supporters</CardTitle>
          <CardDescription>
            {subscribers?.length ?? 0} active subscriber
            {(subscribers?.length ?? 0) !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!subscribers?.length ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No subscribers yet. Share your page to grow your audience.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subscriber</TableHead>
                  <TableHead className="text-right">Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscribers.map((subscriber) => (
                  <TableRow key={subscriber.subscriptionId}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8">
                          <AvatarImage
                            src={subscriber.avatarUrl ?? undefined}
                          />
                          <AvatarFallback className="text-xs">
                            {subscriber.ckbAddress.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-mono text-sm">
                          {formatAddress(subscriber.ckbAddress)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatDate(subscriber.subscribedAt)}
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
