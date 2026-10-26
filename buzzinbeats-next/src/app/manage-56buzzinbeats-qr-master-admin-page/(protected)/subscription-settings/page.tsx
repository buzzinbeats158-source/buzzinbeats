import { requireAdmin } from "@/lib/data/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import PlanMatrixForm from "./PlanMatrixForm";
import SeedDefaultPlansButton from "./SeedDefaultPlansButton";
import type { PlanMatrixRow } from "@/lib/data/subscription-settings";

export default async function AdminSubscriptionSettingsPage() {
  await requireAdmin();
  const supabase = createAdminClient();
  const { data: plans } = await supabase
    .from("subscription_plans")
    .select("*, subscription_plan_features(*)")
    .order("sort_order");

  if (!plans || plans.length === 0) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-slate-900">Plan Matrix</h1>
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="mb-4 text-slate-500">
            No subscription plans configured yet — the real account currently uses promotional/bypass access instead of a
            metered plan.
          </p>
          <SeedDefaultPlansButton />
        </div>
      </div>
    );
  }

  const rows: PlanMatrixRow[] = plans
    .filter((p) => p.subscription_plan_features)
    .map((p) => {
      const f = p.subscription_plan_features;
      return {
        id: p.id,
        slug: p.slug,
        name: p.name,
        monthly_price: Number(p.monthly_price),
        yearly_price: p.yearly_price !== null ? Number(p.yearly_price) : null,
        yearly_discount_percent: p.yearly_discount_percent,
        is_active: p.is_active,
        is_popular: p.is_popular,
        badge_label: p.badge_label,
        sort_order: p.sort_order,
        feature_id: f.id,
        max_active_pages: f.max_active_pages,
        extra_pages_enabled: f.extra_pages_enabled,
        extra_page_price: f.extra_page_price !== null ? Number(f.extra_page_price) : null,
        products_per_page: f.products_per_page,
        extra_products_enabled: f.extra_products_enabled,
        extra_product_price: f.extra_product_price !== null ? Number(f.extra_product_price) : null,
        template_1_enabled: f.template_1_enabled,
        template_2_enabled: f.template_2_enabled,
        template_3_enabled: f.template_3_enabled,
        template_4_enabled: f.template_4_enabled,
        template_5_enabled: f.template_5_enabled,
        template_6_enabled: f.template_6_enabled,
        auto_product_fetch: f.auto_product_fetch,
        branding_removal: f.branding_removal,
        bulk_asin_upload: f.bulk_asin_upload,
        social_media_tags: f.social_media_tags,
        social_media_links: f.social_media_links,
        extra_custom_link: f.extra_custom_link,
        profile_on_landing: f.profile_on_landing,
        product_reorder_highlight: f.product_reorder_highlight,
        link_monitoring_level: f.link_monitoring_level,
        support_level: f.support_level,
      };
    });

  return <PlanMatrixForm initialRows={rows} />;
}
