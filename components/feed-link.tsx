"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";

export function FeedLink() {
  const { user, isLoading } = useAuth();

  if (isLoading || !user) return null;

  return (
    <Link
      href="/feed"
      className="text-sm font-medium text-muted-foreground hover:text-foreground"
    >
      Feed
    </Link>
  );
}
