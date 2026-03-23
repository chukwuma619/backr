"use client";

import { useState } from "react";
import { PlusIcon } from "lucide-react";
import { CreateCollectionForm } from "@/components/creator/create-collection-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function CreateCollectionDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" size="sm">
          <PlusIcon className="size-4" aria-hidden />
          New collection
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create collection</DialogTitle>
          <DialogDescription>
            Name it and optionally add a description and cover. Public URLs use
            the numeric id (e.g.{" "}
            <span className="font-mono tabular-nums">/c/yourname/collections/1</span>
            ).
          </DialogDescription>
        </DialogHeader>
        <CreateCollectionForm
          showFrame={false}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
