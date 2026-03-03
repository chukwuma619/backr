"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";

export function SupportsLink() {
  const { user, isLoading } = useAuth();

  if (isLoading || !user) return null;

  return (
    <Link
      href="/supports"
      className="text-sm font-medium text-muted-foreground hover:text-foreground"
    >
      My supports
    </Link>
  );
}
