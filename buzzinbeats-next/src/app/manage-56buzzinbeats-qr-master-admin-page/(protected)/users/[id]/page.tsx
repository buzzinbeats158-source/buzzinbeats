import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/data/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPlanConfig, planName, planPageLimit } from "@/lib/data/subscription-plans";
import { publicStorageUrl } from "@/lib/storage";
import {
  toggleBypassSubscriptionAction,
  scheduleUserDeletionAction,
  cancelUserDeletionAction,
  deleteUserAction,
} from "@/lib/data/admin-actions";

const BASE = "/manage-56buzzinbeats-qr-master-admin-page/users";

function fmtDate(d: string | null) {
  return d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : "—";
}

function expiryLabel(expiresAt: string | null) {
  if (!expiresAt) return { label: "—", urgent: false };
  const hours = Math.round((new Date(expiresAt).getTime() - Date.now()) / 3600000);
  const days = Math.round(hours / 24);
  if (hours <= 0) return { label: "Expired", urgent: true };
  if (hours <= 24) return { label: `${hours} hours left`, urgent: true };
  if (days <= 3) return { label: `${days} days left`, urgent: true };
  return { label: fmtDate(expiresAt), urgent: false };
}

function monthsSince(dateStr: string) {
  return Math.max(0, Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24 * 30)));
}

