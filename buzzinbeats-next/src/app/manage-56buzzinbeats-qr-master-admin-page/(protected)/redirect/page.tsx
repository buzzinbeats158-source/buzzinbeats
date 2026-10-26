import { requireAdmin } from "@/lib/data/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOrCreateRedirectPageSettings } from "@/lib/data/redirect-page";
import RedirectSettingsForm from "./RedirectSettingsForm";
import StoreIdForm from "./StoreIdForm";
import ProductManager from "./ProductManager";

export default async function AdminRedirectPage() {
  const admin = await requireAdmin();
  const supabase = createAdminClient();

  const [settings, { data: trending }, { data: flashDeals }] = await Promise.all([
    getOrCreateRedirectPageSettings(),
    supabase.from("redirect_page_products").select("*").eq("section", "trending").order("sort_order").order("id"),
    supabase.from("redirect_page_products").select("*").eq("section", "flash_deals").order("sort_order").order("id"),
  ]);

  return (
    <div>
      <RedirectSettingsForm settings={settings} />

      <div className="mt-6 space-y-6">
        <StoreIdForm currentStoreId={admin.amazon_store_id ?? ""} />
        <ProductManager section="trending" title="Featured Products Manager" icon="shopping_bag" products={trending ?? []} />
        <ProductManager section="flash_deals" title="Flash Deals Manager" icon="bolt" products={flashDeals ?? []} />
      </div>
    </div>
  );
}
