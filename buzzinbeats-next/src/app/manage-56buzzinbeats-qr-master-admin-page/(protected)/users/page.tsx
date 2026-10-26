import Link from "next/link";
import { requireAdmin } from "@/lib/data/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPlanConfig, planName } from "@/lib/data/subscription-plans";

const BASE = "/manage-56buzzinbeats-qr-master-admin-page/users";

const PAGE_SIZE = 100;

function subscriptionCountdown(expiresAt: string | null) {
  if (!expiresAt) return { label: "—", className: "text-slate-300" };
  const now = Date.now();
  const expires = new Date(expiresAt).getTime();
  const hoursLeft = Math.round((expires - now) / (1000 * 60 * 60));
  const daysLeft = Math.round((expires - now) / (1000 * 60 * 60 * 24));

  if (hoursLeft <= 0) return { label: "Expired", className: "font-black text-red-500" };
  if (hoursLeft <= 24) return { label: `${hoursLeft}h left`, className: "font-black text-red-500" };
  if (daysLeft <= 3) return { label: `${daysLeft}d left`, className: "font-bold text-orange-500" };
  if (daysLeft <= 7) return { label: `${daysLeft} days left`, className: "font-bold text-yellow-600" };
  return { label: `${daysLeft} days left`, className: "font-semibold text-green-600" };
}

function daysUntilDeletion(scheduledAt: string) {
  return Math.max(0, Math.ceil((new Date(scheduledAt).getTime() - Date.now()) / 86400000));
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireAdmin();
  const supabase = createAdminClient();

  const page = Math.max(1, Number((await searchParams).page) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const [{ data: users, count: totalUsers }, { data: allPages }, { data: activeSubs }, { data: allTickets }, planConfig] = await Promise.all([
    supabase
      .from("users")
      .select("id, name, email, role, scheduled_deletion_at, created_at", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to),
    supabase.from("pages").select("user_id").is("deleted_at", null),
    supabase.from("subscriptions").select("user_id, plan, status, expires_at").eq("status", "active"),
    supabase.from("support_tickets").select("user_id"),
    getPlanConfig(),
  ]);

  const pagesCountByUser = new Map<number, number>();
  for (const p of allPages ?? []) {
    pagesCountByUser.set(p.user_id, (pagesCountByUser.get(p.user_id) ?? 0) + 1);
  }

  const subByUser = new Map<number, { plan: string; expires_at: string | null }>();
  for (const s of activeSubs ?? []) {
    subByUser.set(s.user_id, { plan: s.plan, expires_at: s.expires_at });
  }

  const ticketsCountByUser = new Map<number, number>();
  for (const t of allTickets ?? []) {
    ticketsCountByUser.set(t.user_id, (ticketsCountByUser.get(t.user_id) ?? 0) + 1);
  }

  const totalPages = Math.max(1, Math.ceil((totalUsers ?? 0) / PAGE_SIZE));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Users Management</h1>
        {typeof totalUsers === "number" && (
          <span className="text-xs font-semibold text-slate-400">{totalUsers.toLocaleString()} total</span>
        )}
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Join Date</th>
                <th className="px-4 py-3 text-center">Pages</th>
                <th className="px-4 py-3 text-center">Messages</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Subscription</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(users ?? []).map((u) => {
                const sub = subByUser.get(u.id);
                const countdown = subscriptionCountdown(sub?.expires_at ?? null);
                const pagesCount = pagesCountByUser.get(u.id) ?? 0;
                const ticketsCount = ticketsCountByUser.get(u.id) ?? 0;

                return (
                  <tr key={u.id} className={u.scheduled_deletion_at ? "bg-red-50/40" : ""}>
                    <td className="px-4 py-3 text-slate-500">#{u.id}</td>
                    <td className="px-4 py-3 font-bold text-slate-800">
                      <div className="flex items-center gap-2">
                        <span>{u.name}</span>
                        {u.scheduled_deletion_at && (
                          <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-black text-red-600 uppercase">
                            Del. in {daysUntilDeletion(u.scheduled_deletion_at)}d
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{u.email}</td>
                    <td className="px-4 py-3 text-slate-500">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="rounded bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">{pagesCount}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {ticketsCount > 0 ? (
                        <Link
                          href={`${BASE}/${u.id}/tickets`}
                          className="inline-flex items-center justify-center rounded bg-orange-100 px-2.5 py-0.5 text-xs font-bold text-orange-700 hover:bg-orange-200"
                        >
                          {ticketsCount}
                        </Link>
                      ) : (
                        <span className="text-xs font-semibold text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {u.role === "admin" ? (
                        <span className="rounded bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-800">Admin</span>
                      ) : sub ? (
                        <span className="rounded bg-orange-100 px-2.5 py-0.5 text-xs font-semibold capitalize text-orange-700">{planName(planConfig, sub.plan)}</span>
                      ) : (
                        <span className="rounded bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-500">No Plan</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs ${countdown.className}`}>{countdown.label}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`${BASE}/${u.id}`} className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                        <span className="material-symbols-outlined text-base">open_in_new</span>
                        Details
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 p-4 text-sm text-slate-500">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              {page > 1 && (
                <a
                  href={`?page=${page - 1}`}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Previous
                </a>
              )}
              {page < totalPages && (
                <a
                  href={`?page=${page + 1}`}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Next
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
