import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/data/current-user";
import { createClient } from "@/lib/supabase/server";
import { getItemInfo } from "@/lib/amazon";

/**
 * Mirrors Laravel ProductController::autoStore(): dedup ASINs, cap at
 * min(10, slotsAvailable), validate format (exactly 10 alphanumeric
 * chars), fetch each from Amazon PA-API, create the product via the
 * atomic RPC. Per-ASIN failures don't abort the batch — same
 * partial-success behavior as the original.
 *
 * Amazon's product image is NOT downloaded/re-uploaded — Amazon's CDN
 * URLs for a given ASIN are stable/long-lived, so the external URL is
 * stored directly (publicStorageUrl() passes absolute URLs through
 * unchanged). This avoids duplicating bandwidth/storage for images
 * Amazon already serves reliably.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });

  if (!user.amazon_store_id) {
    return NextResponse.json({ success: false, error: "Please set your Amazon Store ID first." }, { status: 422 });
  }

  const body = await request.json();
  const submittedAsins: string[] = Array.isArray(body.asins) ? body.asins : [];

  const cleaned = submittedAsins.map((a) => String(a).trim().toUpperCase()).filter(Boolean);
  const uniqueAsins = Array.from(new Set(cleaned));
  const duplicateSkippedCount = cleaned.length - uniqueAsins.length;

  const supabase = await createClient();
  const { count: currentCount } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("page_id", id);

  const limit = user.bypass_subscription ? 999999 : 0; // no subscription_plan_features configured yet — see admin/system-settings note
  const slotsAvailable = Math.max(0, limit - (currentCount ?? 0));
  const allowedToFetch = Math.min(10, slotsAvailable);
  const limitedAsins = uniqueAsins.slice(0, allowedToFetch);
  const limitSkippedCount = uniqueAsins.length - limitedAsins.length;

  const asinPattern = /^[A-Z0-9]{10}$/;
  const validAsins = limitedAsins.filter((a) => asinPattern.test(a));
  const invalidAsins = limitedAsins.filter((a) => !asinPattern.test(a));

  if (validAsins.length === 0) {
    return NextResponse.json(
      { success: false, error: "Please provide at least one valid ASIN (exactly 10 letters/numbers)." },
      { status: 422 },
    );
  }

  const createdProducts = [];
  const failedAsins: string[] = [];

  for (const asin of validAsins) {
    const { data: amazonData, error: amazonError } = await getItemInfo(asin, user.amazon_store_id);

    if (!amazonData) {
      failedAsins.push(`${asin}${amazonError ? ` (${amazonError})` : ""}`);
      continue;
    }

    const imagePath = amazonData.image || null;

    const affiliateLink = `https://www.amazon.in/dp/${asin}?tag=${user.amazon_store_id}`;

    const { data: product, error } = await supabase.rpc("create_product", {
      p_user_id: user.id,
      p_page_id: Number(id),
      p_title: (amazonData.title || "Amazon Product").slice(0, 50),
      p_link: JSON.stringify([affiliateLink]),
      p_image_path: imagePath ?? "",
      p_description: (amazonData.description || "").slice(0, 200),
      p_starting_price: amazonData.price,
      p_currency_code: amazonData.currency,
      p_currency_symbol: amazonData.currency === "INR" ? "₹" : amazonData.currency,
    });

    if (error || !product) {
      failedAsins.push(`${asin} (${error?.message ?? "failed to save"})`);
      continue;
    }

    await supabase
      .from("products")
      .update({ store_platform: JSON.stringify(["Amazon"]), show_price: user.show_price_pref ?? true })
      .eq("id", product.id);

    createdProducts.push({ id: product.id, title: product.title, asin });
  }

  return NextResponse.json({
    success: true,
    created: createdProducts,
    failedAsins,
    invalidAsins,
    duplicateSkippedCount,
    limitSkippedCount,
  });
}
