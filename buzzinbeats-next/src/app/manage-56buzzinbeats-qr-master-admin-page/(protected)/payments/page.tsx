import Link from "next/link";
import { requireAdmin } from "@/lib/data/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { getGatewayConfig } from "@/lib/payment-gateway";
import RazorpayGatewayPanel from "@/components/admin/RazorpayGatewayPanel";

const STATUS_STYLES: Record<string, string> = {
  paid: "bg-green-100 text-green-700",
  refunded: "bg-blue-100 text-blue-700",
  failed: "bg-red-100 text-red-700",
};
const PAGE_SIZE = 10;

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; status?: string; plan?: string; method?: string; days?: string }>;
}) {
  await requireAdmin();
  const supabase = createAdminClient();
  const sp = await searchParams;

  const page = Math.max(1, Number(sp.page) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const now = new Date();

  let query = supabase
    .from("payments")
    .select("id, invoice_number, transaction_id, razorpay_payment_id, amount, currency, status, payment_method, paid_at, created_at, user_id, users(name, email), subscriptions(plan)", {
      count: "exact",
    });

  if (sp.search) {
    const { data: matchingUsers } = await supabase.from("users").select("id").or(`name.ilike.%${sp.search}%,email.ilike.%${sp.search}%`);
    const userIds = (matchingUsers ?? []).map((u) => u.id);
    const userClause = userIds.length ? `,user_id.in.(${userIds.join(",")})` : "";
    query = query.or(
      `invoice_number.ilike.%${sp.search}%,transaction_id.ilike.%${sp.search}%,razorpay_payment_id.ilike.%${sp.search}%${userClause}`
    );
  }
  if (sp.status && sp.status !== "all") query = query.eq("status", sp.status);
  if (sp.method && sp.method !== "all") query = query.eq("payment_method", sp.method);
  if (sp.days) {
    const since = new Date(now.getTime() - Number(sp.days) * 86400000);
    query = query.gte("created_at", since.toISOString());
  }

  if (sp.plan && sp.plan !== "all") {
    const { data: subs } = await supabase.from("subscriptions").select("id").eq("plan", sp.plan);
    const subIds = (subs ?? []).map((s) => s.id);
    query = subIds.length ? query.in("subscription_id", subIds) : query.eq("subscription_id", -1);
  }

  const { data: payments, count: total } = await query.order("created_at", { ascending: false }).range(from, to);
  const totalPages = Math.max(1, Math.ceil((total ?? 0) / PAGE_SIZE));

  const todayStart = startOfDay(now).toISOString();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [{ data: todayPaid }, { data: monthPaid }, { count: failedCount }, { count: activeSubs }] = await Promise.all([
    supabase.from("payments").select("amount").eq("status", "paid").gte("paid_at", todayStart),
    supabase.from("payments").select("amount").eq("status", "paid").gte("paid_at", monthStart),
    supabase.from("payments").select("id", { count: "exact", head: true }).eq("status", "failed").gte("created_at", monthStart),
    supabase.from("subscriptions").select("id", { count: "exact", head: true }).eq("status", "active").gt("expires_at", now.toISOString()),
  ]);

  const todayRevenue = (todayPaid ?? []).reduce((s, p) => s + Number(p.amount), 0);
  const monthlyRevenue = (monthPaid ?? []).reduce((s, p) => s + Number(p.amount), 0);

  const revenueByDay: { day: string; amount: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 86400000);
    const dayStart = startOfDay(date).toISOString();
    const dayEnd = new Date(startOfDay(date).getTime() + 86400000).toISOString();
    const { data: dayPaid } = await supabase.from("payments").select("amount").eq("status", "paid").gte("paid_at", dayStart).lt("paid_at", dayEnd);
    revenueByDay.push({ day: date.toLocaleDateString("en-US", { weekday: "short" }), amount: (dayPaid ?? []).reduce((s, p) => s + Number(p.amount), 0) });
  }
  const maxDayRevenue = Math.max(...revenueByDay.map((d) => d.amount), 1);

  const [config, { data: gwPayments }, { data: subscriptions }, { data: attemptLogs }] = await Promise.all([
    getGatewayConfig(),
    supabase
      .from("payments")
      .select("id, invoice_number, amount, currency, status, payment_method, razorpay_order_id, razorpay_payment_id, created_at, user_id, users(name, email), subscriptions(plan)")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase.from("subscriptions").select("id, status, plan, started_at, user_id, users(name, email)"),
    supabase
      .from("payment_attempt_logs")
      .select("id, user_id, plan_key, stage, status, error_code, error_message, created_at, users(name, email)")
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const hasFilters = !!(sp.search || sp.status || sp.plan || sp.method || sp.days);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Payments</h1>
        <p className="text-sm text-slate-500">Monitor revenue, transactions, and subscriber activity.</p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="material-symbols-outlined mb-2 block text-primary">account_balance_wallet</span>
          <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">Today Revenue</p>
          <p className="text-2xl font-black text-slate-900">₹{todayRevenue.toFixed(2)}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="material-symbols-outlined mb-2 block text-primary">payments</span>
          <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">Monthly Revenue</p>
          <p className="text-2xl font-black text-slate-900">₹{monthlyRevenue.toFixed(2)}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="material-symbols-outlined mb-2 block text-red-500">error</span>
          <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">Failed Payments</p>
          <p className="text-2xl font-black text-slate-900">{failedCount ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="material-symbols-outlined mb-2 block text-primary">group_add</span>
          <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">Active Subscribers</p>
          <p className="text-2xl font-black text-slate-900">{activeSubs ?? 0}</p>
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-bold text-slate-700">Revenue Last 7 Days</h3>
        <div className="flex h-32 items-end gap-3">
          {revenueByDay.map((d, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1">
              <div className="flex w-full flex-1 items-end">
                <div className="w-full rounded-t bg-primary/80" style={{ height: `${Math.max(4, (d.amount / maxDayRevenue) * 100)}%` }} />
              </div>
              <span className="text-[10px] text-slate-400">{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      <form method="GET" className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <input type="text" name="search" defaultValue={sp.search ?? ""} placeholder="Search invoice, txn ID, name, email…" className="min-w-[200px] flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        <select name="status" defaultValue={sp.status ?? "all"} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
          <option value="all">Status: All</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
        <select name="plan" defaultValue={sp.plan ?? "all"} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
          <option value="all">Plan: All</option>
          <option value="starter">Starter</option>
          <option value="growth">Growth</option>
          <option value="pro">Pro</option>
        </select>
        <select name="method" defaultValue={sp.method ?? "all"} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
          <option value="all">Method: All</option>
          <option value="razorpay">Razorpay</option>
          <option value="stripe">Stripe</option>
          <option value="manual">Manual</option>
        </select>
        <select name="days" defaultValue={sp.days ?? ""} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
          <option value="">All Time</option>
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
          <option value="90">Last 90 Days</option>
        </select>
        <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary/90">
          Filter
        </button>
        {hasFilters && (
          <Link href="/manage-56buzzinbeats-qr-master-admin-page/payments" className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200">
            Clear
          </Link>
        )}
      </form>

      <div className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Transaction ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(payments ?? []).map((p) => {
                const owner = p.users as unknown as { name: string; email: string } | null;
                const sub = p.subscriptions as unknown as { plan: string } | null;
                return (
                  <tr key={p.id}>
                    <td className="px-4 py-3 text-slate-500">{new Date(p.paid_at ?? p.created_at).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-800">{owner?.name}</div>
                      <div className="text-xs text-slate-400">{owner?.email}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-500 capitalize">{sub?.plan ?? "—"}</td>
                    <td className="px-4 py-3 font-bold text-slate-800">₹{Number(p.amount).toFixed(2)}</td>
                    <td className="px-4 py-3 text-slate-500 capitalize">{p.payment_method}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS_STYLES[p.status] ?? "bg-slate-100 text-slate-500"}`}>{p.status}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{p.razorpay_payment_id ?? p.transaction_id ?? "—"}</td>
                  </tr>
                );
              })}
              {(!payments || payments.length === 0) && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No payments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 p-4 text-sm text-slate-500">
            <span>
              Showing {from + 1}–{Math.min((total ?? 0), to + 1)} of {total} results
            </span>
            <div className="flex gap-2">
              {page > 1 && (
                <a href={`?page=${page - 1}`} className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-600 hover:bg-slate-50">
                  Previous
                </a>
              )}
              {page < totalPages && (
                <a href={`?page=${page + 1}`} className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-600 hover:bg-slate-50">
                  Next
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      <div id="gateway-settings">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
          <span className="material-symbols-outlined text-primary">account_balance</span>
          Payment Gateway
        </h2>
        <RazorpayGatewayPanel config={config} payments={gwPayments ?? []} subscriptions={subscriptions ?? []} attemptLogs={attemptLogs ?? []} />
      </div>
    </div>
  );
}
