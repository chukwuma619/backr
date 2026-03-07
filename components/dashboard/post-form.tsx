"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createPost, updatePostNostrEventId } from "@/app/actions/post";
import { publishPostToNostr } from "@/lib/nostr/publish-post";
import type { Tier } from "@/lib/db/schema";
import type { Creator } from "@/lib/db/schema";

const schema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  body: z.string().min(1, "Body is required").max(50000),
  minTierId: z.string().uuid("Select a tier"),
});

type FormValues = z.infer<typeof schema>;

export function PostForm({
  tiers,
  creator,
}: {
  tiers: Tier[];
  creator: Creator;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [nostrStatus, setNostrStatus] = useState<
    "idle" | "pending" | "success" | "error"
  >("idle");
  const [nostrError, setNostrError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      body: "",
      minTierId: tiers[0]?.id ?? "",
    },
  });

  async function onSubmit(values: FormValues) {
    setError(null);
    setNostrStatus("idle");
    setNostrError(null);

    if (!creator.nostrPubkey) {
      setError("Connect Nostr in your profile to publish posts.");
      return;
    }

    const formData = new FormData();
    formData.set("title", values.title.trim());
    formData.set("body", values.body.trim());
    formData.set("minTierId", values.minTierId);

    const result = await createPost({} as never, formData);

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

    if (!result?.postId) {
      setError("Post created but no ID returned.");
      return;
    }

    setNostrStatus("pending");
    form.reset({ title: "", body: "", minTierId: tiers[0]?.id ?? "" });

    try {
      const eventId = await publishPostToNostr({
        postId: result.postId,
        title: values.title.trim(),
        body: values.body.trim(),
      });

      const updateResult = await updatePostNostrEventId(result.postId, eventId);

      if (updateResult?.message) {
        throw new Error(updateResult.message);
      }

      setNostrStatus("success");
      router.refresh();
    } catch (err) {
      setNostrStatus("error");
      setNostrError(
        err instanceof Error ? err.message : "Failed to publish to Nostr"
      );
    }
  }

  if (tiers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Posts</CardTitle>
          <CardDescription>
            Create at least one tier before publishing posts.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Publish post</CardTitle>
        <CardDescription>
          Create exclusive content for your patrons. Set the minimum tier
          required to view. Posts are published to Nostr.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {error && <p className="text-sm text-destructive">{error}</p>}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Post title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Write your exclusive content..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="minTierId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum tier</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select tier" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {tiers.map((tier) => (
                        <SelectItem key={tier.id} value={tier.id}>
                          {tier.name} ({tier.priceAmount} {tier.priceCurrency})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                  ? "Publishing to Nostr…"
                  : nostrStatus === "success"
                    ? "Published"
                    : "Publish"}
            </Button>
            {nostrError && (
              <p className="text-sm text-destructive">{nostrError}</p>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
