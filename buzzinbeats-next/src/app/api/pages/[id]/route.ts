import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/data/current-user";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

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
  const { data: page, error: lookupError } = await supabase
    .from("pages")
    .select("slug")
    .eq("id", id)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .maybeSingle();
  if (lookupError) return NextResponse.json({ success: false, message: lookupError.message }, { status: 500 });
  if (!page) return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
  if (formData.has("slug") && slug !== page.slug) {
    return NextResponse.json({ success: false, message: "This page's URL is permanently locked to protect shared links and QR codes." }, { status: 422 });
  }

  const { error } = await supabase
    .from("pages")
    .update({ title, description, updated_at: new Date().toISOString() })
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
  const { data: page, error } = await supabase
    .from("pages")
    .update({ deleted_at: new Date().toISOString(), is_published: false, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();
  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  if (!page) return NextResponse.json({ success: false, message: "Page not found" }, { status: 404 });

  revalidatePath("/dashboard/pages");
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/pages/${id}`);

  return NextResponse.json({ success: true });
}
