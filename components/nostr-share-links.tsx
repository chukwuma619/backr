"use client";

import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { getNostrShareUrls } from "@/lib/nostr/njump-url";

type NostrShareLinksProps = {
  eventId: string;
  variant?: "link" | "button";
  className?: string;
};

export function NostrShareLinks({
  eventId,
  variant = "link",
  className,
}: NostrShareLinksProps) {
  const links = getNostrShareUrls(eventId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {variant === "button" ? (
          <Button variant="outline" size="sm" className={className}>
            Share
          </Button>
        ) : (
          <button
            type="button"
            className={`text-xs text-muted-foreground hover:text-primary ${className ?? ""}`}
          >
            Share →
          </button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {links.map(({ name, url }) => (
          <DropdownMenuItem key={name} asChild>
            <Link href={url} target="_blank" rel="noopener noreferrer">
              {name}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
