import { getCurrentUser } from "@/lib/data/current-user";
import { createClient } from "@/lib/supabase/server";
import { PLAN_CONFIG } from "@/lib/coupons";

export default async function SubscriptionSettingsPage() {
  const user = await getCurrentUser();
  const supabase = await createClient();

  const [{ data: subscription }, { data: scheduledSubscription }, { count: pageCount }] = await Promise.all([
    supabase.from("subscriptions").select("*").eq("user_id", user!.id).eq("status", "active").maybeSingle(),
    supabase.from("subscriptions").select("*").eq("user_id", user!.id).eq("status", "scheduled").maybeSingle(),
    supabase.from("pages").select("id", { count: "exact", head: true }).eq("user_id", user!.id).is("deleted_at", null),
  ]);

  const plan = subscription ? PLAN_CONFIG[subscription.plan] : null;
  const pageLimit = plan?.pages ?? 0;
  const usedPages = pageCount ?? 0;
  const usagePct = pageLimit > 0 ? Math.min(100, Math.round((usedPages / pageLimit) * 100)) : 0;
  const daysLeft = subscription?.expires_at
    ? Math.max(0, Math.ceil((new Date(subscription.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;
  const renewLabel = subscription?.billing_cycle === "yearly" ? "Billed annually" : "Billed monthly";

  return (
    <div>
      <h1 className="mb-2 text-2xl font-extrabold tracking-tight text-slate-900">Subscription & Billing</h1>
      <p className="mb-8 text-slate-500">Your current plan and billing status.</p>

      {scheduledSubscription && (
        <div className="mb-8 flex items-start gap-4 rounded-2xl border border-amber-200 bg-amber-50 px-6 py-5">
          <span className="material-symbols-outlined mt-0.5 shrink-0 text-amber-500">schedule</span>
          <div>
            <p className="text-sm font-bold text-amber-800">Downgrade Scheduled</p>
            <p className="mt-1 text-sm leading-relaxed text-amber-700">
              Your <span className="font-bold capitalize">{scheduledSubscription.plan}</span> plan will be activated on{" "}
              <span className="font-bold">
                {new Date(scheduledSubscription.started_at).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}
              </span>
              . Until then, you can continue enjoying your current{" "}
              <span className="font-bold capitalize">{subscription?.plan ?? "current"}</span> plan.
            </p>
          </div>
        </div>
      )}

      {user!.bypass_subscription ? (
        <div className="rounded-[2rem] border border-orange-100 bg-white p-8 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <span className="material-symbols-outlined text-2xl">workspace_premium</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Promotional Access</h3>
              <p className="text-sm text-slate-500">You have complimentary full access to BuzzinBeats.</p>
            </div>
          </div>
        </div>
      ) : subscription && plan ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Active Plan Card */}
          <div className="relative overflow-hidden rounded-[2.5rem] border border-orange-100 bg-white p-8 shadow-sm lg:col-span-7">
            <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />

            <div className="mb-8 flex items-start justify-between">
              <div>
                <div className="mb-2 flex items-center gap-3">
                  <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold tracking-wider text-primary">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    ACTIVE
                  </span>
                  <span className="text-sm font-medium text-slate-500">{plan.name} Plan</span>
                </div>
                <h2 className="text-3xl font-black tracking-tight text-slate-900">{plan.name} Plan</h2>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-2xl font-black text-primary">
                  ₹{subscription.billing_cycle === "yearly" ? plan.yearly : plan.monthly}
                </p>
                <p className="text-sm text-slate-500">{subscription.billing_cycle === "yearly" ? "per year" : "per month"}</p>
              </div>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-400">Billing Cycle</p>
                <p className="font-semibold text-slate-800">{renewLabel}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-400">Days Remaining</p>
                <p className="font-semibold text-primary">
                  {daysLeft} {daysLeft === 1 ? "day" : "days"}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-orange-50 py-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-slate-400">calendar_today</span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Started On</p>
                  <p className="text-sm font-semibold text-slate-800">
                    {subscription.started_at
                      ? new Date(subscription.started_at).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
                      : "—"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-right">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    {subscription.cancelled_at ? "Plan Ends" : "Next Renewal"}
                  </p>
                  <p className={`text-sm font-semibold ${subscription.cancelled_at ? "text-red-500" : "text-slate-800"}`}>
                    {subscription.expires_at
                      ? new Date(subscription.expires_at).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
                      : "—"}
                  </p>
                </div>
                <span className="material-symbols-outlined text-slate-400">event_repeat</span>
              </div>
            </div>

            <div className="mt-8">
              <a
                href="#change-plan"
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-primary to-orange-500 px-10 py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-primary/20 transition-all hover:shadow-primary/30 active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-xl">upgrade</span>
                Change Plan
              </a>
            </div>
          </div>

          {/* Resource Usage Card */}
          <div className="rounded-[2rem] border border-orange-100 bg-white p-8 shadow-sm lg:col-span-5">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Resource Usage</h3>
              <span className="material-symbols-outlined text-primary">analytics</span>
            </div>

            <div className="mb-2">
              <div className="mb-3 flex items-end justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Page Quota</p>
                  <p className={`text-2xl font-black ${usagePct >= 100 ? "text-red-500" : "text-primary"}`}>
                    {usedPages}
                    <span className="text-lg font-medium text-slate-400"> / {pageLimit} pages</span>
                  </p>
                </div>
                {usagePct >= 100 ? (
                  <span className="rounded-md border border-red-100 bg-red-50 px-2 py-1 text-[10px] font-bold tracking-tighter text-red-500">
                    OVER LIMIT
                  </span>
                ) : usagePct >= 80 ? (
                  <span className="rounded-md border border-orange-100 bg-orange-50 px-2 py-1 text-[10px] font-bold tracking-tighter text-primary">
                    {usagePct}%
                  </span>
                ) : null}
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${
                    usagePct >= 100 ? "bg-red-500" : usagePct >= 80 ? "bg-orange-400" : "bg-primary"
                  }`}
                  style={{ width: `${Math.min(100, usagePct)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-[2rem] border border-orange-100 bg-white p-8 text-center shadow-sm">
          <p className="mb-4 font-bold text-primary">No Active Plan</p>
          <p className="text-sm text-slate-500">Contact support to set up a subscription.</p>
        </div>
      )}

      {!user!.bypass_subscription && (
        <div id="change-plan" className="mt-8 scroll-mt-8">
          <h2 className="mb-4 text-lg font-bold text-slate-800">Change plan</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {Object.entries(PLAN_CONFIG).map(([slug, p]) => (
              <a
                key={slug}
                href={`/profile/subscription/checkout?plan=${slug}&cycle=monthly`}
                className={`rounded-2xl border p-6 transition-all hover:border-primary/40 ${
                  subscription?.plan === slug ? "border-primary bg-primary/5" : "border-slate-200 bg-white"
                }`}
              >
                <h3 className="font-bold text-slate-900">{p.name}</h3>
                <p className="mt-1 text-2xl font-black text-primary">
                  ₹{p.monthly}
                  <span className="text-xs font-medium text-slate-400"> /mo</span>
                </p>
                <p className="mt-2 text-xs text-slate-500">Up to {p.pages} pages</p>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
