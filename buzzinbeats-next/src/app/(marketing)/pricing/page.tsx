import { getCurrentUser } from "@/lib/data/current-user";
import { createClient } from "@/lib/supabase/server";
import { PLAN_CONFIG } from "@/lib/coupons";
import PricingToggle, { type PricingCardData } from "@/components/PricingToggle";

// Plan order matches PLAN_CONFIG's iteration order (starter < growth < pro),
// used purely to decide upgrade/downgrade CTA state relative to the user's
// current subscription.
const PLAN_ORDER = ["starter", "growth", "pro"];

// Feature-level detail per plan. The old Laravel `subscription_plans` table
// stored a `features` row (max_active_pages, products_per_page,
// product_reorder_highlight, auto_product_fetch, link_monitoring_level,
// branding_removal, social_media_tags, social_media_links,
// extra_custom_link, profile_on_landing, bulk_asin_upload, support_level)
// per plan. That table isn't populated in Supabase yet (PLAN_CONFIG is the
// documented fallback — see src/lib/coupons.ts), so this feature matrix is
// a static, reasonably-tiered approximation carrying the same shape/labels
// as the old page. It does not read or write any database table.
const PLAN_FEATURES: Record<
  string,
  {
    productsPerPage: number;
    productReorderHighlight: boolean;
    autoProductFetch: boolean;
    linkMonitoringLevel: "none" | "basic" | "advanced";
    brandingRemoval: boolean;
    socialMediaTags: boolean;
    socialMediaLinks: boolean;
    extraCustomLink: boolean;
    profileOnLanding: boolean;
    bulkAsinUpload: boolean;
    supportLevel: string;
  }
> = {
  starter: {
    productsPerPage: 20,
    productReorderHighlight: false,
    autoProductFetch: false,
    linkMonitoringLevel: "basic",
    brandingRemoval: false,
    socialMediaTags: false,
    socialMediaLinks: true,
    extraCustomLink: false,
    profileOnLanding: false,
    bulkAsinUpload: false,
    supportLevel: "Email",
  },
  growth: {
    productsPerPage: 50,
    productReorderHighlight: true,
    autoProductFetch: true,
    linkMonitoringLevel: "advanced",
    brandingRemoval: true,
    socialMediaTags: true,
    socialMediaLinks: true,
    extraCustomLink: true,
    profileOnLanding: false,
    bulkAsinUpload: true,
    supportLevel: "Priority Email",
  },
  pro: {
    productsPerPage: 100,
    productReorderHighlight: true,
    autoProductFetch: true,
    linkMonitoringLevel: "advanced",
    brandingRemoval: true,
    socialMediaTags: true,
    socialMediaLinks: true,
    extraCustomLink: true,
    profileOnLanding: true,
    bulkAsinUpload: true,
    supportLevel: "Priority + Chat",
  },
};

const POPULAR_PLAN = "growth";

