import { NextResponse } from "next/server";
import { generateQrSvg } from "@/lib/qr";

/** Mirrors Laravel PageController::previewQrCode() — live SVG preview while editing. */
export async function POST(request: Request) {
  const body = await request.json();
  const { url, color } = body;

  if (!url) return NextResponse.json({ success: false, message: "URL required" }, { status: 400 });

  const svg = await generateQrSvg(url, { colorHex: color });
  return NextResponse.json({ svg });
}
