import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export type PlanConfigEntry = { name: string; pages: number; monthly: number; yearly: number };

const FALLBACK_PLAN_CONFIG: Record<string, PlanConfigEntry> = {
  starter: { name: "Starter", pages: 5, monthly: 149, yearly: 1430 },
  growth: { name: "Growth", pages: 15, monthly: 299, yearly: 2870 },
  pro: { name: "Pro", pages: 100, monthly: 999, yearly: 9590 },
};

/** Mirrors Laravel Subscription::planConfig(): DB-driven plan config with a
 * hardcoded fallback when no active plans are configured yet. */
export async function getPlanConfig(): Promise<Record<string, PlanConfigEntry>> {
  const supabase = createAdminClient();
  const { data: plans } = await supabase
    .from("subscription_plans")
    .select("slug, name, monthly_price, yearly_price, subscription_plan_features(max_active_pages)")
    .eq("is_active", true);

  if (!plans || plans.length === 0) return FALLBACK_PLAN_CONFIG;

  const config: Record<string, PlanConfigEntry> = {};
  for (const p of plans) {
    const features = Array.isArray(p.subscription_plan_features) ? p.subscription_plan_features[0] : p.subscription_plan_features;
    config[p.slug] = {
      name: p.name,
      pages: features?.max_active_pages ?? 1,
      monthly: Number(p.monthly_price ?? 0),
      yearly: Number(p.yearly_price ?? 0),
    };
  }
  return config;
}

export function planName(config: Record<string, PlanConfigEntry>, slug: string) {
  return config[slug]?.name ?? slug.charAt(0).toUpperCase() + slug.slice(1);
}

export function planPageLimit(config: Record<string, PlanConfigEntry>, slug: string) {
  return config[slug]?.pages ?? 0;
}
