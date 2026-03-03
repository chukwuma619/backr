import { NextRequest, NextResponse } from "next/server";
import { getDuePatronagesForRenewal } from "@/lib/db/queries";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: duePatronages, error } = await getDuePatronagesForRenewal();

  if (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch due patronages" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    dueCount: duePatronages?.length ?? 0,
    patronages: duePatronages?.map((p) => ({
      id: p.patronage.id,
      patronUserId: p.patronage.patronUserId,
      creatorId: p.patronage.creatorId,
      tierId: p.patronage.tierId,
      amount: p.patronage.amount,
      nextDueAt: p.patronage.nextDueAt,
      creatorSlug: p.creatorSlug,
    })),
  });
}
