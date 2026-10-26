import { requireAdmin } from "@/lib/data/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import CouponForm from "./CouponForm";
import CouponRowActions from "./CouponRowActions";

const BASE = "/manage-56buzzinbeats-qr-master-admin-page/coupons";
const PAGE_SIZE = 15;

const AUDIENCE_LABELS: Record<string, string> = {
  all: "All users",
  new_users: "New users",
  existing_users: "Existing",
  specific_user: "Specific user",
};

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function daysUntil(iso: string) {
  return Math.round((new Date(iso).getTime() - Date.now()) / 86400000);
}

function isPast(iso: string) {
  return new Date(iso).getTime() < Date.now();
}

export default async function AdminCouponsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; status?: string; type?: string; plan?: string; edit?: string }>;
}) {
  await requireAdmin();
  const supabase = createAdminClient();
  const sp = await searchParams;

  const page = Math.max(1, Number(sp.page) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase.from("coupons").select("*", { count: "exact" });
  if (sp.search) query = query.or(`code.ilike.%${sp.search}%,title.ilike.%${sp.search}%`);
  if (sp.status) query = query.eq("status", sp.status);
  if (sp.type) query = query.eq("discount_type", sp.type);
  if (sp.plan) query = query.eq("applies_to_plan", sp.plan);

  const [{ data: coupons, count: total }, { count: activeCount }, { count: redemptionCount }, { data: discountRows }] = await Promise.all([
    query.order("created_at", { ascending: false }).range(from, to),
    supabase.from("coupons").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("coupon_redemptions").select("id", { count: "exact", head: true }),
    supabase.from("coupon_redemptions").select("discount_amount"),
  ]);

  const totalDiscount = (discountRows ?? []).reduce((sum, r) => sum + Number(r.discount_amount ?? 0), 0);

  const now = new Date();
  const weekFromNow = new Date(now.getTime() + 7 * 86400000).toISOString();
  const { count: expiringSoon } = await supabase
    .from("coupons")
    .select("id", { count: "exact", head: true })
    .eq("status", "active")
    .not("ends_at", "is", null)
    .lte("ends_at", weekFromNow)
    .gt("ends_at", now.toISOString());

  const totalPages = Math.max(1, Math.ceil((total ?? 0) / PAGE_SIZE));

  let editingCoupon = null;
  if (sp.edit) {
    const { data } = await supabase.from("coupons").select("*").eq("id", Number(sp.edit)).maybeSingle();
    editingCoupon = data;
  }

  const hasFilters = !!(sp.search || sp.status || sp.type || sp.plan);
  const qs = (overrides: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const merged = { search: sp.search, status: sp.status, type: sp.type, plan: sp.plan, ...overrides };
    for (const [k, v] of Object.entries(merged)) if (v) params.set(k, v);
    return params.toString();
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-6 md:p-10">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/30">
              <span className="material-symbols-outlined">confirmation_number</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900">Coupon Management</h1>
          </div>
          <p className="ml-[52px] text-sm font-medium text-zinc-500">Create, monitor, and manage promotional offers.</p>
        </div>
      </header>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { icon: "check_circle", label: "Active Coupons", value: (activeCount ?? 0).toLocaleString() },
          { icon: "group", label: "Total Redemptions", value: (redemptionCount ?? 0).toLocaleString() },
          { icon: "payments", label: "Discount Given", value: `₹${totalDiscount.toLocaleString()}` },
          { icon: "schedule", label: "Expiring Soon", value: String(expiringSoon ?? 0) },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-start justify-between">
              <div className="rounded-xl bg-orange-50 p-2.5 text-primary">
                <span className="material-symbols-outlined">{s.icon}</span>
              </div>
            </div>
            <p className="mb-1 text-xs font-semibold tracking-wider text-zinc-500 uppercase">{s.label}</p>
            <p className="text-3xl font-extrabold tracking-tight text-zinc-900">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-12">
        <div className="xl:col-span-4">
          <CouponForm coupon={editingCoupon} />
        </div>

        <div className="space-y-4 xl:col-span-8">
          <form method="GET" className="flex flex-wrap items-center gap-3 rounded-2xl border border-zinc-100 bg-white p-3 shadow-sm">
            <div className="relative min-w-[160px] flex-1">
              <span className="material-symbols-outlined absolute top-1/2 left-3 -translate-y-1/2 text-lg text-zinc-400">search</span>
              <input
                type="text"
                name="search"
                defaultValue={sp.search ?? ""}
                placeholder="Search coupons..."
                className="w-full rounded-xl border-none bg-zinc-50 py-2.5 pr-4 pl-10 text-sm font-medium placeholder:text-zinc-400 focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <select name="status" defaultValue={sp.status ?? ""} className="rounded-xl border-none bg-zinc-50 px-3 py-2.5 text-sm font-medium text-zinc-700 focus:ring-2 focus:ring-primary/20">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="disabled">Disabled</option>
              <option value="scheduled">Scheduled</option>
              <option value="expired">Expired</option>
            </select>
            <select name="type" defaultValue={sp.type ?? ""} className="rounded-xl border-none bg-zinc-50 px-3 py-2.5 text-sm font-medium text-zinc-700 focus:ring-2 focus:ring-primary/20">
              <option value="">All Types</option>
              <option value="flat">Fixed Amount</option>
              <option value="percent">Percentage</option>
            </select>
            <select name="plan" defaultValue={sp.plan ?? ""} className="rounded-xl border-none bg-zinc-50 px-3 py-2.5 text-sm font-medium text-zinc-700 focus:ring-2 focus:ring-primary/20">
              <option value="">All Plans</option>
              <option value="all">All Plans</option>
              <option value="starter">Starter</option>
              <option value="growth">Growth</option>
              <option value="pro">Pro</option>
            </select>
            <button type="submit" className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-primary/90">
              Filter
            </button>
            {hasFilters && (
              <a href={BASE} className="rounded-xl bg-zinc-100 px-4 py-2.5 text-sm font-bold text-zinc-600 transition-all hover:bg-zinc-200">
                Clear
              </a>
            )}
          </form>

          <div className="overflow-hidden rounded-[2rem] border border-zinc-100 bg-white shadow-xl shadow-zinc-200/50">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-zinc-50/80">
                    <th className="px-5 py-4 text-[10px] font-bold tracking-widest text-zinc-400 uppercase">Coupon</th>
                    <th className="hidden px-5 py-4 text-[10px] font-bold tracking-widest text-zinc-400 uppercase md:table-cell">Target</th>
                    <th className="px-5 py-4 text-[10px] font-bold tracking-widest text-zinc-400 uppercase">Usage</th>
                    <th className="hidden px-5 py-4 text-[10px] font-bold tracking-widest text-zinc-400 uppercase lg:table-cell">Validity</th>
                    <th className="px-5 py-4 text-[10px] font-bold tracking-widest text-zinc-400 uppercase">Status</th>
                    <th className="px-5 py-4 text-right text-[10px] font-bold tracking-widest text-zinc-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {(coupons ?? []).map((c) => {
                    const isExpired = c.status === "expired" || (c.ends_at !== null && isPast(c.ends_at));
                    const usagePct = c.usage_limit ? Math.min(100, Math.round((c.used_count / c.usage_limit) * 100)) : null;
                    const daysToEnd = c.ends_at ? daysUntil(c.ends_at) : null;
                    return (
                      <tr key={c.id} className="group transition-colors hover:bg-zinc-50/60">
                        <td className="px-5 py-4">
                          <div className="flex flex-col gap-1">
                            <span
                              className={`w-fit rounded-lg border px-3 py-1 text-sm font-bold ${
                                isExpired
                                  ? "border-zinc-100 bg-zinc-50 text-zinc-400 line-through"
                                  : c.status === "active"
                                    ? "border-orange-100 bg-orange-50 text-orange-700"
                                    : "border-zinc-200 bg-zinc-100 text-zinc-600"
                              }`}
                            >
                              {c.code}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className={`text-sm font-bold ${isExpired ? "text-zinc-400" : "text-zinc-900"}`}>
                                {c.discount_type === "percent" ? `${c.discount_value}%` : `₹${c.discount_value}`}
                              </span>
                              <span className={`text-[10px] ${isExpired ? "text-zinc-300" : "text-zinc-400"}`}>
                                • {c.discount_type === "percent" ? "Percentage" : "Fixed"}
                              </span>
                            </div>
                            {c.title && <span className="text-[10px] font-medium text-zinc-400">{c.title}</span>}
                          </div>
                        </td>
                        <td className="hidden px-5 py-4 md:table-cell">
                          <div className="flex flex-col gap-1">
                            <span className="w-fit rounded-lg bg-zinc-100 px-2 py-1 text-xs font-semibold text-zinc-600">
                              {c.applies_to_plan === "all" ? "All Plans" : c.applies_to_plan.charAt(0).toUpperCase() + c.applies_to_plan.slice(1)}
                            </span>
                            <span className="text-[10px] text-zinc-400">{AUDIENCE_LABELS[c.audience_type] ?? c.audience_type}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="w-full max-w-[110px]">
                            <div className="mb-1 flex justify-between text-[10px] font-bold text-zinc-500">
                              <span>
                                {c.used_count}
                                {c.usage_limit ? `/${c.usage_limit}` : ""}
                              </span>
                              <span>{usagePct !== null ? `${usagePct}%` : "∞"}</span>
                            </div>
                            {usagePct !== null && (
                              <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
                                <div className={`h-full rounded-full ${isExpired ? "bg-zinc-300" : "bg-primary"}`} style={{ width: `${usagePct}%` }} />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="hidden px-5 py-4 lg:table-cell">
                          <div className="space-y-0.5 text-xs text-zinc-500">
                            {c.starts_at && <div>From: {fmtDate(c.starts_at)}</div>}
                            {c.ends_at ? (
                              <div className={daysToEnd !== null && daysToEnd <= 7 && !isExpired ? "font-bold text-red-500" : ""}>To: {fmtDate(c.ends_at)}</div>
                            ) : (
                              <div className="text-zinc-300">No expiry</div>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          {isExpired ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-bold text-red-600">
                              <span className="h-1 w-1 rounded-full bg-red-500" /> Expired
                            </span>
                          ) : c.status === "active" ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                              <span className="h-1 w-1 rounded-full bg-emerald-500" /> Active
                            </span>
                          ) : c.status === "scheduled" ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1 text-[10px] font-bold text-zinc-600">
                              <span className="h-1 w-1 rounded-full bg-zinc-400" /> Scheduled
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-50 px-2.5 py-1 text-[10px] font-bold text-yellow-700">
                              <span className="h-1 w-1 rounded-full bg-yellow-500" /> Disabled
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <CouponRowActions id={c.id} code={c.code} status={c.status} />
                        </td>
                      </tr>
                    );
                  })}
                  {(!coupons || coupons.length === 0) && (
                    <tr>
                      <td colSpan={6} className="px-5 py-16 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <span className="material-symbols-outlined text-5xl text-zinc-200">confirmation_number</span>
                          <p className="font-semibold text-zinc-400">No coupons found</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-zinc-100 bg-zinc-50/50 px-5 py-4">
                <p className="text-[11px] font-bold tracking-widest text-zinc-500 uppercase">
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  {page > 1 ? (
                    <a href={`${BASE}?${qs({ page: String(page - 1) })}`} className="rounded-lg border border-zinc-200 bg-white p-2 text-zinc-400 transition-all hover:border-primary/30 hover:text-primary">
                      <span className="material-symbols-outlined">chevron_left</span>
                    </a>
                  ) : (
                    <span className="cursor-not-allowed rounded-lg border border-zinc-200 bg-white p-2 text-zinc-300">
                      <span className="material-symbols-outlined">chevron_left</span>
                    </span>
                  )}
                  {page < totalPages ? (
                    <a href={`${BASE}?${qs({ page: String(page + 1) })}`} className="rounded-lg border border-zinc-200 bg-white p-2 text-zinc-400 transition-all hover:border-primary/30 hover:text-primary">
                      <span className="material-symbols-outlined">chevron_right</span>
                    </a>
                  ) : (
                    <span className="cursor-not-allowed rounded-lg border border-zinc-200 bg-white p-2 text-zinc-300">
                      <span className="material-symbols-outlined">chevron_right</span>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
