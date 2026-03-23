"server only";

import { pinata } from "@/lib/pinata-config";

const DEFAULT_SIGNED_UPLOAD_TTL_SECONDS = 30;

export async function createPinataSignedUploadUrl(
  expiresInSeconds: number = DEFAULT_SIGNED_UPLOAD_TTL_SECONDS
) {
  return pinata.upload.public.createSignedURL({
    expires: expiresInSeconds,
  });
}
