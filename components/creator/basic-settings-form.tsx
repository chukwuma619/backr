"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DISCOVER_TOPICS } from "@/lib/discover/constants";
import { updateCreatorProfile } from "@/app/actions/creator";
import { PinataImageUploadField } from "@/components/pinata-image-upload-field";

const schema = z.object({
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(64, "Slug must be at most 64 characters")
    .transform((s) => s.trim().toLowerCase())
    .refine(
      (s) => /^[a-z0-9-_]+$/.test(s),
      "Slug can only contain lowercase letters, numbers, hyphens, and underscores"
    ),
  displayName: z.string().min(1, "Display name is required").max(200),
  bio: z.string().max(1000).optional(),
  category: z.string().optional(),
  avatarUrl: z.string().max(500).optional(),
  coverImageUrl: z.string().max(500).optional(),
  fiberNodeRpcUrl: z.union([z.string().url(), z.literal("")]).optional(),
});

const CATEGORY_NONE = "__none__";

type FormValues = z.infer<typeof schema>;

type BasicSettingsFormProps = {
  data: {
    username: string;
    displayName: string;
    bio: string | null;
    avatarUrl?: string | null;
    coverImageUrl?: string | null;
    fiberNodeRpcUrl?: string | null;
    topicSlugs: string[];
  };
};

export function BasicSettingsForm({ data }: BasicSettingsFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      slug: data.username,
      displayName: data.displayName,
      bio: data.bio ?? "",
      category: data.topicSlugs[0] ?? CATEGORY_NONE,
      avatarUrl: data.avatarUrl ?? "",
      coverImageUrl: data.coverImageUrl ?? "",
      fiberNodeRpcUrl: data.fiberNodeRpcUrl ?? "",
    },
  });

  async function onSubmit(values: FormValues) {
    setError(null);
    const formData = new FormData();
    formData.set("slug", values.slug.trim().toLowerCase());
    formData.set("displayName", values.displayName.trim());
    if (values.bio) formData.set("bio", values.bio.trim());
    if (values.category && values.category !== CATEGORY_NONE)
      formData.set("topics", JSON.stringify([values.category]));
    formData.set("avatarUrl", values.avatarUrl?.trim() ?? "");
    formData.set("coverImageUrl", values.coverImageUrl?.trim() ?? "");
    if (values.fiberNodeRpcUrl)
      formData.set("fiberNodeRpcUrl", values.fiberNodeRpcUrl.trim());

    const result = await updateCreatorProfile(formData);

    if (result && "message" in result && result.message) {
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
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>
          Update your display name, handle, bio, and preferences.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="basic-settings-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
        >
          {error && <p className="text-sm text-destructive">{error}</p>}
          <FieldGroup>
            <Controller
              control={form.control}
              name="slug"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="basic-settings-slug">Username</FieldLabel>
                  <Input
                    id="basic-settings-slug"
                    placeholder="your-handle"
                    {...field}
                    aria-invalid={fieldState.invalid}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Your profile URL: /c/{field.value || "username"}
                  </p>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="displayName"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="basic-settings-displayName">
                    Display name
                  </FieldLabel>
                  <Input
                    id="basic-settings-displayName"
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
              name="bio"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="basic-settings-bio">
                    Bio (optional)
                  </FieldLabel>
                  <Textarea
                    id="basic-settings-bio"
                    rows={3}
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
              name="category"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="basic-settings-category">
                    Category (optional)
                  </FieldLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value && field.value !== "" ? field.value : CATEGORY_NONE}
                  >
                    <SelectTrigger id="basic-settings-category" className="w-full">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={CATEGORY_NONE}>None</SelectItem>
                      {DISCOVER_TOPICS.map(({ slug, label }) => (
                        <SelectItem key={slug} value={slug}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="avatarUrl"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <PinataImageUploadField
                    id="basic-settings-avatarUrl"
                    label="Profile avatar (optional)"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    preview="square"
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
              name="coverImageUrl"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <PinataImageUploadField
                    id="basic-settings-coverImageUrl"
                    label="Public cover image (optional)"
                    description={`Shown on your public profile at /c/${form.watch("slug") || "username"}`}
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
              name="fiberNodeRpcUrl"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="basic-settings-fiberNodeRpcUrl">
                    Fiber node RPC URL (optional)
                  </FieldLabel>
                  <Input
                    id="basic-settings-fiberNodeRpcUrl"
                    type="url"
                    placeholder="http://localhost:8227"
                    {...field}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Field>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving…" : "Save changes"}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
