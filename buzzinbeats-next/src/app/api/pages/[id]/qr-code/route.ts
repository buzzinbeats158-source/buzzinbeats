import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/data/current-user";
import { createClient } from "@/lib/supabase/server";
import { generateQrPng, generateQrSvg } from "@/lib/qr";
import { downloadPublicObject } from "@/lib/storage/r2";
import { publicPageUrl } from "@/lib/public-page-url";

/** Mirrors Laravel PageController::downloadQrCode(). */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") ?? "png";

  const supabase = await createClient();
  const { data: page } = await supabase
    .from("pages")
    .select("id, public_username, slug, qr_color, qr_logo_path")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!page) return NextResponse.json({ message: "Not found" }, { status: 404 });

  const publicUrl = publicPageUrl(page, process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin);

  let logoBuffer: Buffer | null = null;
  if (page.qr_logo_path) {
    try {
      logoBuffer = await downloadPublicObject(page.qr_logo_path);
    } catch {
      logoBuffer = null;
    }
  }

  if (format === "svg") {
    const svg = await generateQrSvg(publicUrl, { colorHex: page.qr_color });
    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Content-Disposition": `attachment; filename="Page${page.id}_QR.svg"`,
      },
    });
  }

  const png = await generateQrPng(publicUrl, { colorHex: page.qr_color, logoBuffer });
  return new NextResponse(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="Page${page.id}_QR.png"`,
    },
  });
}
