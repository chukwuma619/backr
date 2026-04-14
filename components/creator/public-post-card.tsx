"use client";

import Image from "next/image";
import Link from "next/link";
import { Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function PublicPostCard({
  username,
  title,
  dateLabel,
  heroImageUrl,
  canView,
  isPaid,
  previewText,
  variant = "default",
}: {
  username: string;
  title: string;
  dateLabel: string;
  heroImageUrl: string | null;
  canView: boolean;
  isPaid: boolean;
  previewText?: string;
  variant?: "default" | "featured" | "carousel";
}) {
  const locked = !canView;
  const membershipHref = `/c/${username}/membership`;

  const mediaHeights =
    variant === "featured"
      ? "min-h-[11rem] sm:min-h-0 sm:h-52 md:h-56"
      : variant === "carousel"
        ? "min-h-[7.5rem] sm:min-h-0 sm:h-32"
        : "min-h-[9rem] sm:min-h-0 sm:h-36";

  const mediaWidths =
    variant === "featured"
      ? "sm:w-72 md:w-80 lg:w-[22rem]"
      : variant === "carousel"
        ? "sm:w-40"
        : "sm:w-44 md:w-52";

  return (
    <article
      className={cn(
        "flex flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-colors",
        "sm:flex-row sm:items-stretch"
      )}
    >
      <div
        className={cn(
          "relative w-full shrink-0 overflow-hidden bg-muted",
          mediaHeights,
          mediaWidths
        )}
      >
        {heroImageUrl ? (
          <Image
            src={heroImageUrl}
            alt=""
            fill
            className="object-cover"
            sizes={
              variant === "featured"
                ? "(max-width: 768px) 100vw, 320px"
                : "(max-width: 640px) 100vw, 200px"
            }
            unoptimized
          />
        ) : (
          <div
            className="absolute inset-0 bg-gradient-to-br from-muted via-muted/70 to-background"
            aria-hidden
          />
        )}

        {locked ? (
          <>
            <div
              className="absolute inset-0 bg-black/45"
              aria-hidden
            />
            <div className="absolute left-2 top-2 flex items-center gap-1.5 rounded-full bg-black/75 px-2.5 py-1 text-xs font-medium text-white shadow-sm">
              <Lock className="size-3.5 shrink-0" aria-hidden />
              <span>Locked</span>
            </div>
          </>
        ) : null}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-2 p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <h3
            className={cn(
              "min-w-0 font-semibold leading-snug tracking-tight text-foreground",
              variant === "featured"
                ? "text-lg md:text-xl"
                : "text-base"
            )}
          >
            {title}
          </h3>
          {isPaid ? (
            <Badge variant="secondary" className="shrink-0">
              Members
            </Badge>
          ) : (
            <Badge variant="outline" className="shrink-0">
              Free
            </Badge>
          )}
        </div>

        <p className="text-muted-foreground text-sm tabular-nums">{dateLabel}</p>

        {locked ? (
          <p className="text-muted-foreground text-sm leading-relaxed">
            {isPaid
              ? "This post is for members. Join a tier to unlock the full post."
              : "Sign in to view this content."}
            {" "}
            <Link
              href={membershipHref}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              View membership
            </Link>
          </p>
        ) : previewText != null && previewText.length > 0 ? (
          <p className="text-muted-foreground line-clamp-4 text-sm leading-relaxed whitespace-pre-wrap">
            {previewText}
          </p>
        ) : null}
      </div>
    </article>
  );
}
