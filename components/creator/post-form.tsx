"use client";

import type { Control } from "react-hook-form";
import type { PostEditorFormValues } from "@/lib/creator/post-editor-types";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import type { Post } from "@/lib/db/schema";
import { toast } from "sonner";
import { updatePost } from "@/app/actions/post";

const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  body: z.string().min(1, "Content is required").max(50000),
});

type FormValues = z.infer<typeof formSchema>;

type PostFormFieldsProps = {
  control: Control<PostEditorFormValues>;
};

export function PostFormFields({ control }: PostFormFieldsProps) {
  return (
    <div className="space-y-6">
      <FieldGroup>
        <Controller
          control={control}
          name="title"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="post-form-title">Title</FieldLabel>
              <Input
                placeholder="Post title"
                id="post-form-title"
                className="text-lg font-medium"
                {...field}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          control={control}
          name="coverImageUrl"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <PinataImageUploadField
                id="post-form-coverImageUrl"
                label="Cover image (optional)"
                description="Shown on post cards and your public profile when this post is featured."
                value={field.value ?? ""}
                onChange={field.onChange}
                preview="banner"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          control={control}
          name="body"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="post-form-body">Content</FieldLabel>
              <TiptapPostEditor
                className="min-h-[200px] md:min-h-[500px]"
                id="post-form-body"
                content={field.value}
                onChange={field.onChange}
                placeholder="Content..."
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>
    </div>
  );
}

type PostFormProps = {
  post: Post;
};

export function PostForm({ post }: PostFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: post?.title ?? "",
      body: post?.content ?? "",
    },
  });

  async function onSubmit(values: FormValues) {
    const formData = new FormData();
    formData.set("title", values.title.trim());
    formData.set("body", values.body.trim());
    const { data, error } = await updatePost(post?.id, formData);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (data) {
      toast.success("Post updated successfully");
    }
  }

  return (
    <form id="post-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <FieldGroup>
        <Controller
          control={form.control}
          name="title"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="post-form-title">Title</FieldLabel>
              <Input
                placeholder="Post title"
                id="post-form-title"
                className="text-lg font-medium"
                {...field}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="body"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="post-form-body">Content</FieldLabel>
              <TiptapPostEditor
                className="min-h-[200px] md:min-h-[500px]"
                id="post-form-body"
                content={field.value}
                onChange={field.onChange}
                placeholder="Content..."
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Field>
          <Button type="submit">Update</Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
