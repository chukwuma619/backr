"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  deleteCreatorCollection,
  updateCreatorCollection,
} from "@/app/actions/collections";
import type { CreatorCollection } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function EditCollectionForm({ collection }: { collection: CreatorCollection }) {
  const router = useRouter();
  const id = String(collection.id);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const result = await updateCreatorCollection(id, formData);
    if ("ok" in result && result.ok) {
      toast.success("Collection saved");
      router.refresh();
      return;
    }
    if ("error" in result) {
      toast.error(
        typeof result.error === "string" ? result.error : "Failed to save"
      );
    }
  }

  async function onDelete() {
    if (!confirm("Delete this collection? Posts will be removed from the collection but not deleted.")) {
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

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="space-y-4 rounded-lg border p-4">
        <p className="font-medium">Edit collection</p>
        <p className="text-muted-foreground text-sm">
          Public URL:{" "}
          <span className="text-foreground font-mono tabular-nums">
            /c/…/collections/{collection.id}
          </span>
        </p>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="edit-collection-name">Name</FieldLabel>
            <Input
              id="edit-collection-name"
              name="name"
              required
              maxLength={200}
              defaultValue={collection.name}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="edit-collection-description">
              Description (optional)
            </FieldLabel>
            <Textarea
              id="edit-collection-description"
              name="description"
              rows={3}
              maxLength={5000}
              defaultValue={collection.description ?? ""}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="edit-collection-cover">
              Cover image URL (optional)
            </FieldLabel>
            <Input
              id="edit-collection-cover"
              name="coverImageUrl"
              type="url"
              placeholder="https://..."
              defaultValue={collection.coverImageUrl ?? ""}
            />
          </Field>
        </FieldGroup>
        <Button type="submit">Save</Button>
      </form>
      <Button type="button" variant="destructive" onClick={onDelete}>
        Delete collection
      </Button>
    </div>
  );
}
