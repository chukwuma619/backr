/** Browser-only: uploads via signed URL from GET /api/url, returns public gateway file URL. */

function normalizeGatewayBase(gateway: string): string {
  const g = gateway.trim().replace(/\/$/, "");
  if (g.startsWith("http://") || g.startsWith("https://")) return g;
  return `https://${g}`;
}

export async function uploadImageToPinata(file: File): Promise<string> {
  const gateway = process.env.NEXT_PUBLIC_GATEWAY_URL;
  if (!gateway) {
    throw new Error("Missing NEXT_PUBLIC_GATEWAY_URL.");
  }

  const signRes = await fetch("/api/url");
  if (!signRes.ok) {
    const err = await signRes.json().catch(() => ({}));
    const msg =
      typeof err === "object" && err && "error" in err && typeof (err as { error: unknown }).error === "string"
        ? (err as { error: string }).error
        : "Failed to get upload URL.";
    throw new Error(msg);
  }

  const { url: signedUrl } = (await signRes.json()) as { url: string };

  const formData = new FormData();
  formData.append("file", file, file.name);
  formData.append("network", "public");
  formData.append("name", file.name);

  const uploadRes = await fetch(signedUrl, {
    method: "POST",
    headers: { Source: "backr/client" },
    body: formData,
  });

  if (!uploadRes.ok) {
    const text = await uploadRes.text();
    throw new Error(text || "Upload failed.");
  }

  const json = (await uploadRes.json()) as { data?: { cid?: string } };
  const cid = json.data?.cid;
  if (!cid) {
    throw new Error("Upload did not return a file id.");
  }

  const base = normalizeGatewayBase(gateway);
  return `${base}/files/${cid}`;
}
