"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FieldLabel } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { uploadImageToPinata } from "@/lib/uploads/pinata-client-upload";

export type PinataImageUploadFieldProps = {
  id: string;
  label: string;
  description?: string;
  value: string;
  onChange: (url: string) => void;
  preview?: "banner" | "square";
  disabled?: boolean;
};

export function PinataImageUploadField({
  id,
  label,
  description,
  value,
  onChange,
  preview = "banner",
  disabled = false,
}: PinataImageUploadFieldProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const url = await uploadImageToPinata(file);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const clear = () => {
    onChange("");
    setError(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const busy = disabled || uploading;

  return (
    <div className="space-y-2">
      <FieldLabel htmlFor={`${id}-trigger`}>{label}</FieldLabel>
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        id={`${id}-file`}
        disabled={busy}
        onChange={handleFile}
      />
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          id={`${id}-trigger`}
          disabled={busy}
          onClick={() => fileRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : null}
          {value ? "Change image" : "Upload image"}
        </Button>
        {value ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={busy}
            onClick={clear}
          >
            Remove
          </Button>
        ) : null}
      </div>
      {value ? (
        <div
          className={cn(
            "overflow-hidden rounded-md border bg-muted",
            preview === "banner" ? "aspect-[3/1] max-w-md" : "size-24"
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="size-full object-cover" />
        </div>
      ) : null}
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : (
        <p className="text-xs text-muted-foreground">
          {description ??
            "JPEG, PNG, WebP, or GIF. Stored on IPFS via Pinata."}
        </p>
      )}
    </div>
  );
}
