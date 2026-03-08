import Link from "next/link";
import { format } from "date-fns";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";
import { Badge } from "@/components/ui/badge";

type BillingRecord = {
  id: string;
  amount: string;
  currency: string;
  status: string;
  createdAt: Date;
  lastPaymentAt: Date | null;
  creatorDisplayName: string;
  creatorUsername: string;
  tierName: string;
};

export function BillingHistorySection({
  records,
}: {
  records: BillingRecord[];
}) {
  if (records.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-12 text-center">
        <p className="text-muted-foreground text-sm">
          No billing history yet. When you support creators, your payments
          will appear here.
        </p>
      </div>
    );
  }

  return (
    <ItemGroup className="space-y-4">
      {records.map((r) => {
        const paymentDate = r.lastPaymentAt ?? r.createdAt;
        return (
          <Item key={r.id} variant="outline" className="rounded-lg">
            <ItemContent>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <ItemTitle>
                    <Link
                      href={`/c/${r.creatorUsername}`}
                      className="hover:underline"
                    >
                      {r.creatorDisplayName}
                    </Link>
                  </ItemTitle>
                  <ItemDescription>
                    {r.tierName} · {format(new Date(paymentDate), "MMM d, yyyy")}
                  </ItemDescription>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-medium">
                    {r.amount} {r.currency}
                  </span>
                  <Badge
                    variant={r.status === "active" ? "default" : "secondary"}
                    className="ml-2"
                  >
                    {r.status}
                  </Badge>
                </div>
              </div>
            </ItemContent>
          </Item>
        );
      })}
    </ItemGroup>
  );
}
