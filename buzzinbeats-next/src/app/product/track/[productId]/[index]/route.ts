import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { detectDeviceType } from "@/lib/analytics";

/**
 * Mirrors Laravel PageController::trackProductLink(). `products.link` is a
 * JSON-encoded array of URLs (a product can have multiple buy-links);
 * {index} selects which one, falling back to the raw `link` value if the
 * index is out of range — same fallback the Laravel controller used.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string; index: string }> },
) {
  const { productId, index } = await params;
  const supabase = createAdminClient();

  const { data: product } = await supabase
    .from("products")
    .select("id, user_id, page_id, link, clicks")
    .eq("id", productId)
    .maybeSingle();

  if (!product) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  let url = product.link;
  try {
    const links = JSON.parse(product.link);
    if (Array.isArray(links)) {
      url = links[Number(index)] ?? product.link;
    }
  } catch {
    // product.link wasn't JSON — use it as a plain URL, matching Laravel's
    // behavior (json_decode failure leaves $links null, so `$links[$index]
    // ?? $product->link` falls through to the raw value).
  }

  await Promise.all([
    supabase.from("products").update({ clicks: (product.clicks ?? 0) + 1 }).eq("id", product.id),
    supabase.from("analytics_events").insert({
      user_id: product.user_id,
      page_id: product.page_id,
      product_id: product.id,
      event_type: "product_click",
      device_type: detectDeviceType(request.headers.get("user-agent")),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }),
  ]);

  return NextResponse.redirect(url);
}
