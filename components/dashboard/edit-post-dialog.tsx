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
import { updatePost, updatePostNostrEventId } from "@/app/actions/post";
import { publishPostToNostr } from "@/lib/nostr/publish-post";
import type { Post } from "@/lib/db/schema";
import type { Creator } from "@/lib/db/schema";

const schema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  body: z.string().min(1, "Body is required").max(50000),
});

type FormValues = z.infer<typeof schema>;

type EditPostDialogProps = {
  post: Post;
  creator: Creator & { nostrPubkey?: string | null };
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EditPostDialog({
  post,
  creator,
  open,
  onOpenChange,
}: EditPostDialogProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [nostrStatus, setNostrStatus] = useState<
    "idle" | "pending" | "success" | "error"
  >("idle");
  const [nostrError, setNostrError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: post.title,
      body: post.content,
    },
  });

  useEffect(() => {
    form.reset({
      title: post.title,
      body: post.content,
    });
  }, [post.id, post.title, post.content, form]);

  async function onSave(values: FormValues) {
    setError(null);
    setNostrError(null);
    setNostrStatus("idle");

    if (!creator.nostrPubkey) {
      setError("Connect Nostr in your profile to save posts.");
      return;
    }

    const formData = new FormData();
    formData.set("title", values.title.trim());
    formData.set("body", values.body.trim());

    const result = await updatePost(post.id, formData);

    if (result?.message) {
      setError(result.message);
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

    setNostrStatus("pending");

    try {
      const eventId = await publishPostToNostr({
        postId: post.id,
        title: values.title.trim(),
        body: values.body.trim(),
        publishedAt: new Date(post.publishedAt ?? post.createdAt),
      });

      const updateResult = await updatePostNostrEventId(post.id, eventId);

      if (updateResult?.message) {
        throw new Error(updateResult.message);
      }

      setNostrStatus("success");
      router.refresh();
    } catch (err) {
      setNostrStatus("error");
      setNostrError(
        err instanceof Error ? err.message : "Failed to update on Nostr"
      );
    }
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      setNostrStatus("idle");
      setNostrError(null);
    }
    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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
              <Button
                type="submit"
                disabled={
                  form.formState.isSubmitting ||
                  nostrStatus === "pending" ||
                  !creator.nostrPubkey
                }
              >
                {form.formState.isSubmitting
                  ? "Saving…"
                  : nostrStatus === "pending"
                    ? "Updating on Nostr…"
                    : nostrStatus === "success"
                      ? "Saved"
                      : "Save"}
              </Button>
            </Field>
          </FieldGroup>
          {nostrError && (
            <p className="text-sm text-destructive">{nostrError}</p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
