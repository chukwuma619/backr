"use client";

import { useCallback, useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
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
import { createCreator } from "@/app/actions/creator";
import { DISCOVER_TOPICS } from "@/lib/discover/constants";
import { cn } from "@/lib/utils";
import { Check, Loader2 } from "lucide-react";

const schema = z.object({
  displayName: z
    .string()
    .min(1, "Display name is required")
    .max(200, "Display name must be at most 200 characters"),
  username: z
    .string()
    .min(2, "Username must be at least 2 characters")
    .max(64, "Username must be at most 64 characters")
    .transform((s) => s.trim().toLowerCase())
    .refine(
      (s) => /^[a-z0-9-_]+$/.test(s),
      "Username can only contain lowercase letters, numbers, hyphens, and underscores",
    ),
  bio: z.string().max(1000).optional(),
  topics: z.array(z.string()).min(1, "Select at least one topic"),
});

type FormValues = z.infer<typeof schema>;

const RESERVED_USERNAMES = ["api", "dashboard", "c", "me", "onboarding"];

type CreatorRegistrationFormProps = {
  userId: string;
};

export function CreatorRegistrationForm({ userId }: CreatorRegistrationFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [usernameStatus, setUsernameStatus] = useState<
    "idle" | "checking" | "available" | "taken" | "invalid"
  >("idle");

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      displayName: "",
      username: "",
      bio: "",
      topics: [],
    },
  });

  const username = useWatch({
    control: form.control,
    name: "username",
    defaultValue: "",
  });
  const selectedTopics = useWatch({
    control: form.control,
    name: "topics",
    defaultValue: [],
  });

  const checkUsername = useCallback(async (value: string) => {
    const trimmed = value.trim().toLowerCase();
    if (trimmed.length < 2) {
      setUsernameStatus("idle");
      return;
    }
    if (!/^[a-z0-9-_]+$/.test(trimmed)) {
      setUsernameStatus("invalid");
      return;
    }
    if (RESERVED_USERNAMES.includes(trimmed)) {
      setUsernameStatus("taken");
      return;
    }
    setUsernameStatus("checking");
    try {
      const res = await fetch(
        `/api/username/check?username=${encodeURIComponent(trimmed)}`,
      );
      const data = await res.json();
      setUsernameStatus(data.available ? "available" : "taken");
    } catch {
      setUsernameStatus("idle");
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      checkUsername(username ?? "");
    }, 400);
    return () => clearTimeout(timer);
  }, [username, checkUsername]);

  function toggleTopic(slug: string) {
    const current = form.getValues("topics");
    const next = current.includes(slug)
      ? current.filter((t) => t !== slug)
      : [...current, slug];
    form.setValue("topics", next);
  }

  async function onSubmit(values: FormValues) {
    setError(null);
    const formData = new FormData();
    formData.set("slug", values.username.trim().toLowerCase());
    formData.set("displayName", values.displayName.trim());
    if (values.bio) formData.set("bio", values.bio.trim());
    formData.set("topics", JSON.stringify(values.topics));

    const result = await createCreator(userId, "", formData);

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
    }
  }

  const usernamePreview =
    username
      ?.trim()
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, "") || "";

  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-semibold tracking-tight">
          Become a creator
        </CardTitle>
        <CardDescription className="text-center">
          Register your creator profile. Your page will be at{" "}
          <span className="font-mono text-foreground">
            /c/{usernamePreview || "your-username"}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="creator-registration-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
        >
          {error && <p className="text-sm text-destructive">{error}</p>}
          <FieldGroup>
            <Controller
              control={form.control}
              name="displayName"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="creator-registration-form-displayName">
                    Display name
                  </FieldLabel>
                  <Input
                    id="creator-registration-form-displayName"
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
              name="username"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="creator-registration-form-username">
                    Username
                  </FieldLabel>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      @
                    </span>
                    <Input
                      id="creator-registration-form-username"
                      placeholder="username"
                      className="pl-7"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        setUsernameStatus("idle");
                      }}
                      aria-invalid={fieldState.invalid}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      {usernameStatus === "checking" && (
                        <Loader2 className="size-4 animate-spin text-muted-foreground" />
                      )}
                      {usernameStatus === "available" && (
                        <span className="text-green-600 dark:text-green-500 text-sm flex items-center gap-1">
                          <Check className="size-4" />
                          Available
                        </span>
                      )}
                      {usernameStatus === "taken" && (
                        <span className="text-destructive text-sm">
                          Taken
                        </span>
                      )}
                      {usernameStatus === "invalid" && username && (
                        <span className="text-destructive text-sm">
                          Invalid
                        </span>
                      )}
                    </span>
                  </div>
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
                  <FieldLabel htmlFor="creator-registration-form-bio">
                    Bio (optional)
                  </FieldLabel>
                  <Textarea
                    id="creator-registration-form-bio"
                    placeholder="Tell supporters about yourself"
                    rows={4}
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
              name="topics"
              render={({ fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Topics</FieldLabel>
                  <p className="text-sm text-muted-foreground mb-3">
                    Select one or more topics that describe your content
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {DISCOVER_TOPICS.map(({ slug, label }) => (
                      <button
                        key={slug}
                        type="button"
                        onClick={() => toggleTopic(slug)}
                        className={cn(
                          "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors border",
                          (selectedTopics ?? []).includes(slug)
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border-transparent",
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
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
                  form.formState.isSubmitting || usernameStatus === "taken"
                }
              >
                {form.formState.isSubmitting ? "Creating…" : "Create profile"}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
