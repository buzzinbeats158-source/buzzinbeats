import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/data/current-user";
import { createClient } from "@/lib/supabase/server";
import { uploadPublicObject } from "@/lib/storage/r2";

/** Mirrors Laravel PageController's QR-settings autosave (color + logo). */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });

  const formData = await request.formData();
  const qrColor = (formData.get("qr_color") as string) || "#000000";
  const logoFile = formData.get("qr_logo") as File | null;

  const supabase = await createClient();
  const update: Record<string, string> = { qr_color: qrColor };

  if (logoFile && logoFile.size > 0) {
    const objectPath = `qr-logos/${crypto.randomUUID()}.png`;
    const buffer = Buffer.from(await logoFile.arrayBuffer());
    await uploadPublicObject(objectPath, buffer, "image/png");
    update.qr_logo_path = objectPath;
  }

  const { error } = await supabase.from("pages").update(update).eq("id", id).eq("user_id", user.id);
  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
