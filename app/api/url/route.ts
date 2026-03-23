import { NextResponse } from "next/server";
import { createPinataSignedUploadUrl } from "@/lib/uploads/pinata";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const url = await createPinataSignedUploadUrl();
    return NextResponse.json({ url }, { status: 200 });
  } catch (error) {
    console.error("Failed to create Pinata signed upload URL:", error);
    return NextResponse.json(
      { error: "Failed to create Pinata upload URL." },
      { status: 500 }
    );
  }
}