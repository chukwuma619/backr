"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { changePatronageTier } from "@/app/actions/patronage";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

type Tier = { id: string; name: string; priceAmount: string; priceCurrency: string };

export function ChangeTierForm({
  patronageId,
  currentTierId,
  currentTierName,
  tiers,
}: {
  patronageId: string;
  currentTierId: string;
  currentTierName: string;
  tiers: Tier[];
}) {
  const router = useRouter();
  const [selectedTierId, setSelectedTierId] = useState<string>(currentTierId);
  const [isPending, setIsPending] = useState(false);

  const otherTiers = tiers.filter((t) => t.id !== currentTierId);

  async function handleChange() {
    if (selectedTierId === currentTierId) return;
    setIsPending(true);
    try {
      const result = await changePatronageTier(patronageId, selectedTierId);
      if (result?.error) {
        alert(result.error);
      } else {
        router.refresh();
      }
    } finally {
      setIsPending(false);
    }
  }

  if (otherTiers.length === 0) return null;

  return (
    <div className="flex items-center gap-2 mt-2">
      <Select
        value={selectedTierId}
        onValueChange={setSelectedTierId}
        disabled={isPending}
      >
        <SelectTrigger size="sm" className="w-[180px]">
          <SelectValue placeholder={currentTierName} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={currentTierId}>
            {currentTierName} (current)
          </SelectItem>
          {otherTiers.map((t) => (
            <SelectItem key={t.id} value={t.id}>
              {t.name} · {t.priceAmount} {t.priceCurrency}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        variant="secondary"
        size="sm"
        onClick={handleChange}
        disabled={selectedTierId === currentTierId || isPending}
      >
        {isPending ? "Updating…" : "Change tier"}
      </Button>
    </div>
  );
}
