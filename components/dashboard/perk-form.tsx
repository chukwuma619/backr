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
import { Button } from "@/components/ui/button";
import { createPerk, updatePerk } from "@/app/actions/perks";

const schema = z.object({
  description: z.string().min(1, "Description is required").max(500),
  type: z.string().max(50).optional(),
});

type FormValues = z.infer<typeof schema>;

type PerkForForm = {
  id: string;
  description: string;
  type: string;
};

export function PerkForm({
  perk,
  tierId,
  onSuccess,
}: {
  perk?: PerkForForm;
  tierId?: string;
  onSuccess?: () => void;
}) {
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: perk
      ? { description: perk.description, type: perk.type || "" }
      : { description: "", type: "" },
  });

  async function onSubmit(values: FormValues) {
    setError(null);
    if (!perk && !tierId) {
      setError("Tier is required");
      return;
    }
    const formData = new FormData();
    formData.set("description", values.description.trim());
    if (values.type) formData.set("type", values.type.trim());

    const result = perk
      ? await updatePerk(perk.id, {} as never, formData)
      : await createPerk(tierId!, {} as never, formData);

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
    if (!perk) {
      form.reset({ description: "", type: "" });
    }
    onSuccess?.();
  }

  return (
    <form
      id="perk-form"
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-6"
    >
      {error && <p className="text-sm text-destructive">{error}</p>}
      <FieldGroup>
        <Controller
          control={form.control}
          name="description"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="perk-form-description">
                Description
              </FieldLabel>
              <Input
                id="perk-form-description"
                placeholder="Early access to posts"
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
          name="type"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="perk-form-type">
                Type (optional, e.g. discord, early_access)
              </FieldLabel>
              <Input
                id="perk-form-type"
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
            {form.formState.isSubmitting ? "Saving…" : perk ? "Save" : "Add"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
