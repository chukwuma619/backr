"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
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
import { TiptapPostEditor } from "@/components/creator/tiptap-post-editor";
import {
  createPost,
  updatePost,
  updatePostNostrEventId,
} from "@/app/actions/post";
import { publishPostToNostr } from "@/lib/nostr/publish-post";
import type { Post, Tier } from "@/lib/db/schema";
import type { Creator } from "@/lib/db/schema";
import { PostSettings } from "./post-settings";

const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  body: z.string().min(1, "Content is required").max(50000),
  status: z.enum(["draft", "published"]),
  minTierId: z.string().uuid().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type PostFormProps = {
  creator: Creator & { nostrPubkey?: string | null };
  postId?: string;
  post?: Post | null;
  tiers?: Pick<Tier, "id" | "name" | "amount">[];
};

export function PostForm({ creator, postId, post, tiers = [] }: PostFormProps) {
  const router = useRouter();
  const isCreate = !postId;

  const [error, setError] = useState<string | null>(null);
  const [nostrStatus, setNostrStatus] = useState<
    "idle" | "pending" | "success" | "error"
  >("idle");
  const [nostrError, setNostrError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: postId
      ? {
          title: post?.title ?? "",
          body: post?.content ?? "",
          status: (post?.status as "draft" | "published") ?? "draft",
        }
      : { title: "", body: "", status: "draft" as const, minTierId: tiers[0]?.id ?? "" },
  });

  const status = useWatch({ control: form.control, name: "status" });

  useEffect(() => {
    if (post) {
      form.reset({
        title: post.title,
        body: post.content,
        status: (post.status as "draft" | "published") ?? "draft",
      });
    }
  }, [post?.id, form]);

  async function onSubmit(values: FormValues) {
    setError(null);
    setNostrStatus("idle");
    setNostrError(null);

    const isPublishing = values.status === "published";
    if (isPublishing && !creator.nostrPubkey) {
      setError("Connect Nostr in your profile to publish posts.");
      return;
    }

    if (isCreate) {
      const formData = new FormData();
      formData.set("title", values.title.trim());
      formData.set("body", values.body.trim());
      formData.set("status", values.status);
      if (values.minTierId) formData.set("minTierId", values.minTierId);

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

      if (values.status !== "published") {
        router.push(`/creator/post/${result.postId}`);
        router.refresh();
        return;
      }

      setNostrStatus("pending");

      try {
        const eventId = await publishPostToNostr({
          postId: result.postId,
          title: values.title.trim(),
          body: values.body.trim(),
        });

        const updateResult = await updatePostNostrEventId(
          result.postId,
          eventId,
        );

        if (updateResult?.message) {
          throw new Error(updateResult.message);
        }

        setNostrStatus("success");
        router.push(`/creator/post/${result.postId}`);
        router.refresh();
      } catch (err) {
        setNostrStatus("error");
        setNostrError(
          err instanceof Error ? err.message : "Failed to publish to Nostr",
        );
      }
    } else if (postId) {
      const formData = new FormData();
      formData.set("title", values.title.trim());
      formData.set("body", values.body.trim());
      formData.set("status", values.status);

      const result = await updatePost(postId, formData);

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

      if (values.status !== "published") {
        router.refresh();
        return;
      }

      setNostrStatus("pending");

      try {
        const eventId = await publishPostToNostr({
          postId: postId,
          title: values.title.trim(),
          body: values.body.trim(),
          publishedAt: new Date(post?.publishedAt ?? new Date()),
        });

        const updateResult = await updatePostNostrEventId(postId, eventId);

        if (updateResult?.message) {
          throw new Error(updateResult.message);
        }

        setNostrStatus("success");
        router.refresh();
      } catch (err) {
        setNostrStatus("error");
        setNostrError(
          err instanceof Error ? err.message : "Failed to update on Nostr",
        );
      }
    }
  }

  if (isCreate) {
    return (
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-6 lg:flex-row lg:gap-8"
        >
          <div className="flex-1 min-w-0">
            <Card>
              <CardContent className="space-y-6">
                {error && <p className="text-sm text-destructive">{error}</p>}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={
                            isCreate ? "Add a title to your post" : "Post title"
                          }
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
                          placeholder={
                            isCreate
                              ? "Share an update, describe your creation, or write something for your supporters…"
                              : "Content..."
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex flex-wrap items-center gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={
                      form.formState.isSubmitting ||
                      (status === "published" &&
                        (nostrStatus === "pending" || !creator.nostrPubkey))
                    }
                  >
                    {form.formState.isSubmitting
                      ? "Saving…"
                      : status === "published" && nostrStatus === "pending"
                        ? "Publishing to Nostr…"
                        : status === "published" && nostrStatus === "success"
                          ? "Published"
                          : status === "published"
                            ? "Publish"
                            : "Save as draft"}
                  </Button>
                  {nostrError && (
                    <p className="text-sm text-destructive">{nostrError}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          <PostSettings form={form} tiers={tiers} />
        </form>
      </Form>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
      >
        <Card>
          <CardContent className="space-y-6 pt-6">
            {error && <p className="text-sm text-destructive">{error}</p>}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Post title"
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
                      placeholder="Content..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Button
                type="submit"
                disabled={
                  form.formState.isSubmitting ||
                  (status === "published" &&
                    (nostrStatus === "pending" || !creator.nostrPubkey))
                }
              >
                {form.formState.isSubmitting
                  ? "Saving…"
                  : status === "published" && nostrStatus === "pending"
                    ? "Updating on Nostr…"
                    : status === "published" && nostrStatus === "success"
                      ? "Saved"
                      : status === "published"
                        ? "Publish"
                        : "Save as draft"}
              </Button>
              {nostrError && (
                <p className="text-sm text-destructive">{nostrError}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
