"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {error && <p className="text-sm text-destructive">{error}</p>}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="Early access to posts" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type (optional, e.g. discord, early_access)</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving…" : perk ? "Save" : "Add"}
        </Button>
      </form>
    </Form>
  );
}