function daysUntil(dateStr: string) {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
}

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const userId = Number(id);
  const supabase = createAdminClient();

  const [{ data: user }, { count: pageCountRaw }, { count: ticketsCountRaw }, { data: allSubs }, planConfig] = await Promise.all([
    supabase.from("users").select("*").eq("id", userId).maybeSingle(),
    supabase.from("pages").select("id", { count: "exact", head: true }).eq("user_id", userId).is("deleted_at", null),
    supabase.from("support_tickets").select("id", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("subscriptions").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
    getPlanConfig(),
  ]);

  if (!user) notFound();

  const pageCount = pageCountRaw ?? 0;
  const ticketsCount = ticketsCountRaw ?? 0;

  const subs = allSubs ?? [];
  const subscription = subs.find((s) => s.status === "active") ?? null;

  const { data: payments } = await supabase
    .from("payments")
    .select("*, subscriptions(plan)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  const pageLimit = subscription ? planPageLimit(planConfig, subscription.plan) : 0;
  const usagePct = pageLimit > 0 ? Math.min(100, Math.round((pageCount / pageLimit) * 100)) : 0;
  const memberMonths = monthsSince(user.created_at);

  const deletionDaysLeft = user.scheduled_deletion_at ? daysUntil(user.scheduled_deletion_at) : null;

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link href={BASE} className="flex items-center gap-1 text-sm font-medium text-slate-500 transition-colors hover:text-primary">
          <span className="material-symbols-outlined text-base">arrow_back</span> Users
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-sm font-semibold text-slate-700">{user.name}</span>
      </div>

      {user.scheduled_deletion_at && (
        <div className="mb-6 flex items-start gap-4 rounded-2xl border border-red-200 bg-red-50 px-6 py-4">
          <span className="material-symbols-outlined mt-0.5 shrink-0 text-red-500">warning</span>
          <div className="flex-1">
            <p className="font-bold text-red-800">Account Scheduled for Deletion</p>
            <p className="mt-0.5 text-sm text-red-600">
              {deletionDaysLeft !== null && deletionDaysLeft <= 0
                ? "Deletion overdue — will be processed on next scheduler run."
                : `Deleting in ${deletionDaysLeft} day${deletionDaysLeft === 1 ? "" : "s"} on ${fmtDate(user.scheduled_deletion_at)}`}
              {" • "}10d email sent: {user.deletion_notified_10d_at ? "✅" : "—"}
              {" • "}5d email sent: {user.deletion_notified_5d_at ? "✅" : "—"}
              {" • "}24h email sent: {user.deletion_notified_1d_at ? "✅" : "—"}
            </p>
          </div>
          <form
            action={async () => {
              "use server";
              await cancelUserDeletionAction(userId);
            }}
          >
            <button type="submit" className="shrink-0 rounded-lg border border-red-300 px-3 py-1.5 text-xs font-bold text-red-600 transition-colors hover:bg-red-100">
              Cancel Deletion
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
        <div className="flex flex-col gap-6 xl:col-span-1">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex flex-col items-center gap-3 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
                {user.profile_photo_path ? (
                  <img src={publicStorageUrl(user.profile_photo_path) ?? undefined} className="h-16 w-16 rounded-full object-cover" alt="" />
                ) : (
                  <span className="material-symbols-outlined text-3xl text-primary">person</span>
                )}
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900">{user.name}</p>
                <p className="text-sm text-slate-500">{user.email}</p>
                {user.phone && (
                  <p className="mt-1 text-xs text-slate-400">
                    {user.phone_code} {user.phone}
                  </p>
                )}
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${user.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-slate-100 text-slate-600"}`}>
                {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "User"}
              </span>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="font-medium text-slate-400">User ID</span>
                <span className="font-bold text-slate-700">#{user.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-slate-400">Joined</span>
                <span className="font-bold text-slate-700">{fmtDate(user.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-slate-400">Member for</span>
                <span className="font-bold text-slate-700">{memberMonths} month{memberMonths === 1 ? "" : "s"}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-slate-400">Pages</span>
                <span className="font-bold text-slate-700">{pageCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-slate-400">Support Tickets</span>
                <span className="font-bold text-slate-700">{ticketsCount}</span>
              </div>
              {user.business_title && (
                <div className="flex justify-between">
                  <span className="font-medium text-slate-400">Business</span>
                  <span className="max-w-[150px] truncate text-right font-bold text-slate-700">{user.business_title}</span>
                </div>
              )}
              {user.category && (
                <div className="flex justify-between">
                  <span className="font-medium text-slate-400">Category</span>
                  <span className="font-bold text-slate-700">{user.category}</span>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="mb-4 text-xs font-black tracking-widest text-slate-400 uppercase">Quick Actions</p>
            <Link
              href={`${BASE}/${user.id}/tickets`}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition-all hover:bg-orange-50 hover:text-primary"
            >
              <span className="material-symbols-outlined text-base">confirmation_number</span>
              View Support Tickets
              {ticketsCount > 0 && <span className="ml-auto rounded-full bg-orange-100 px-2 py-0.5 text-xs font-black text-orange-700">{ticketsCount}</span>}
            </Link>

            {user.role !== "admin" && (
              <div className="mt-4 border-t border-gray-100 pt-4">
                <p className="mb-3 text-xs font-black tracking-widest text-slate-400 uppercase">Subscription Override</p>
                <form
                  action={async () => {
                    "use server";
                    await toggleBypassSubscriptionAction(userId, user.bypass_subscription ?? false);
                  }}
                >
                  <button
                    type="submit"
                    className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-sm font-bold transition-all ${
                      user.bypass_subscription
                        ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                        : "border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">{user.bypass_subscription ? "toggle_on" : "toggle_off"}</span>
                    <span className="flex-1 text-left">Bypass Subscription</span>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-black ${user.bypass_subscription ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-400"}`}>
                      {user.bypass_subscription ? "ENABLED" : "DISABLED"}
                    </span>
                  </button>
                </form>
                {user.bypass_subscription && (
                  <p className="mt-2 px-1 text-xs font-medium text-green-600">This user can access all features without an active subscription.</p>
                )}
              </div>
            )}
          </div>

          {user.role !== "admin" && (
            <div className="rounded-2xl border border-red-100 bg-white p-6 shadow-sm">
              <p className="mb-4 text-xs font-black tracking-widest text-red-400 uppercase">Danger Zone</p>
              <div className="flex flex-col gap-3">
                {!user.scheduled_deletion_at ? (
                  <form
                    action={async () => {
                      "use server";
                      await scheduleUserDeletionAction(userId);
                    }}
                  >
                    <button
                      type="submit"
                      className="flex w-full items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-2.5 text-sm font-bold text-orange-600 transition-all hover:bg-orange-100"
                    >
                      <span className="material-symbols-outlined text-base">schedule_send</span>
                      Schedule Deletion (10-day warning)
                    </button>
                  </form>
                ) : (
                  <form
                    action={async () => {
                      "use server";
                      await cancelUserDeletionAction(userId);
                    }}
                  >
                    <button
                      type="submit"
                      className="flex w-full items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 text-sm font-bold text-green-600 transition-all hover:bg-green-100"
                    >
                      <span className="material-symbols-outlined text-base">cancel_schedule_send</span>
                      Cancel Scheduled Deletion
                    </button>
                  </form>
                )}

                <form
                  action={async () => {
                    "use server";
                    await deleteUserAction(userId);
                  }}
                >
                  <button
                    type="submit"
                    className="flex w-full items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-600 transition-all hover:bg-red-100"
                  >
                    <span className="material-symbols-outlined text-base">delete_forever</span>
                    Delete Immediately
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6 xl:col-span-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">workspace_premium</span>
              <h3 className="font-bold text-slate-900">Subscription Status</h3>
            </div>
            {subscription ? (
              <>
                <div className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="mb-1 text-xs font-bold tracking-wider text-slate-400 uppercase">Plan</p>
                    <p className="font-black text-slate-900">{planName(planConfig, subscription.plan)}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="mb-1 text-xs font-bold tracking-wider text-slate-400 uppercase">Billing</p>
                    <p className="font-black text-slate-900 capitalize">{subscription.billing_cycle}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="mb-1 text-xs font-bold tracking-wider text-slate-400 uppercase">Status</p>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-black ${subscription.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                      {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                    </span>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="mb-1 text-xs font-bold tracking-wider text-slate-400 uppercase">Expires</p>
                    <p className={`font-black text-slate-900 ${expiryLabel(subscription.expires_at).urgent ? "text-red-500" : ""}`}>
                      {expiryLabel(subscription.expires_at).label}
                    </p>
                  </div>
                </div>
                <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <div>
                    <p className="mb-1 text-xs font-bold tracking-wider text-slate-400 uppercase">Started</p>
                    <p className="text-sm font-semibold text-slate-700">{fmtDate(subscription.started_at)}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-bold tracking-wider text-slate-400 uppercase">Price Paid</p>
                    <p className="text-sm font-semibold text-slate-700">₹{Number(subscription.price).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-bold tracking-wider text-slate-400 uppercase">Page Usage</p>
                    <p className="text-sm font-semibold text-slate-700">
                      {pageCount} / {pageLimit} pages ({usagePct}%)
                    </p>
                  </div>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className="h-2.5 rounded-full bg-primary" style={{ width: `${usagePct}%` }} />
                </div>
                {subscription.cancelled_at && <p className="mt-2 text-xs font-semibold text-red-500">Cancelled on {fmtDate(subscription.cancelled_at)}</p>}
              </>
            ) : (
              <div className="flex items-center justify-center gap-3 py-6 text-center">
                <span className="material-symbols-outlined text-3xl text-slate-300">workspace_off</span>
                <p className="font-medium text-slate-400">No active subscription</p>
              </div>
            )}
          </div>

          {subs.length > 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">history</span>
                <h3 className="font-bold text-slate-900">Subscription History</h3>
              </div>
              <div className="space-y-3">
                {subs.map((sub) => (
                  <div key={sub.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4">
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {planName(planConfig, sub.plan)} — {sub.billing_cycle.charAt(0).toUpperCase() + sub.billing_cycle.slice(1)}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {fmtDate(sub.started_at)} → {fmtDate(sub.expires_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-black ${sub.status === "active" ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-500"}`}>
                        {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                      </span>
                      <p className="mt-1 text-xs text-slate-400">₹{Number(sub.price).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-gray-100 px-6 py-4">
              <span className="material-symbols-outlined text-primary">receipt_long</span>
              <h3 className="font-bold text-slate-900">Payment History</h3>
            </div>
            {!payments || payments.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <span className="material-symbols-outlined mb-2 block text-4xl text-slate-200">payments</span>
                <p className="text-sm font-medium text-slate-400">No payments on record.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500 uppercase">
                    <tr>
                      <th className="px-6 py-3 font-medium">Invoice</th>
                      <th className="px-6 py-3 font-medium">Date</th>
                      <th className="px-6 py-3 font-medium">Plan</th>
                      <th className="px-6 py-3 font-medium">Amount</th>
                      <th className="px-6 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {payments.map((p) => (
                      <tr key={p.id} className="transition-colors hover:bg-gray-50">
                        <td className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">{p.invoice_number}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{fmtDate(p.paid_at ?? p.created_at)}</td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-700 capitalize">{p.subscriptions?.plan ?? "—"}</td>
                        <td className="px-6 py-4 font-black text-slate-900">₹{Number(p.amount).toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                              p.status === "paid" || p.status === "completed"
                                ? "bg-green-100 text-green-700"
                                : p.status === "refunded"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-red-100 text-red-600"
                            }`}
                          >
                            {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
