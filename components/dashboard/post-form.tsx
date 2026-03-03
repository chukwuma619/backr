"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSigner } from "@ckb-ccc/connector-react";
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
import { createPost, updatePostCkbfsOutpoint } from "@/app/actions/post";
import {
  buildAndSendPublishTx,
  outpointFromTxHash,
} from "@/lib/ckbfs/build-publish-tx";
import { useAuth } from "@/lib/auth/auth-context";
import type { Tier } from "@/lib/db/schema";

const schema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  body: z.string().min(1, "Body is required").max(50000),
  minTierId: z.string().uuid("Select a tier"),
});

type FormValues = z.infer<typeof schema>;

export function PostForm({ tiers }: { tiers: Tier[] }) {
  const router = useRouter();
  const { user } = useAuth();
  const signer = useSigner();
  const [error, setError] = useState<string | null>(null);
  const [pendingCkbPublish, setPendingCkbPublish] = useState<{
    postId: string;
    title: string;
    body: string;
  } | null>(null);
  const [ckbfsStatus, setCkbfsStatus] = useState<
    "idle" | "pending" | "success" | "error"
  >("idle");
  const [ckbfsError, setCkbfsError] = useState<string | null>(null);

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
    setCkbfsStatus("idle");
    setCkbfsError(null);
    setPendingCkbPublish(null);

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
    if (result?.postId) {
      setPendingCkbPublish({
        postId: result.postId,
        title: values.title.trim(),
        body: values.body.trim(),
      });
    }
    form.reset({ title: "", body: "", minTierId: tiers[0]?.id ?? "" });
  }

  async function handlePublishToCkb() {
    if (!pendingCkbPublish || !user?.ckbAddress || !signer) {
      setCkbfsError(
        !signer
          ? "Connect your wallet to publish to CKB"
          : "Missing post or address"
      );
      setCkbfsStatus("error");
      return;
    }

    const values = form.getValues();
    setCkbfsStatus("pending");
    setCkbfsError(null);

    try {
      const txHash = await buildAndSendPublishTx(signer, {
        postId: pendingCkbPublish.postId,
        title: pendingCkbPublish.title || "(untitled)",
        body: pendingCkbPublish.body || "",
        creatorAddress: user.ckbAddress,
      });

      const outpoint = outpointFromTxHash(txHash);
      const updateResult = await updatePostCkbfsOutpoint(
        pendingCkbPublish.postId,
        outpoint
      );

      if (updateResult?.message) {
        throw new Error(updateResult.message);
      }

      setCkbfsStatus("success");
      setPendingCkbPublish(null);
      router.refresh();
    } catch (err) {
      setCkbfsStatus("error");
      setCkbfsError(
        err instanceof Error ? err.message : "Failed to publish to CKB"
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
          Create exclusive content for your patrons. Set the minimum tier required to view.
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
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Publishing…" : "Publish"}
            </Button>

            {pendingCkbPublish && (
              <div className="rounded-lg border border-dashed p-4 space-y-2">
                <p className="text-sm font-medium">
                  Post saved. Publish to CKB for on-chain permanence?
                </p>
                {ckbfsError && (
                  <p className="text-sm text-destructive">{ckbfsError}</p>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePublishToCkb}
                  disabled={
                    ckbfsStatus === "pending" || !signer || !user?.ckbAddress
                  }
                >
                  {ckbfsStatus === "pending"
                    ? "Publishing to CKB…"
                    : ckbfsStatus === "success"
                      ? "Published to CKB"
                      : "Publish to CKB"}
                </Button>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
