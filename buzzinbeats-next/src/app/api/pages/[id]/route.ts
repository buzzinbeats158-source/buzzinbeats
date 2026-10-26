import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/data/current-user";
import { createClient } from "@/lib/supabase/server";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });

  const formData = await request.formData();
  const title = String(formData.get("title") ?? "").trim();
  const description = (formData.get("description") as string) || null;
  const slug = (formData.get("slug") as string) || "";

  if (!title) {
    return NextResponse.json({ success: false, message: "Please enter a page name." }, { status: 422 });
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("pages")
    .update({ title, description, slug, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, page_id: Number(id), redirect_url: `/dashboard/pages/${id}` });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });

  const supabase = await createClient();
  const { error } = await supabase.from("pages").delete().eq("id", id).eq("user_id", user.id);
  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
