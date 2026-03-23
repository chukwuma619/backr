"use client";

import Image from "next/image";
import Link from "next/link";
import { LayersIcon, MoreVerticalIcon } from "lucide-react";
import type { CreatorCollection } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteCollectionButton } from "@/components/creator/collections/delete-collection-button";

export function CollectionListCard({ collection }: { collection: CreatorCollection }) {
  return (
    <Card className="relative overflow-hidden pt-0 transition-colors hover:bg-muted/40">
      <div className="absolute right-2 top-2 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="size-8 bg-background/80 shadow-sm backdrop-blur"
              aria-label="Collection actions"
            >
              <MoreVerticalIcon className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DeleteCollectionButton
              collectionId={collection.id}
              variant="menu-item"
            />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Link href={`/creator/collections/${collection.id}`} className="block">
        <div className="relative aspect-[16/9] w-full overflow-hidden border-b bg-muted">
          {collection.coverImageUrl ? (
            <Image
              src={collection.coverImageUrl}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 33vw"
              unoptimized
            />
          ) : (
            <div
              className="absolute inset-0 bg-gradient-to-br from-muted via-muted/70 to-background"
              aria-hidden
            />
          )}
        </div>
        <CardHeader className="space-y-2">
          <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide">
            <LayersIcon className="size-3.5" aria-hidden />
            Collection #{collection.id}
          </div>
          <CardTitle className="text-lg leading-snug">{collection.name}</CardTitle>
          <CardDescription className="line-clamp-2">
            {collection.description?.trim() || "No description"}
          </CardDescription>
        </CardHeader>
      </Link>
    </Card>
  );
}
