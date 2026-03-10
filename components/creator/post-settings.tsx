"use client";

import { Controller } from "react-hook-form";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
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
import { Globe, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

type PostSettingsProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: { control: any };
  tiers?: { id: string; name: string; amount: string }[];
};

export function PostSettings({ form, tiers = [] }: PostSettingsProps) {
  return (
    <aside className="w-full lg:w-80 shrink-0">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Settings</CardTitle>
          <CardDescription>
            Control who can see your post and when it goes live.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Controller
            control={form.control}
            name="minTierId"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel className="text-base">Audience</FieldLabel>
                <RadioGroup
                  value={field.value ? "paid" : "free"}
                  onValueChange={(value) =>
                    field.onChange(
                      value === "free"
                        ? ""
                        : tiers.some((t) => t.id === field.value)
                          ? field.value
                          : tiers[0]?.id ?? ""
                    )
                  }
                  className="grid gap-3"
                >
                  <label
                    htmlFor="free-access"
                    className={cn(
                      "flex cursor-pointer items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50",
                      !field.value && "border-primary ring-2 ring-primary/20"
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
                      field.value && "border-primary ring-2 ring-primary/20"
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
                {field.value && tiers.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <FieldLabel className="text-sm">Paid members</FieldLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || undefined}
                    >
                      <SelectTrigger id="post-settings-minTierId">
                        <SelectValue placeholder="Select tier" />
                      </SelectTrigger>
                      <SelectContent>
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
        </CardContent>
      </Card>
    </aside>
  );
}