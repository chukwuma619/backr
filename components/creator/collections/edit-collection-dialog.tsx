"use client";

import { PencilIcon } from "lucide-react";
import { EditCollectionForm } from "@/components/creator/edit-collection-form";
import type { CreatorCollection } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function EditCollectionDialog({
  collection,
}: {
  collection: CreatorCollection;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <PencilIcon className="size-4" aria-hidden />
          Edit collection
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit collection</DialogTitle>
          <DialogDescription>
            Public URL:{" "}
            <span className="text-foreground font-mono tabular-nums">
              /c/…/collections/{collection.id}
            </span>
          </DialogDescription>
        </DialogHeader>
        <EditCollectionForm collection={collection} />
      </DialogContent>
    </Dialog>
  );
}
