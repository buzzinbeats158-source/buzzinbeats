import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/** Mirrors Laravel RedirectPageController::trackProductClick(). */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data: product } = await supabase.from("redirect_page_products").select("product_url").eq("id", id).maybeSingle();

  if (!product) return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.redirect(product.product_url);
}
