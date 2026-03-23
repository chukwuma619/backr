"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TiptapPostEditor } from "@/components/creator/tiptap-post-editor";
import { PinataImageUploadField } from "@/components/pinata-image-upload-field";
import { updatePost } from "@/app/actions/post";
import type { Post } from "@/lib/db/schema";

const schema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  body: z.string().min(1, "Body is required").max(50000),
  coverImageUrl: z.string().max(500).optional(),
});

type FormValues = z.infer<typeof schema>;

type EditPostDialogProps = {
  post: Post;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EditPostDialog({
  post,
  open,
  onOpenChange,
}: EditPostDialogProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: post.title,
      body: post.content ?? "",
      coverImageUrl: post.coverImageUrl ?? "",
    },
  });

  useEffect(() => {
    form.reset({
      title: post.title,
      body: post.content ?? "",
      coverImageUrl: post.coverImageUrl ?? "",
    });
  }, [post.id, post.title, post.content, post.coverImageUrl, form]);

  async function onSave(values: FormValues) {
    setError(null);

    const formData = new FormData();
    formData.set("title", values.title.trim());
    formData.set("body", values.body.trim());
    formData.set("coverImageUrl", values.coverImageUrl?.trim() ?? "");

    const result = await updatePost(post.id, formData);

    if (result && "error" in result && result.error) {
      setError(result.error.message);
      return;
    }
    if (result?.errors) {
      Object.entries(result.errors).forEach(([field, messages]) => {
        form.setError(field as keyof FormValues, {
          message: messages?.[0] ?? "Invalid",
        });
      });
      return;
    }

    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit post</DialogTitle>
        </DialogHeader>
        <form
          id="edit-post-dialog-form"
          onSubmit={form.handleSubmit(onSave)}
          className="space-y-6"
        >
          {error && <p className="text-sm text-destructive">{error}</p>}
          <FieldGroup>
            <Controller
              control={form.control}
              name="title"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="edit-post-dialog-form-title">
                    Title
                  </FieldLabel>
                  <Input
                    id="edit-post-dialog-form-title"
                    placeholder="Post title"
                    {...field}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="coverImageUrl"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <PinataImageUploadField
                    id="edit-post-dialog-coverImageUrl"
                    label="Cover image (optional)"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    preview="banner"
                    disabled={form.formState.isSubmitting}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="body"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="edit-post-dialog-form-body">
                    Content
                  </FieldLabel>
                  <TiptapPostEditor
                    id="edit-post-dialog-form-body"
                    content={field.value}
                    onChange={field.onChange}
                    placeholder="Content..."
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Field>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving…" : "Save"}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
