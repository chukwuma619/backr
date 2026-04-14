"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { updateAccount } from "@/app/actions/account";
import { truncateAddress } from "@/lib/utils";
import { PinataImageUploadField } from "@/components/pinata-image-upload-field";
import { FiberSetupGuide } from "@/components/fiber-setup-guide";
import Link from "next/link";

const schema = z.object({
  avatarUrl: z.string().max(500).optional(),
  fiberNodeRpcUrl: z.union([z.string().url(), z.literal("")]).optional(),
});

type FormValues = z.infer<typeof schema>;

type BasicSettingsFormProps = {
  data: {
    ckbAddress: string;
    avatarUrl: string | null;
    fiberNodeRpcUrl: string | null;
  };
};

export function BasicSettingsForm({ data }: BasicSettingsFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      avatarUrl: data.avatarUrl ?? "",
      fiberNodeRpcUrl: data.fiberNodeRpcUrl ?? "",
    },
  });

  async function onSubmit(values: FormValues) {
    setError(null);
    const formData = new FormData();
    formData.set("avatarUrl", values.avatarUrl?.trim() ?? "");
    formData.set("fiberNodeRpcUrl", values.fiberNodeRpcUrl?.trim() ?? "");

    const result = await updateAccount(formData);

    if (!result.success) {
      if (result.message) setError(result.message);
      if (result.errors) {
        Object.entries(result.errors).forEach(([field, messages]) => {
          form.setError(field as keyof FormValues, {
            message: messages?.[0] ?? "Invalid",
          });
        });
      }
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>
            Your wallet address and account preferences.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field>
            <FieldLabel>CKB address</FieldLabel>
            <Input
              readOnly
              value={data.ckbAddress}
              className="font-mono text-muted-foreground"
              aria-readonly
            />
            <p className="text-xs text-muted-foreground mt-1">
              {truncateAddress(data.ckbAddress)} — linked to your wallet
            </p>
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Profile & preferences</CardTitle>
          <CardDescription>
            Update your avatar. To pay creators with CKB via Fiber, connect your node URL below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            id="basic-settings-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <FieldGroup>
              <Controller
                control={form.control}
                name="avatarUrl"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <PinataImageUploadField
                      id="dashboard-basic-settings-avatarUrl"
                      label="Profile avatar (optional)"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      preview="square"
                      disabled={form.formState.isSubmitting}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <div className="space-y-3">
                <FiberSetupGuide variant="patron" />
                <Controller
                  control={form.control}
                  name="fiberNodeRpcUrl"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="basic-settings-fiberNodeRpcUrl">
                        Your Fiber node JSON-RPC URL
                      </FieldLabel>
                      <Input
                        id="basic-settings-fiberNodeRpcUrl"
                        type="url"
                        placeholder="http://127.0.0.1:8227"
                        {...field}
                        aria-invalid={fieldState.invalid}
                      />
                      <p className="text-muted-foreground text-xs">
                        Required for paying creators: your node runs <code className="text-[0.7rem]">send_payment</code>.{" "}
                        <Link
                          href="/fiber-setup#supporters"
                          className="text-foreground underline underline-offset-4"
                        >
                          Fiber setup guide
                        </Link>
                      </p>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>
              <Field>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Saving…" : "Save changes"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
