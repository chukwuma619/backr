"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateCreatorCollection } from "@/app/actions/collections";
import type { CreatorCollection } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PinataImageUploadField } from "@/components/pinata-image-upload-field";

export function EditCollectionForm({ collection }: { collection: CreatorCollection }) {
  const router = useRouter();
  const id = String(collection.id);
  const [coverImageUrl, setCoverImageUrl] = useState(
    collection.coverImageUrl ?? ""
  );

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

  return (
    <>
      <form
        id="edit-collection-form"
        onSubmit={onSubmit}
        className="space-y-4"
      >
        <input type="hidden" name="coverImageUrl" value={coverImageUrl} />
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
            <PinataImageUploadField
              id="edit-collection-cover"
              label="Cover image (optional)"
              value={coverImageUrl}
              onChange={setCoverImageUrl}
              preview="banner"
            />
          </Field>
        </FieldGroup>
      </form>
      <DialogFooter className="mt-4">
        <Button type="submit" form="edit-collection-form">
          Save
        </Button>
      </DialogFooter>
    </>
  );
}
