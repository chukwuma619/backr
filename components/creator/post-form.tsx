"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
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
});

type FormValues = z.infer<typeof formSchema>;

type PostFormProps = {
  creator: Creator & { nostrPubkey?: string | null };
  post?: Post | null;
  tiers?: Pick<Tier, "id" | "name" | "amount">[];
};

export function PostForm({ creator, post, tiers = [] }: PostFormProps) {
  const router = useRouter();
  const isCreate = !post;

  const [error, setError] = useState<string | null>(null);
  const [nostrStatus, setNostrStatus] = useState<
    "idle" | "pending" | "success" | "error"
  >("idle");
  const [nostrError, setNostrError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: post
      ? { title: post.title, body: post.content }
      : { title: "", body: "" },
  });

  useEffect(() => {
    if (post) {
      form.reset({ title: post.title, body: post.content });
    }
  }, [post, form]);

  async function onSubmit(values: FormValues) {
    setError(null);
    setNostrStatus("idle");
    setNostrError(null);

    if (!creator.nostrPubkey) {
      setError(
        post
          ? "Connect Nostr in your profile to save posts."
          : "Connect Nostr in your profile to publish posts.",
      );
      return;
    }

    if (isCreate) {
      const formData = new FormData();
      formData.set("title", values.title.trim());
      formData.set("body", values.body.trim());

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
    } else if (post) {
      const formData = new FormData();
      formData.set("title", values.title.trim());
      formData.set("body", values.body.trim());

      const result = await updatePost(post.id, formData);

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

      setNostrStatus("pending");

      try {
        const eventId = await publishPostToNostr({
          postId: post.id,
          title: values.title.trim(),
          body: values.body.trim(),
          publishedAt: new Date(post.publishedAt),
        });

        const updateResult = await updatePostNostrEventId(post.id, eventId);

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
              </CardContent>
            </Card>
          </div>
          <PostSettings form={form} />
        </form>
      </Form>
    );
  }


}
