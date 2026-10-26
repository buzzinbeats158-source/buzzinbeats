import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/data/current-user";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

  const supabase = await createClient();
  const { data: page } = await supabase
    .from("pages")
    .select("id, title, description, slug, qr_color, qr_logo_path")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!page) return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json(page);
}
