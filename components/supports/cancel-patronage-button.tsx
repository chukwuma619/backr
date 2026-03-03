"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cancelPatronage } from "@/app/actions/patronage";
import { Button } from "@/components/ui/button";

export function CancelPatronageButton({ patronageId }: { patronageId: string }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleCancel() {
    if (!confirm("Cancel your support? You will lose access to exclusive content.")) return;
    setIsPending(true);
    try {
      const result = await cancelPatronage(patronageId);
      if (result?.error) {
        alert(result.error);
      } else {
        router.refresh();
      }
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCancel}
      disabled={isPending}
    >
      {isPending ? "Cancelling…" : "Cancel"}
    </Button>
  );
}
