"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSigner } from "@ckb-ccc/connector-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { updatePost, updatePostCkbfsOutpoint } from "@/app/actions/post";
import {
  buildAndSendPublishTx,
  buildAndSendUpdateTx,
  outpointFromTxHash,
} from "@/lib/ckbfs/build-publish-tx";
import { useAuth } from "@/lib/auth/auth-context";
import type { Post } from "@/lib/db/schema";

const schema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  body: z.string().min(1, "Body is required").max(50000),
});

type FormValues = z.infer<typeof schema>;

type EditPostDialogProps = {
  post: Post;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EditPostDialog({ post, open, onOpenChange }: EditPostDialogProps) {
  const router = useRouter();
  const { user } = useAuth();
  const signer = useSigner();
  const [error, setError] = useState<string | null>(null);
  const [ckbfsStatus, setCkbfsStatus] = useState<
    "idle" | "pending" | "success" | "error"
  >("idle");
  const [ckbfsError, setCkbfsError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: post.title,
      body: post.body,
    },
  });

  async function onSave(values: FormValues) {
    setError(null);
    setCkbfsError(null);
    setCkbfsStatus("idle");

    if (!user?.ckbAddress || !signer) {
      setError("Connect your wallet to save posts to CKB.");
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

    setCkbfsStatus("pending");

    try {
      let txHash: string;
      if (post.ckbfsOutpoint) {
        txHash = await buildAndSendUpdateTx(signer, {
          postId: post.id,
          title: values.title,
          body: values.body,
          creatorAddress: user.ckbAddress,
          oldOutpoint: post.ckbfsOutpoint,
        });
      } else {
        txHash = await buildAndSendPublishTx(signer, {
          postId: post.id,
          title: values.title,
          body: values.body,
          creatorAddress: user.ckbAddress,
        });
      }

      const outpoint = outpointFromTxHash(txHash);
      const updateResult = await updatePostCkbfsOutpoint(post.id, outpoint);

      if (updateResult?.message) {
        throw new Error(updateResult.message);
      }

      setCkbfsStatus("success");
      router.refresh();
    } catch (err) {
      setCkbfsStatus("error");
      setCkbfsError(
        err instanceof Error ? err.message : "Failed to update on CKB"
      );
    }
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      setCkbfsStatus("idle");
      setCkbfsError(null);
    }
    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit post</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSave)}
            className="space-y-4"
          >
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
                      placeholder="Content..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={
                form.formState.isSubmitting ||
                ckbfsStatus === "pending" ||
                !signer ||
                !user?.ckbAddress
              }
            >
              {form.formState.isSubmitting
                ? "Saving…"
                : ckbfsStatus === "pending"
                  ? "Updating on CKB…"
                  : ckbfsStatus === "success"
                    ? "Saved"
                    : "Save"}
            </Button>
            {ckbfsError && (
              <p className="text-sm text-destructive">{ckbfsError}</p>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
