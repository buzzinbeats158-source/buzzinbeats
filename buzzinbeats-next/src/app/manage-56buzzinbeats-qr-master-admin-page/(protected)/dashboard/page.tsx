import { requireAdmin } from "@/lib/data/admin";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminDashboardPage() {
  await requireAdmin();
  const supabase = createAdminClient();

  const [{ count: users }, { count: pages }, { count: products }, { count: links }, linksClicksRes] = await Promise.all([
    supabase.from("users").select("id", { count: "exact", head: true }),
    supabase.from("pages").select("id", { count: "exact", head: true }),
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("links").select("id", { count: "exact", head: true }),
    supabase.from("links").select("clicks"),
  ]);

  const totalClicks = (linksClicksRes.data ?? []).reduce((sum, l) => sum + (l.clicks ?? 0), 0);

  const stats = [
    { label: "Total Users", value: users ?? 0, icon: "groups", accent: "text-primary", accentBg: "bg-primary/10" },
    { label: "Total Pages", value: pages ?? 0, icon: "layers", accent: "text-blue-500", accentBg: "bg-blue-500/10" },
    { label: "Total Products", value: products ?? 0, icon: "inventory_2", accent: "text-purple-500", accentBg: "bg-purple-500/10" },
    { label: "Redirect Links", value: links ?? 0, icon: "link", accent: "text-teal-500", accentBg: "bg-teal-500/10" },
    { label: "Total Clicks", value: totalClicks, icon: "touch_app", accent: "text-orange-500", accentBg: "bg-orange-500/10" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard Overview</h1>
        <p className="text-slate-500">Welcome back. Here&apos;s what&apos;s happening with BuzzinBeats today.</p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className={`rounded-lg p-2 ${s.accentBg}`}>
                <span className={`material-symbols-outlined ${s.accent}`}>{s.icon}</span>
              </div>
            </div>
            <p className="text-sm font-medium text-slate-500">{s.label}</p>
            <h3 className="mt-1 text-3xl font-bold text-slate-800">{s.value.toLocaleString()}</h3>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-100 bg-white p-8 shadow-sm">
        <h4 className="mb-6 text-lg font-bold text-slate-800">System Status</h4>
        <div className="space-y-6">
          <div className="flex space-x-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100">
              <span className="material-symbols-outlined text-sm text-emerald-600">check_circle</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">System Operational</p>
              <p className="text-xs text-slate-500">All systems running smoothly.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
