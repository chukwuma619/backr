"use client";

import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createCreatorFromSession } from "@/app/actions/creator";

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
  displayName: z
    .string()
    .min(1, "Display name is required")
    .max(200, "Display name must be at most 200 characters"),
  bio: z.string().max(1000).optional(),
  avatarUrl: z.string().max(500).optional(),
});

type FormValues = z.infer<typeof schema>;

export function OnboardingForm() {
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      slug: "",
      displayName: "",
      bio: "",
      avatarUrl: "",
    },
  });

  async function onSubmit(values: FormValues) {
    setError(null);
    const formData = new FormData();
    formData.set("slug", values.slug.trim().toLowerCase());
    formData.set("displayName", values.displayName.trim());
    if (values.bio) formData.set("bio", values.bio.trim());
    if (values.avatarUrl) formData.set("avatarUrl", values.avatarUrl.trim());
    formData.set("topics", JSON.stringify(["tech"]));

    const result = await createCreatorFromSession(formData);

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
    }
  }

  const slug = form.watch("slug");
  const slugPreview = slug?.trim().toLowerCase().replace(/[^a-z0-9-_]/g, "") || "";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Become a creator</CardTitle>
        <CardDescription>
          Set up your creator profile. Your page will be at /c/{slugPreview || "your-slug"}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="onboarding-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
        >
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <FieldGroup>
            <Controller
              control={form.control}
              name="slug"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="onboarding-form-slug">Slug</FieldLabel>
                  <Input
                    id="onboarding-form-slug"
                    placeholder="my-creator"
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
              name="displayName"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="onboarding-form-displayName">
                    Display name
                  </FieldLabel>
                  <Input
                    id="onboarding-form-displayName"
                    placeholder="Your name"
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
                  <FieldLabel htmlFor="onboarding-form-bio">
                    Bio (optional)
                  </FieldLabel>
                  <Textarea
                    id="onboarding-form-bio"
                    placeholder="Tell supporters about yourself"
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
              name="avatarUrl"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="onboarding-form-avatarUrl">
                    Avatar URL (optional)
                  </FieldLabel>
                  <Input
                    id="onboarding-form-avatarUrl"
                    placeholder="https://..."
                    type="url"
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
                {form.formState.isSubmitting ? "Creating…" : "Create profile"}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
