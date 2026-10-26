import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Mirrors Laravel DigitalProductAccessService — intentionally separate
 * from any owner/admin CRUD authorization. For paid products, the only
 * thing that grants a download is an access_token tied to a paid,
 * email-verified DigitalProductSale row. buyer_email is never itself an
 * access credential — no code path here authorizes a download purely on
 * a claimed email address.
 */

type DigitalProduct = {
  id: number;
  status: string;
  storage_object_key: string | null;
  price: number | string;
};

export async function canDownload(product: DigitalProduct, accessToken?: string | null) {
  if (product.status !== "active") return false;
  if (!product.storage_object_key) return false;

  if (Number(product.price) > 0) {
    if (!accessToken) return false;
    return (await findPaidSaleByToken(product.id, accessToken)) !== null;
  }

  return true;
}

export async function findPaidSaleByToken(digitalProductId: number, accessToken?: string | null) {
  if (!accessToken) return null;
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("digital_product_sales")
    .select("*")
    .eq("digital_product_id", digitalProductId)
    .eq("access_token", accessToken)
    .eq("status", "paid")
    .not("email_verified_at", "is", null)
    .maybeSingle();
  return data ?? null;
}
