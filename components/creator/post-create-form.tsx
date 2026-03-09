"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TiptapPostEditor } from "@/components/creator/tiptap-post-editor";
import { createPost, updatePostNostrEventId } from "@/app/actions/post";
import { publishPostToNostr } from "@/lib/nostr/publish-post";
import { Users, Send, FileText } from "lucide-react";
import type { Tier } from "@/lib/db/schema";
import type { Creator } from "@/lib/db/schema";

const schema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  body: z.string().min(1, "Content is required").max(50000),
  minTierId: z.string().uuid("Select a tier"),
});

type FormValues = z.infer<typeof schema>;

type PostCreateFormProps = {
  creator: Creator & { nostrPubkey?: string | null };
  tiers: Pick<Tier, "id" | "name" | "amount">[];
};

export function PostCreateForm({ creator, tiers }: PostCreateFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [nostrStatus, setNostrStatus] = useState<
    "idle" | "pending" | "success" | "error"
  >("idle");
  const [nostrError, setNostrError] = useState<string | null>(null);
  const [notifyMembers, setNotifyMembers] = useState(true);

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
      router.push(`/creator/post/${result.postId}`);
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
          <CardTitle>Create post</CardTitle>
          <CardDescription>
            Create at least one tier before publishing posts.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
      <div className="flex-1 min-w-0">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="size-5" />
              Create post
            </CardTitle>
            <CardDescription>
              Share an update, describe your creation, or write something for
              your supporters.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Add a title to your post"
                          className="text-lg font-medium"
                          {...field}
                        />
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
                        <TiptapPostEditor
                          content={field.value}
                          onChange={field.onChange}
                          placeholder="Share an update, describe your creation, or write something for your supporters…"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex flex-wrap items-center gap-4 pt-4">
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
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      <aside className="w-full lg:w-80 shrink-0">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Post settings</CardTitle>
            <CardDescription>
              Control who can see your post and when it goes live.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="minTierId"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <Users className="size-4 text-muted-foreground" />
                    <FormLabel>Audience</FormLabel>
                  </div>
                  <Select
                    onValueChange={field.onChange}
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
                          {tier.name} ({tier.amount} CKB)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-xs">
                    Minimum tier required to view this post
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Send className="size-4 text-muted-foreground" />
                <Label htmlFor="notify-members">Notify members</Label>
              </div>
              <Switch
                id="notify-members"
                checked={notifyMembers}
                onCheckedChange={setNotifyMembers}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Send email and push notifications when you publish
            </p>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
