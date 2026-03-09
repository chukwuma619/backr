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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createTier, updateTier } from "@/app/actions/tiers";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  amount: z.string().min(1, "Amount is required").max(50),
});

type FormValues = z.infer<typeof schema>;

type TierForForm = {
  id: string;
  name: string;
  description: string;
  amount: string;
};

export function TierForm({
  tier,
  onSuccess,
}: {
  tier?: TierForForm;
  onSuccess?: () => void;
}) {
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: tier
      ? {
          name: tier.name,
          description: tier.description || "",
          amount: tier.amount,
        }
      : {
          name: "",
          description: "",
          amount: "",
        },
  });

  async function onSubmit(values: FormValues) {
    setError(null);
    const formData = new FormData();
    formData.set("name", values.name.trim());
    if (values.description) formData.set("description", values.description.trim());
    formData.set("amount", values.amount.trim());

    const result = tier
      ? await updateTier(tier.id, {} as never, formData)
      : await createTier({} as never, formData);

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
    if (!tier) {
      form.reset({
        name: "",
        description: "",
        amount: "",
      });
    }
    onSuccess?.();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {error && <p className="text-sm text-destructive">{error}</p>}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Gold" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (optional)</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount (CKB)</FormLabel>
              <FormControl>
                <Input placeholder="5" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving…" : tier ? "Save" : "Create"}
        </Button>
      </form>
    </Form>
  );
}
