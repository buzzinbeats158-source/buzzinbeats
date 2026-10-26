import Link from "next/link";
import { getCurrentUser } from "@/lib/data/current-user";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const supabase = await createClient();

  const [{ count: totalPages }, { count: activeLinksCount }, { data: pagesForScans }, { data: topPages }, { data: topProducts }] =
    await Promise.all([
      supabase.from("pages").select("id", { count: "exact", head: true }).eq("user_id", user!.id).is("deleted_at", null),
      supabase
        .from("pages")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user!.id)
        .eq("status", "active")
        .is("deleted_at", null),
      supabase.from("pages").select("views").eq("user_id", user!.id).is("deleted_at", null),
      supabase
        .from("pages")
        .select("id, title, views")
        .eq("user_id", user!.id)
        .is("deleted_at", null)
        .order("views", { ascending: false })
        .limit(5),
      supabase
        .from("products")
        .select("id, title, clicks, store_platform")
        .eq("user_id", user!.id)
        .order("clicks", { ascending: false })
        .limit(5),
    ]);

  const totalQrScans = (pagesForScans ?? []).reduce((sum, p) => sum + (p.views ?? 0), 0);
  const topPagesList = (topPages ?? []).filter((p) => (p.views ?? 0) > 0);
  const topProductsList = (topProducts ?? []).filter((p) => (p.clicks ?? 0) > 0);

  const STAT_CARDS = [
    { label: "Total Pages", value: totalPages ?? 0, icon: "file_copy" },
    { label: "Active Links", value: activeLinksCount ?? 0, icon: "link" },
    { label: "Total QR Scans", value: totalQrScans, icon: "qr_code_2" },
  ];

  return (
    <div>
      <header className="mb-12">
        <h1 className="mb-2 text-4xl font-extrabold tracking-tight text-slate-900">Welcome back, {user!.name}</h1>
        <p className="text-lg font-medium text-slate-500">Your links are buzzing! Here&apos;s a quick look at your performance today.</p>
      </header>

      <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-3">
        {STAT_CARDS.map((card) => (
          <div
            key={card.label}
            className="relative overflow-hidden rounded-[2rem] border border-slate-100 bg-white p-8 shadow-sm transition-all hover:shadow-md"
          >
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
              <span className="material-symbols-outlined">{card.icon}</span>
            </div>
            <p className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-400">{card.label}</p>
            <h3 className="text-4xl font-black text-slate-900">{card.value.toLocaleString()}</h3>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-12 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1 space-y-12 lg:max-w-[calc(66.666%-1.25rem)]">
          <section>
            <div className="mb-8 flex items-center gap-3">
              <div className="h-6 w-1.5 rounded-full bg-primary" />
              <h2 className="text-2xl font-bold text-slate-900">Top Performing Pages</h2>
            </div>
            <div className="rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-sm">
              <div className="space-y-4">
                {topPagesList.length === 0 ? (
                  <div className="py-12 text-center">
                    <span className="material-symbols-outlined mb-3 text-5xl text-slate-200">query_stats</span>
                    <p className="text-sm font-medium text-slate-400">No page engagement yet.</p>
                  </div>
                ) : (
                  topPagesList.map((p) => {
                    const percent = totalQrScans > 0 ? ((p.views ?? 0) / totalQrScans) * 100 : 0;
                    const barWidth = Math.min(100, Math.max(percent, Math.min((p.views ?? 0) * 5, 100)));
                    return (
                      <Link
                        key={p.id}
                        href={`/dashboard/pages/${p.id}`}
                        className="group flex cursor-pointer items-center justify-between rounded-2xl p-4 transition-all hover:bg-slate-50"
                      >
                        <div className="flex min-w-0 flex-1 items-center gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500 transition-transform group-hover:scale-110">
                            <span className="material-symbols-outlined">analytics</span>
                          </div>
                          <div className="flex min-w-0 flex-1 flex-col">
                            <div className="mb-1 flex items-center justify-between gap-4 pr-4">
                              <span className="truncate font-bold text-slate-800" title={p.title}>
                                {p.title}
                              </span>
                              <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                {(p.views ?? 0).toLocaleString()} scans
                              </span>
                            </div>
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                              <div className="h-full rounded-full bg-primary transition-all duration-1000" style={{ width: `${barWidth}%` }} />
                            </div>
                          </div>
                        </div>
                        <div className="ml-6 flex flex-col items-end">
                          <div className="text-lg font-black text-primary">
                            {Math.round(percent)}
                            <span className="ml-0.5 text-xs font-bold">%</span>
                          </div>
                          <span className="text-[10px] font-bold uppercase leading-none tracking-widest text-slate-400">Traffic</span>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            </div>
          </section>

          <section>
            <div className="mb-8 flex items-center gap-3">
              <div className="h-6 w-1.5 rounded-full bg-primary" />
              <h2 className="text-2xl font-bold text-slate-900">Most Clicked Products</h2>
            </div>
            <div className="rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-sm">
              <div className="space-y-4">
                {topProductsList.length === 0 ? (
                  <div className="py-12 text-center">
                    <span className="material-symbols-outlined mb-3 text-5xl text-slate-200">inventory_2</span>
                    <p className="text-sm font-medium text-slate-400">No product data yet.</p>
                  </div>
                ) : (
                  topProductsList.map((product) => {
                    let platforms = product.store_platform as unknown as string | null;
                    if (typeof platforms === "string") {
                      try {
                        const decoded = JSON.parse(platforms);
                        platforms = Array.isArray(decoded) ? decoded.join(", ") : platforms;
                      } catch {
                        // not JSON — use as-is
                      }
                    }
                    return (
                      <div
                        key={product.id}
                        className="group flex cursor-pointer items-center justify-between rounded-2xl p-4 transition-all hover:bg-slate-50"
                      >
                        <div className="flex min-w-0 flex-1 items-center gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500 transition-transform group-hover:scale-110">
                            <span className="material-symbols-outlined">shopping_cart</span>
                          </div>
                          <div className="flex min-w-0 flex-1 flex-col">
                            <div className="mb-1 flex items-center justify-between gap-4 pr-4">
                              <span className="truncate font-bold text-slate-800" title={product.title}>
                                {product.title}
                              </span>
                              <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                {platforms || "No Platform"}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="h-2 w-2 rounded-full bg-green-500" />
                              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Converting Well</span>
                            </div>
                          </div>
                        </div>
                        <div className="ml-6 flex flex-col items-end">
                          <div className="text-lg font-black text-primary">{(product.clicks ?? 0).toLocaleString()}</div>
                          <span className="text-[10px] font-bold uppercase leading-none tracking-widest text-slate-400">Clicks</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </section>
        </div>

        <div className="min-w-0 flex-1 lg:max-w-[calc(33.333%-1.25rem)]">
          <div className="relative overflow-hidden rounded-[3rem] border border-slate-100 bg-white p-10 text-center shadow-xl shadow-slate-200/40 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5">
            <div className="absolute left-0 top-0 h-1.5 w-full bg-primary/20" />
            <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
              <span className="material-symbols-outlined text-3xl">add</span>
            </div>
            <h3 className="mb-4 text-2xl font-black text-slate-900">Create New Page</h3>
            <p className="mb-10 px-4 font-medium leading-relaxed text-slate-500">
              Build a new professional link-in-bio page in seconds.
            </p>
            <Link
              href="/dashboard/pages/create"
              className="block w-full rounded-2xl bg-primary py-5 text-lg font-black text-white shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] hover:brightness-110 active:scale-[0.98]"
            >
              Start Building
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
