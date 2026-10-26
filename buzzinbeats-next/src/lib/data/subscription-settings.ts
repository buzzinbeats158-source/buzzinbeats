"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/data/admin";
import { createAdminClient } from "@/lib/supabase/admin";

const BASE = "/manage-56buzzinbeats-qr-master-admin-page/subscription-settings";

/** Mirrors Laravel's SubscriptionPlanSeeder defaults — used only when the
 * admin explicitly clicks "Initialize default plans" on an empty table,
 * never run automatically. */
const DEFAULT_PLANS: Array<{
  slug: string;
  name: string;
  monthly_price: number;
  yearly_price: number;
  yearly_discount_percent: number;
  is_active: boolean;
  is_popular: boolean;
  badge_label: string | null;
  sort_order: number;
  features: Record<string, string | number | boolean | null>;
}> = [
  {
    slug: "starter",
    name: "Starter",
    monthly_price: 149,
    yearly_price: 1430,
    yearly_discount_percent: 20,
    is_active: true,
    is_popular: false,
    badge_label: null,
    sort_order: 1,
    features: {
      max_active_pages: 5,
      extra_pages_enabled: false,
      extra_page_price: null,
      products_per_page: 20,
      extra_products_enabled: false,
      extra_product_price: null,
      template_1_enabled: true,
      template_2_enabled: false,
      template_3_enabled: false,
      template_4_enabled: false,
      template_5_enabled: false,
      template_6_enabled: false,
      auto_product_fetch: false,
      branding_removal: false,
      bulk_asin_upload: false,
      social_media_tags: false,
      social_media_links: false,
      extra_custom_link: false,
      profile_on_landing: false,
      product_reorder_highlight: false,
      link_monitoring_level: "off",
      support_level: "standard",
    },
  },
  {
    slug: "growth",
    name: "Growth",
    monthly_price: 299,
    yearly_price: 2870,
    yearly_discount_percent: 20,
    is_active: true,
    is_popular: true,
    badge_label: "Popular",
    sort_order: 2,
    features: {
      max_active_pages: 15,
      extra_pages_enabled: true,
      extra_page_price: 50,
      products_per_page: 50,
      extra_products_enabled: true,
      extra_product_price: 25,
      template_1_enabled: true,
      template_2_enabled: true,
      template_3_enabled: true,
      template_4_enabled: false,
      template_5_enabled: false,
      template_6_enabled: false,
      auto_product_fetch: true,
      branding_removal: false,
      bulk_asin_upload: true,
      social_media_tags: true,
      social_media_links: false,
      extra_custom_link: false,
      profile_on_landing: false,
      product_reorder_highlight: false,
      link_monitoring_level: "basic",
      support_level: "priority",
    },
  },
  {
    slug: "premium",
    name: "Premium",
    monthly_price: 499,
    yearly_price: 4790,
    yearly_discount_percent: 20,
    is_active: true,
    is_popular: false,
    badge_label: "Recommended",
    sort_order: 3,
    features: {
      max_active_pages: 50,
      extra_pages_enabled: true,
      extra_page_price: 30,
      products_per_page: 200,
      extra_products_enabled: true,
      extra_product_price: 15,
      template_1_enabled: true,
      template_2_enabled: true,
      template_3_enabled: true,
      template_4_enabled: true,
      template_5_enabled: true,
      template_6_enabled: false,
      auto_product_fetch: true,
      branding_removal: true,
      bulk_asin_upload: true,
      social_media_tags: true,
      social_media_links: true,
      extra_custom_link: true,
      profile_on_landing: true,
      product_reorder_highlight: false,
      link_monitoring_level: "advanced",
      support_level: "priority",
    },
  },
  {
    slug: "pro",
    name: "Pro",
    monthly_price: 999,
    yearly_price: 9590,
    yearly_discount_percent: 20,
    is_active: true,
    is_popular: false,
    badge_label: null,
    sort_order: 4,
    features: {
      max_active_pages: 9999,
      extra_pages_enabled: true,
      extra_page_price: 10,
      products_per_page: 1000,
      extra_products_enabled: true,
      extra_product_price: 5,
      template_1_enabled: true,
      template_2_enabled: true,
      template_3_enabled: true,
      template_4_enabled: true,
      template_5_enabled: true,
      template_6_enabled: true,
      auto_product_fetch: true,
      branding_removal: true,
      bulk_asin_upload: true,
      social_media_tags: true,
      social_media_links: true,
      extra_custom_link: true,
      profile_on_landing: true,
      product_reorder_highlight: true,
      link_monitoring_level: "advanced_realtime",
      support_level: "vip",
    },
  },
];

