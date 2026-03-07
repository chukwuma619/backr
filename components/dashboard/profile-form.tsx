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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { updateCreator, updateCreatorNostrPubkey } from "@/app/actions/creator";
import { getNostrPublicKey } from "@/lib/nostr/publish-post";
import type { Creator } from "@/lib/db/schema";

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
  displayName: z.string().min(1).max(200),
  bio: z.string().max(1000).optional(),
  avatarUrl: z.string().max(500).optional(),
  fiberNodeRpcUrl: z.union([z.string().url(), z.literal("")]).optional(),
});

type FormValues = z.infer<typeof schema>;

export function ProfileForm({ data }: { data: Creator }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [nostrStatus, setNostrStatus] = useState<
    "idle" | "pending" | "success" | "error"
  >("idle");
  const [nostrError, setNostrError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      slug: data.slug,
      displayName: data.displayName,
      bio: data.bio || "",
      avatarUrl: data.avatarUrl || "",
      fiberNodeRpcUrl: data.fiberNodeRpcUrl || "",
    },
  });

  async function onSubmit(values: FormValues) {
    setError(null);
    const formData = new FormData();
    formData.set("slug", values.slug.trim().toLowerCase());
    formData.set("displayName", values.displayName.trim());
    if (values.bio) formData.set("bio", values.bio.trim());
    if (values.avatarUrl) formData.set("avatarUrl", values.avatarUrl.trim());
    if (values.fiberNodeRpcUrl) formData.set("fiberNodeRpcUrl", values.fiberNodeRpcUrl.trim());
    const result = await updateCreator({} as never, formData);

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
    router.refresh();
  }

  async function handleConnectNostr() {
    setNostrError(null);
    setNostrStatus("pending");
    try {
      const pubkey = await getNostrPublicKey();
      const result = await updateCreatorNostrPubkey(pubkey);
      if (result?.message) {
        throw new Error(result.message);
      }
      setNostrStatus("success");
      router.refresh();
    } catch (err) {
      setNostrStatus("error");
      setNostrError(
        err instanceof Error ? err.message : "Failed to connect Nostr"
      );
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Edit your public creator profile.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {error && <p className="text-sm text-destructive">{error}</p>}
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio (optional)</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="avatarUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Avatar URL (optional)</FormLabel>
                  <FormControl>
                    <Input type="url" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fiberNodeRpcUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fiber node RPC URL (optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="http://localhost:8227"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center gap-4">
              <div>
                <p className="text-sm font-medium mb-1">Nostr (for publishing posts)</p>
                <p className="text-xs text-muted-foreground mb-2">
                  {data.nostrPubkey
                    ? `Connected: ${data.nostrPubkey.slice(0, 12)}…${data.nostrPubkey.slice(-6)}`
                    : "Connect a Nostr extension (e.g. nos2x) to publish posts."}
                </p>
                <Button
                  type="button"
                  variant={data.nostrPubkey ? "outline" : "default"}
                  size="sm"
                  onClick={handleConnectNostr}
                  disabled={nostrStatus === "pending"}
                >
                  {nostrStatus === "pending"
                    ? "Connecting…"
                    : nostrStatus === "success"
                      ? "Connected"
                      : data.nostrPubkey
                        ? "Reconnect"
                        : "Connect Nostr"}
                </Button>
                {nostrError && (
                  <p className="text-sm text-destructive mt-2">{nostrError}</p>
                )}
              </div>
            </div>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Saving…" : "Save"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
