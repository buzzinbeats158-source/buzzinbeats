import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/data/current-user";
import { createClient } from "@/lib/supabase/server";

function slugify(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });

  const formData = await request.formData();
  const title = String(formData.get("title") ?? "").trim();
  const description = (formData.get("description") as string) || null;
  const slugInput = (formData.get("slug") as string) || "";

  if (!title) {
    return NextResponse.json({ success: false, message: "Please enter a page name." }, { status: 422 });
  }

  const supabase = await createClient();
  const baseSlug = slugify(slugInput || title);

  let { data: page, error } = await supabase.rpc("create_page", {
    p_user_id: user.id,
    p_title: title,
    p_slug: baseSlug,
    p_description: description,
  });

  if (error?.code === "23505") {
    ({ data: page, error } = await supabase.rpc("create_page", {
      p_user_id: user.id,
      p_title: title,
      p_slug: `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`,
      p_description: description,
    }));
  }

  if (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
  if (!page?.is_published) {
    return NextResponse.json({ success: false, message: "The page was saved but could not be published. Open it in My Pages and choose Publish Page." }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    page_id: page.id,
    slug: page.slug,
    is_published: page.is_published,
    redirect_url: `/dashboard/pages/${page.id}`,
  });
}