export async function seedDefaultPlansAction() {
  await requireAdmin();
  const supabase = createAdminClient();

  const { count } = await supabase.from("subscription_plans").select("id", { count: "exact", head: true });
  if (count && count > 0) throw new Error("Plans already exist — cannot re-initialize.");

  for (const plan of DEFAULT_PLANS) {
    const { features, ...planFields } = plan;
    const { data: created, error } = await supabase.from("subscription_plans").insert(planFields).select("id").single();
    if (error) throw new Error(error.message);
    const { error: featErr } = await supabase.from("subscription_plan_features").insert({ plan_id: created.id, ...features });
    if (featErr) throw new Error(featErr.message);
  }

  revalidatePath(BASE);
}

export type PlanMatrixRow = {
  id: number;
  slug: string;
  name: string;
  monthly_price: number;
  yearly_price: number | null;
  yearly_discount_percent: number | null;
  is_active: boolean;
  is_popular: boolean;
  badge_label: string | null;
  sort_order: number;
  feature_id: number;
  max_active_pages: number;
  extra_pages_enabled: boolean;
  extra_page_price: number | null;
  products_per_page: number;
  extra_products_enabled: boolean;
  extra_product_price: number | null;
  template_1_enabled: boolean;
  template_2_enabled: boolean;
  template_3_enabled: boolean;
  template_4_enabled: boolean;
  template_5_enabled: boolean;
  template_6_enabled: boolean;
  auto_product_fetch: boolean;
  branding_removal: boolean;
  bulk_asin_upload: boolean;
  social_media_tags: boolean;
  social_media_links: boolean;
  extra_custom_link: boolean;
  profile_on_landing: boolean;
  product_reorder_highlight: boolean;
  link_monitoring_level: string;
  support_level: string;
};

export async function updateSubscriptionSettingsAction(rows: PlanMatrixRow[]) {
  await requireAdmin();
  const supabase = createAdminClient();

  for (const row of rows) {
    const { error } = await supabase
      .from("subscription_plans")
      .update({
        name: row.name,
        monthly_price: row.monthly_price,
        yearly_price: row.yearly_price,
        yearly_discount_percent: row.yearly_discount_percent,
        is_active: row.is_active,
        is_popular: row.is_popular,
        badge_label: row.badge_label,
        sort_order: row.sort_order,
      })
      .eq("id", row.id);
    if (error) throw new Error(error.message);

    const { error: featErr } = await supabase
      .from("subscription_plan_features")
      .update({
        max_active_pages: row.max_active_pages,
        extra_pages_enabled: row.extra_pages_enabled,
        extra_page_price: row.extra_page_price,
        products_per_page: row.products_per_page,
        extra_products_enabled: row.extra_products_enabled,
        extra_product_price: row.extra_product_price,
        template_1_enabled: row.template_1_enabled,
        template_2_enabled: row.template_2_enabled,
        template_3_enabled: row.template_3_enabled,
        template_4_enabled: row.template_4_enabled,
        template_5_enabled: row.template_5_enabled,
        template_6_enabled: row.template_6_enabled,
        auto_product_fetch: row.auto_product_fetch,
        branding_removal: row.branding_removal,
        bulk_asin_upload: row.bulk_asin_upload,
        social_media_tags: row.social_media_tags,
        social_media_links: row.social_media_links,
        extra_custom_link: row.extra_custom_link,
        profile_on_landing: row.profile_on_landing,
        product_reorder_highlight: row.product_reorder_highlight,
        link_monitoring_level: row.link_monitoring_level,
        support_level: row.support_level,
      })
      .eq("id", row.feature_id);
    if (featErr) throw new Error(featErr.message);
  }

  revalidatePath(BASE);
}
