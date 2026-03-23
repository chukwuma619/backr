"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createCreatorCollection } from "@/app/actions/collections";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PinataImageUploadField } from "@/components/pinata-image-upload-field";

export function CreateCollectionForm() {
  const router = useRouter();
  const [coverImageUrl, setCoverImageUrl] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const result = await createCreatorCollection(formData);
    if ("ok" in result && result.ok) {
      toast.success("Collection created");
      e.currentTarget.reset();
      setCoverImageUrl("");
      router.refresh();
      return;
    }
    if ("fieldErrors" in result && result.fieldErrors) {
      toast.error("Check the form fields");
      return;
    }
    if ("error" in result) {
      toast.error(
        typeof result.error === "string" ? result.error : "Failed to create"
      );
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-lg border p-4">
      <input type="hidden" name="coverImageUrl" value={coverImageUrl} />
      <p className="font-medium">New collection</p>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="new-collection-name">Name</FieldLabel>
          <Input
            id="new-collection-name"
            name="name"
            required
            maxLength={200}
            placeholder="e.g. Behind the scenes"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="new-collection-description">
            Description (optional)
          </FieldLabel>
          <Textarea
            id="new-collection-description"
            name="description"
            rows={2}
            maxLength={5000}
            placeholder="What members will find here"
          />
        </Field>
        <Field>
          <PinataImageUploadField
            id="new-collection-cover"
            label="Cover image (optional)"
            value={coverImageUrl}
            onChange={setCoverImageUrl}
            preview="banner"
          />
        </Field>
      </FieldGroup>
      <Button type="submit">Create collection</Button>
    </form>
  );
}
