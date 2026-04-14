"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2Icon } from "lucide-react";
import { deleteCreatorCollection } from "@/app/actions/collections";
import { Button } from "@/components/ui/button";
import {
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

type Props = {
  collectionId: number;
  /** Use in dropdown menus (no button chrome). */
  variant?: "button" | "menu-item" | "outline";
  className?: string;
};

export function DeleteCollectionButton({
  collectionId,
  variant = "button",
  className,
}: Props) {
  const router = useRouter();
  const id = String(collectionId);

  async function runDelete() {
    if (
      !confirm(
        "Delete this collection? Posts will be removed from the collection but not deleted."
      )
    ) {
      return;
    }
    const result = await deleteCreatorCollection(id);
    if ("ok" in result && result.ok) {
      toast.success("Collection deleted");
      router.push("/creator/collections");
      router.refresh();
      return;
    }
    if ("error" in result) {
      toast.error(
        typeof result.error === "string" ? result.error : "Failed to delete"
      );
    }
  }

  if (variant === "menu-item") {
    return (
      <DropdownMenuItem
        className={className}
        variant="destructive"
        onSelect={(e) => {
          e.preventDefault();
          void runDelete();
        }}
      >
        <Trash2Icon className="size-4" aria-hidden />
        Delete collection
      </DropdownMenuItem>
    );
  }

  if (variant === "outline") {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={className}
        onClick={() => void runDelete()}
      >
        <Trash2Icon className="size-4" aria-hidden />
        Delete
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={className}
      onClick={() => void runDelete()}
      aria-label="Delete collection"
    >
      <Trash2Icon className="size-4" aria-hidden />
    </Button>
  );
}
