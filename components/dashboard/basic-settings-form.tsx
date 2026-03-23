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
import {
  updateAccount,
  updateAccountNostrPubkey,
  clearNostrPubkeyForCurrentUser,
} from "@/app/actions/account";
import { getNostrPublicKey } from "@/lib/nostr/publish-post";
import { truncateAddress } from "@/lib/utils";
import { PinataImageUploadField } from "@/components/pinata-image-upload-field";

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
    nostrPubkey: string | null;
  };
};

export function BasicSettingsForm({ data }: BasicSettingsFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [nostrPending, setNostrPending] = useState<
    false | "connect" | "disconnect"
  >(false);
  const [nostrError, setNostrError] = useState<string | null>(null);

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

  async function handleConnectNostr() {
    setNostrError(null);
    setNostrPending("connect");
    try {
      const pubkey = await getNostrPublicKey();
      const result = await updateAccountNostrPubkey(pubkey);
      if (result?.error) {
        throw result.error;
      }
      router.refresh();
    } catch (err) {
      setNostrError(
        err instanceof Error ? err.message : "Failed to connect Nostr"
      );
    } finally {
      setNostrPending(false);
    }
  }

  async function handleDisconnectNostr() {
    setNostrError(null);
    setNostrPending("disconnect");
    try {
      const result = await clearNostrPubkeyForCurrentUser();
      if (result?.error) {
        throw result.error;
      }
      router.refresh();
    } catch (err) {
      setNostrError(
        err instanceof Error ? err.message : "Failed to disconnect Nostr"
      );
    } finally {
      setNostrPending(false);
    }
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
            Update your avatar and optional Fiber node URL.
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
              <Controller
                control={form.control}
                name="fiberNodeRpcUrl"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="basic-settings-fiberNodeRpcUrl">
                      Fiber node RPC URL (optional)
                    </FieldLabel>
                    <Input
                      id="basic-settings-fiberNodeRpcUrl"
                      type="url"
                      placeholder="http://localhost:8227"
                      {...field}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Field>
                <p className="text-sm font-medium mb-1">Nostr</p>
                <p className="text-xs text-muted-foreground mb-2">
                  {data.nostrPubkey
                    ? `Connected: ${data.nostrPubkey.slice(0, 12)}…${data.nostrPubkey.slice(-6)}`
                    : "Connect a Nostr extension (e.g. nos2x) to link your identity."}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant={data.nostrPubkey ? "outline" : "default"}
                    size="sm"
                    onClick={handleConnectNostr}
                    disabled={nostrPending !== false}
                  >
                    {nostrPending === "connect"
                      ? "Connecting…"
                      : data.nostrPubkey
                        ? "Reconnect"
                        : "Connect Nostr"}
                  </Button>
                  {data.nostrPubkey ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground"
                      onClick={handleDisconnectNostr}
                      disabled={nostrPending !== false}
                    >
                      {nostrPending === "disconnect"
                        ? "Disconnecting…"
                        : "Disconnect"}
                    </Button>
                  ) : null}
                </div>
                {nostrError && (
                  <p className="text-sm text-destructive mt-2">{nostrError}</p>
                )}
              </Field>
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
