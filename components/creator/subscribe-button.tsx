"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toggleCreatorSubscription } from "@/app/actions/subscriptions";

type Props = {
  username: string;
  isSubscribed: boolean;
  isPatron: boolean;
};

export function SubscribeButton({ username, isSubscribed, isPatron }: Props) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const label = isPatron
    ? "Member"
    : isSubscribed
    ? "Subscribed"
    : "Subscribe";

  const variant = isPatron || isSubscribed ? "outline" : "default";

  const handleClick = () => {
    if (isPatron) return;
    startTransition(async () => {
      const result = await toggleCreatorSubscription(username);
      if (result.error) {
        console.error(result.error);
        return;
      }
      router.refresh();
    });
  };

  return (
    <Button
      size="sm"
      variant={variant}
      className="mt-4"
      onClick={handleClick}
      disabled={pending || isPatron}
    >
      {pending && !isPatron ? "Saving..." : label}
    </Button>
  );
}

