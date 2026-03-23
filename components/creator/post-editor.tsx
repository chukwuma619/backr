"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { updatePostWithSettings } from "@/app/actions/post";
import { PostFormFields } from "@/components/creator/post-form";
import { PostSettingsFields } from "@/components/creator/post-settings";
import type { PostEditorFormValues } from "@/lib/creator/post-editor-types";
import type { Post } from "@/lib/db/schema";

const DEBOUNCE_MS = 600;

const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  body: z.string().min(1, "Content is required").max(50000),
  coverImageUrl: z.string().max(500),
  audience: z.enum(["free", "paid"]),
  minTierId: z.string(),
  collectionIds: z.array(z.string()),
}) satisfies z.ZodType<PostEditorFormValues>;

function defaultMinTierId(
  audience: string | null,
  paidAudienceTierIds: string[],
  tiers: { id: string }[]
): string {
  if (audience !== "paid" || paidAudienceTierIds.length === 0) return "";
  const tierIds = tiers.map((t) => t.id);
  const allSelected =
    tierIds.length > 0 &&
    paidAudienceTierIds.length === tierIds.length &&
    paidAudienceTierIds.every((id) => tierIds.includes(id));
  return allSelected ? "all" : paidAudienceTierIds[0] ?? "";
}

type PostEditorProps = {
  post: Post;
  tiers: { id: string; name: string; amount: string }[];
  paidAudienceTierIds: string[];
  collections: { id: number; name: string }[];
  postCollectionIds: number[];
  header?: React.ReactNode;
};

export function PostEditor({
  post,
  tiers,
  paidAudienceTierIds,
  collections,
  postCollectionIds,
  header,
}: PostEditorProps) {
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const isMountedRef = useRef(false);

  const form = useForm<PostEditorFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: post.title ?? "",
      body: post.content ?? "",
      coverImageUrl: post.coverImageUrl ?? "",
      audience: (post.audience ?? "free") as "free" | "paid",
      minTierId: defaultMinTierId(post.audience ?? null, paidAudienceTierIds, tiers),
      collectionIds: postCollectionIds.map(String),
    },
  });

  const watched = useWatch({ control: form.control });

  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return;
    }

    const timer = setTimeout(async () => {
      const values = form.getValues();
      if (!values.title?.trim() || !values.body?.trim()) return;
      const formData = new FormData();
      formData.set("title", values.title.trim());
      formData.set("body", values.body.trim());
      formData.set("coverImageUrl", values.coverImageUrl?.trim() ?? "");
      formData.set("audience", values.audience);
      formData.set("minTierId", values.audience === "paid" ? values.minTierId : "");
      values.collectionIds.forEach((id) => formData.append("collectionIds", id));

      setSaveStatus("saving");
      const { error } = await updatePostWithSettings(post.id, formData);
      if (error) {
        toast.error(error.message);
        setSaveStatus("idle");
        return;
      }
      form.reset(values, { keepValues: true });
      setSaveStatus("saved");
      const t = setTimeout(() => setSaveStatus("idle"), 2000);
      return () => clearTimeout(t);
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- form is stable from useForm
  }, [watched, post.id]);

  return (
    <div className="flex flex-col lg:flex-row h-full gap-6 lg:gap-0 p-4 lg:p-0">
      <div className="space-y-6 w-full min-w-0 pr-0 lg:pr-4">
        {header}
        {saveStatus !== "idle" && (
          <p className="text-sm text-muted-foreground">
            {saveStatus === "saving" ? "Saving…" : "Saved"}
          </p>
        )}
        <PostFormFields control={form.control} />
      </div>
        <PostSettingsFields
          control={form.control}
          tiers={tiers}
          collections={collections}
        />
    </div>
  );
}
