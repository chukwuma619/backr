"use client";

import type { Control } from "react-hook-form";
import type { PostEditorFormValues } from "@/lib/creator/post-editor-types";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Globe, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { updatePostAudience } from "@/app/actions/post";
import type { Post } from "@/lib/db/schema";

const formSchema = z.object({
  audience: z.enum(["free", "paid"]),
  minTierId: z.string(), // "" when free, tier id or "all" when paid
});

type FormValues = z.infer<typeof formSchema>;

type PostSettingsFieldsProps = {
  control: Control<PostEditorFormValues>;
  tiers: { id: string; name: string; amount: string }[];
};

export function PostSettingsFields({ control, tiers }: PostSettingsFieldsProps) {
  return (
    <aside className="w-full lg:w-80 shrink-0 min-w-0 pt-6 lg:pt-0 lg:border-l lg:pl-4 lg:h-full">
      <p className="text-lg font-medium border-b pb-3 mb-3">Settings</p>
      <div className="space-y-6">
        <Controller
          control={control}
          name="audience"
          render={({ field: audienceField }) => (
            <Controller
              control={control}
              name="minTierId"
              render={({ field: minTierField, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel className="text-base">Audience</FieldLabel>
                  <RadioGroup
                    value={audienceField.value}
                    onValueChange={(value) => {
                      audienceField.onChange(value);
                      if (value === "free") {
                        minTierField.onChange("");
                      } else if (!minTierField.value && tiers[0]) {
                        minTierField.onChange(tiers[0].id);
                      }
                    }}
                    className="grid gap-3"
                  >
                    <label
                      htmlFor="free-access"
                      className={cn(
                        "flex cursor-pointer items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50",
                        audienceField.value === "free" &&
                          "border-primary ring-2 ring-primary/20",
                      )}
                    >
                      <Globe className="size-5 shrink-0 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">Free access</p>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          Let everyone access this post and discover your work
                        </p>
                      </div>
                      <RadioGroupItem value="free" id="free-access" />
                    </label>

                    <label
                      htmlFor="paid-access"
                      className={cn(
                        "flex cursor-pointer items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50",
                        audienceField.value === "paid" &&
                          "border-primary ring-2 ring-primary/20",
                      )}
                    >
                      <Lock className="size-5 shrink-0 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">Paid access</p>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          Limit access to paid members and people who purchase
                          this post.
                        </p>
                      </div>
                      <RadioGroupItem value="paid" id="paid-access" />
                    </label>
                  </RadioGroup>
                  {audienceField.value === "paid" && tiers.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <FieldLabel className="text-sm">Paid members</FieldLabel>
                      <Select
                        onValueChange={minTierField.onChange}
                        value={minTierField.value || undefined}
                      >
                        <SelectTrigger id="post-settings-minTierId">
                          <SelectValue placeholder="Select tier" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All tiers</SelectItem>
                          {tiers.map((tier) => (
                            <SelectItem key={tier.id} value={tier.id}>
                              {tier.name} ({tier.amount} CKB)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FieldDescription className="text-xs">
                        Members in selected tiers can access
                      </FieldDescription>
                    </div>
                  )}
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          )}
        />
      </div>
    </aside>
  );
}

type PostSettingsProps = {
  post: Post;
  tiers: { id: string; name: string; amount: string }[];
  paidAudienceTierIds: string[];
};

function defaultMinTierId(
  audience: string | null,
  paidAudienceTierIds: string[],
  tiers: { id: string }[],
): string {
  if (audience !== "paid" || paidAudienceTierIds.length === 0) return "";
  const tierIds = tiers.map((t) => t.id);
  const allSelected =
    tierIds.length > 0 &&
    paidAudienceTierIds.length === tierIds.length &&
    paidAudienceTierIds.every((id) => tierIds.includes(id));
  return allSelected ? "all" : (paidAudienceTierIds[0] ?? "");
}

export function PostSettings({
  post,
  tiers = [],
  paidAudienceTierIds = [],
}: PostSettingsProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      audience: (post.audience ?? "free") as "free" | "paid",
      minTierId: defaultMinTierId(
        post.audience ?? null,
        paidAudienceTierIds,
        tiers,
      ),
    },
  });

  async function onSubmit(values: FormValues) {
    const formData = new FormData();
    formData.set("audience", values.audience);
    formData.set(
      "minTierId",
      values.audience === "paid" ? values.minTierId : "",
    );

    const { data, error } = await updatePostAudience(post.id, formData);

    if (error) {
      toast.error(error.message);
      return;
    }
    if (data) {
      toast.success("Settings saved");
    }
  }

  return (
    <aside className="w-full lg:w-80 shrink-0 min-w-0 pt-6 lg:pt-0 lg:border-l lg:pl-4 lg:h-full">
      <p className="text-lg font-medium  border-b pb-3 mb-3">Settings</p>
      <form
        id="post-settings-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
      >
        <Controller
          control={form.control}
          name="audience"
          render={({ field: audienceField }) => (
            <Controller
              control={form.control}
              name="minTierId"
              render={({ field: minTierField, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel className="text-base">Audience</FieldLabel>
                  <RadioGroup
                    value={audienceField.value}
                    onValueChange={(value) => {
                      audienceField.onChange(value);
                      if (value === "free") {
                        minTierField.onChange("");
                      } else if (!minTierField.value && tiers[0]) {
                        minTierField.onChange(tiers[0].id);
                      }
                    }}
                    className="grid gap-3"
                  >
                    <label
                      htmlFor="free-access"
                      className={cn(
                        "flex cursor-pointer items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50",
                        audienceField.value === "free" &&
                          "border-primary ring-2 ring-primary/20",
                      )}
                    >
                      <Globe className="size-5 shrink-0 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">Free access</p>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          Let everyone access this post and discover your work
                        </p>
                      </div>
                      <RadioGroupItem value="free" id="free-access" />
                    </label>

                    <label
                      htmlFor="paid-access"
                      className={cn(
                        "flex cursor-pointer items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50",
                        audienceField.value === "paid" &&
                          "border-primary ring-2 ring-primary/20",
                      )}
                    >
                      <Lock className="size-5 shrink-0 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">Paid access</p>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          Limit access to paid members and people who purchase
                          this post.
                        </p>
                      </div>
                      <RadioGroupItem value="paid" id="paid-access" />
                    </label>
                  </RadioGroup>
                  {audienceField.value === "paid" && tiers.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <FieldLabel className="text-sm">Paid members</FieldLabel>
                      <Select
                        onValueChange={minTierField.onChange}
                        value={minTierField.value || undefined}
                      >
                        <SelectTrigger id="post-settings-minTierId">
                          <SelectValue placeholder="Select tier" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All tiers</SelectItem>
                          {tiers.map((tier) => (
                            <SelectItem key={tier.id} value={tier.id}>
                              {tier.name} ({tier.amount} CKB)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FieldDescription className="text-xs">
                        Members in selected tiers can access
                      </FieldDescription>
                    </div>
                  )}
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving…" : "Save settings"}
        </Button>
      </form>
    </aside>
  );
}
