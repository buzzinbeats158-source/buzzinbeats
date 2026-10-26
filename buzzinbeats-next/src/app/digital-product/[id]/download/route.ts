import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { canDownload, findPaidSaleByToken } from "@/lib/services/digital-product-access";
import { detectDeviceType } from "@/lib/analytics";
import { getPrivateSignedUrl } from "@/lib/storage/r2";

/**
 * Mirrors Laravel DigitalProductController::requestDownload(): check
 * canDownload() (see digital-product-access.ts), increment clicks, log an
 * analytics_events row, bump download_count/last_downloaded_at on the
 * matching paid sale, then redirect to a short-lived signed URL for the
 * file. The file itself is never streamed through this server.
 *
 * Files live on Cloudflare R2's private bucket (storage_provider === "r2")
 * — a legacy Supabase Storage fallback is kept for any row not yet
 * migrated. Same 15-minute expiry and access_token-gated authorization
 * either way.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const accessToken = request.nextUrl.searchParams.get("token");
  const supabase = createAdminClient();

  const { data: product } = await supabase
    .from("digital_products")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (!product) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  if (!(await canDownload(product, accessToken))) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const isPaid = Number(product.price) > 0 && accessToken;

  await Promise.all([
    supabase.from("digital_products").update({ clicks: (product.clicks ?? 0) + 1 }).eq("id", product.id),
    supabase.from("analytics_events").insert({
      user_id: product.user_id,
      page_id: product.page_id,
      digital_product_id: product.id,
      event_type: "digital_product_download",
      device_type: detectDeviceType(request.headers.get("user-agent")),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }),
    isPaid ? bumpDownloadCount(product.id, accessToken!) : Promise.resolve(),
  ]);

  if (product.storage_provider === "r2") {
    const signedUrl = await getPrivateSignedUrl(product.storage_object_key);
    return NextResponse.redirect(signedUrl);
  }

  const { data: signed, error } = await supabase.storage
    .from("digital-products")
    .createSignedUrl(product.storage_object_key, 15 * 60);

  if (error || !signed) {
    return NextResponse.json({ message: "File unavailable" }, { status: 500 });
  }

  return NextResponse.redirect(signed.signedUrl);
}

async function bumpDownloadCount(digitalProductId: number, accessToken: string) {
  const sale = await findPaidSaleByToken(digitalProductId, accessToken);
  if (!sale) return;
  const supabase = createAdminClient();
  await supabase
    .from("digital_product_sales")
    .update({
      download_count: (sale.download_count ?? 0) + 1,
      last_downloaded_at: new Date().toISOString(),
    })
    .eq("id", sale.id);
}
