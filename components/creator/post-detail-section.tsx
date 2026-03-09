"use client";

import { useState } from "react";
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
import { updatePost, updatePostNostrEventId } from "@/app/actions/post";
import { publishPostToNostr } from "@/lib/nostr/publish-post";
import { NostrShareLinks } from "@/components/nostr-share-links";
import { Pencil, Save, X } from "lucide-react";
import type { Post } from "@/lib/db/schema";
import type { Creator } from "@/lib/db/schema";

const schema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  body: z.string().min(1, "Body is required").max(50000),
});

type FormValues = z.infer<typeof schema>;

type PostDetailSectionProps = {
  post: Post;
  creator: Creator & { nostrPubkey?: string | null };
};

export function PostDetailSection({ post, creator }: PostDetailSectionProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nostrStatus, setNostrStatus] = useState<
    "idle" | "pending" | "success" | "error"
  >("idle");
  const [nostrError, setNostrError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: post.title,
      body: post.content,
    },
  });

  async function onSave(values: FormValues) {
    setError(null);
    setNostrError(null);
    setNostrStatus("idle");

    if (!creator.nostrPubkey) {
      setError("Connect Nostr in your profile to save posts.");
      return;
    }

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
      setIsEditing(false);
      router.refresh();
    } catch (err) {
      setNostrStatus("error");
      setNostrError(
        err instanceof Error ? err.message : "Failed to update on Nostr"
      );
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          {isEditing ? (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSave)}
                className="space-y-4"
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
                          placeholder="Post title"
                          className="text-lg font-semibold"
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
                <div className="flex items-center gap-2">
                  <Button
                    type="submit"
                    disabled={
                      form.formState.isSubmitting ||
                      nostrStatus === "pending" ||
                      !creator.nostrPubkey
                    }
                  >
                    {form.formState.isSubmitting ? (
                      "Saving…"
                    ) : nostrStatus === "pending" ? (
                      "Updating on Nostr…"
                    ) : nostrStatus === "success" ? (
                      "Saved"
                    ) : (
                      <>
                        <Save className="size-4 mr-2" />
                        Save
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      form.reset({ title: post.title, body: post.content });
                    }}
                  >
                    <X className="size-4 mr-2" />
                    Cancel
                  </Button>
                  {nostrError && (
                    <p className="text-sm text-destructive">{nostrError}</p>
                  )}
                </div>
              </form>
            </Form>
          ) : (
            <>
              <CardTitle className="text-2xl">{post.title}</CardTitle>
              <CardDescription className="mt-2 flex items-center gap-2 flex-wrap">
                <span>
                  {format(new Date(post.publishedAt), "MMM d, yyyy")}
                </span>
                {post.nostrEventId && (
                  <>
                    <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">
                      On Nostr
                    </span>
                    <NostrShareLinks eventId={post.nostrEventId} />
                  </>
                )}
              </CardDescription>
            </>
          )}
        </div>
        {!isEditing && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="shrink-0"
          >
            <Pencil className="size-4 mr-2" />
            Edit
          </Button>
        )}
      </CardHeader>
      {!isEditing && (
        <CardContent>
          <div
            className="prose prose-sm dark:prose-invert max-w-none [&_h2]:text-lg [&_h2]:font-semibold [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_blockquote]:border-l-4 [&_blockquote]:border-muted-foreground/30 [&_blockquote]:pl-4 [&_blockquote]:italic [&_code]:bg-muted [&_code]:px-1 [&_code]:rounded [&_code]:text-sm"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </CardContent>
      )}
    </Card>
  );
}