const COMPARISON_ROWS: Array<{
  key: keyof (typeof PLAN_FEATURES)["starter"] | "pages";
  label: string;
  type: "number" | "boolean" | "string";
}> = [
  { key: "pages", label: "Pages", type: "number" },
  { key: "productsPerPage", label: "Products per Page", type: "number" },
  { key: "autoProductFetch", label: "Auto Product Fetch", type: "boolean" },
  { key: "linkMonitoringLevel", label: "Link Health Monitoring", type: "string" },
  { key: "brandingRemoval", label: "Branding Removal", type: "boolean" },
  { key: "socialMediaTags", label: "Social Media Tags", type: "boolean" },
  { key: "socialMediaLinks", label: "Social Media Links", type: "boolean" },
  { key: "extraCustomLink", label: "Extra Custom Link", type: "boolean" },
  { key: "profileOnLanding", label: "Profile on Landing Page", type: "boolean" },
  { key: "productReorderHighlight", label: "Product Reorder / Highlight", type: "boolean" },
  { key: "bulkAsinUpload", label: "Bulk ASIN Upload", type: "boolean" },
  { key: "supportLevel", label: "Support", type: "string" },
];

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default async function PricingPage() {
  const user = await getCurrentUser();

  let currentPlanSlug: string | null = null;
  if (user) {
    const supabase = await createClient();
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("plan")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();
    currentPlanSlug = subscription?.plan ?? null;
  }

  const currentSortOrder = currentPlanSlug ? PLAN_ORDER.indexOf(currentPlanSlug) : -1;

  const plans: PricingCardData[] = PLAN_ORDER.filter((slug) => PLAN_CONFIG[slug]).map((slug, index) => {
    const plan = PLAN_CONFIG[slug];
    const features = PLAN_FEATURES[slug];

    const isCurrentPlan = currentPlanSlug === slug;
    const isUpgrade = currentSortOrder !== -1 && currentSortOrder < index;
    const isDowngrade = currentSortOrder !== -1 && currentSortOrder > index;

    const ctaState: PricingCardData["ctaState"] = isCurrentPlan
      ? "current"
      : isUpgrade
        ? "upgrade"
        : isDowngrade
          ? "downgrade"
          : "default";

    const monthlyHref = user
      ? `/profile/subscription/checkout?plan=${slug}&cycle=monthly`
      : "/register";
    const yearlyHref = user ? `/profile/subscription/checkout?plan=${slug}&cycle=yearly` : "/register";

    const featuresList = [
      { label: `${plan.pages} Pages`, enabled: true },
      { label: `${features.productsPerPage} Products per Page`, enabled: true },
      { label: "Product Reorder / Highlight", enabled: features.productReorderHighlight },
      { label: "Auto Product Fetch", enabled: features.autoProductFetch },
      {
        label: `Link Monitoring (${capitalize(features.linkMonitoringLevel)})`,
        enabled: features.linkMonitoringLevel !== "none",
      },
      { label: "Branding Removal", enabled: features.brandingRemoval },
      { label: "Social Media Tags", enabled: features.socialMediaTags },
      { label: "Social Media Links", enabled: features.socialMediaLinks },
      { label: "Extra Custom Link", enabled: features.extraCustomLink },
      { label: "Profile on Landing Page", enabled: features.profileOnLanding },
      { label: "Bulk ASIN Upload", enabled: features.bulkAsinUpload },
    ];

    return {
      slug,
      name: plan.name,
      monthlyPrice: plan.monthly,
      yearlyPrice: plan.yearly,
      isPopular: slug === POPULAR_PLAN,
      badgeLabel: slug === POPULAR_PLAN ? "Most Popular" : undefined,
      features: featuresList,
      ctaState,
      monthlyHref,
      yearlyHref,
    };
  });

  const comparisonPlans = PLAN_ORDER.filter((slug) => PLAN_CONFIG[slug]);

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden pt-12" style={{
      background:
        "radial-gradient(circle at 0% 0%, rgba(255, 102, 0, 0.08) 0%, transparent 50%), radial-gradient(circle at 100% 100%, rgba(255, 133, 51, 0.08) 0%, transparent 50%)",
    }}>
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-16 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:text-left">
            <h1 className="mb-6 text-4xl font-black leading-tight tracking-tight text-slate-900 md:text-6xl">
              Simple, <span className="text-primary">Transparent</span> Pricing
            </h1>
            <p className="text-lg font-medium text-slate-600">
              Choose the plan that&apos;s right for your business growth. Scale seamlessly as your creator journey
              evolves.
            </p>
          </div>
        </div>

        <PricingToggle plans={plans} />

        {/* Detailed Comparison Section */}
        <div className="mb-24">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-black text-slate-900">Detailed Plan Comparison</h2>
            <p className="mx-auto max-w-2xl text-slate-500">
              Compare every detail of our subscription models to find exactly what you need for your growth.
            </p>
          </div>

          <div className="overflow-x-auto rounded-[2rem] border border-slate-200 bg-white/30 backdrop-blur-md">
            <table className="w-full min-w-[800px] border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <th className="px-8 py-6 text-sm font-bold uppercase tracking-wider text-slate-400">Feature</th>
                  {comparisonPlans.map((slug) => (
                    <th
                      key={slug}
                      className={`px-8 py-6 text-sm font-bold uppercase tracking-wider text-slate-900 ${
                        slug === POPULAR_PLAN ? "text-primary" : ""
                      }`}
                    >
                      {PLAN_CONFIG[slug].name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {COMPARISON_ROWS.map((row) => (
                  <tr key={row.label} className="transition-colors hover:bg-slate-50/50">
                    <td className="px-8 py-5 text-sm font-bold text-slate-700">{row.label}</td>
                    {comparisonPlans.map((slug) => {
                      const value =
                        row.key === "pages" ? PLAN_CONFIG[slug].pages : PLAN_FEATURES[slug][row.key];
                      return (
                        <td
                          key={slug}
                          className={`px-8 py-5 text-sm ${
                            slug === POPULAR_PLAN ? "font-medium text-slate-900" : "text-slate-500"
                          }`}
                        >
                          {row.type === "boolean" ? (
                            value ? (
                              <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm text-green-500">
                                  check_circle
                                </span>{" "}
                                Yes
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-slate-300">
                                <span className="material-symbols-outlined text-sm">cancel</span> No
                              </span>
                            )
                          ) : row.type === "string" ? (
                            capitalize(String(value))
                          ) : (
                            String(value)
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ & Contact Footer */}
        <div className="mb-24">
          <div className="relative flex flex-col items-center gap-8 overflow-hidden rounded-[3rem] border border-slate-200 bg-white px-4 py-16 text-center text-slate-900 shadow-xl">
            <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-primary/5 blur-[100px]" />
            <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-primary-warm/5 blur-[100px]" />

            <div className="relative z-10 max-w-2xl">
              <h2 className="mb-6 text-4xl font-black leading-tight text-slate-900 md:text-5xl">
                Still have questions?
              </h2>
              <p className="text-lg text-slate-500">
                Our support team is here to help you find the perfect fit for your creator business. Reach out
                anytime.
              </p>
            </div>
            <div className="relative z-10 flex flex-wrap justify-center gap-4">
              <a
                href="mailto:support@buzzinbeats.com"
                className="min-w-[200px] rounded-2xl bg-primary px-8 py-4 text-center font-bold text-white shadow-lg shadow-primary/25 transition-all hover:-translate-y-1 hover:shadow-primary/40"
              >
                Contact Support
              </a>
              <a
                href="#"
                className="min-w-[200px] rounded-2xl border border-slate-200 bg-slate-100 px-8 py-4 text-center font-bold text-slate-900 transition-all hover:bg-slate-200"
              >
                Read FAQs
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
