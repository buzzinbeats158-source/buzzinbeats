import { getCurrentUser } from "@/lib/data/current-user";
import { createClient } from "@/lib/supabase/server";
import { publicStorageUrl } from "@/lib/storage";

export default async function RedirectLinksPage() {
  const user = await getCurrentUser();
  const supabase = await createClient();
  const { data: redirectLinks } = await supabase
    .from("redirect_links")
    .select("*, pages(id, title)")
    .eq("user_id", user!.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  const list = redirectLinks ?? [];

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">My Redirect Links</h1>
          <p className="mt-1 text-sm text-slate-500">
            All redirect links you&apos;ve added across your Content Pages, with click performance.
          </p>
        </div>
        <a
          href="/dashboard/pages"
          className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-primary/90"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Add Redirect Link
        </a>
      </div>

      {list.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-orange-50">
            <span className="material-symbols-outlined text-4xl text-primary">open_in_new</span>
          </div>
          <h2 className="mb-2 text-xl font-bold text-slate-800">No redirect links yet</h2>
          <p className="mb-6 max-w-xs text-sm text-slate-500">
            Add a redirect link to a Content Page to send visitors to another website or landing page.
          </p>
          <a
            href="/dashboard/pages"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-primary/90"
          >
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
            Go to My Content Pages
          </a>
        </div>
      ) : (
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((link) => {
            const page = link.pages as unknown as { id: number; title: string } | null;
            const imageUrl = publicStorageUrl(link.image_path);
            return (
              <div
                key={link.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
              >
                <div className="flex gap-3 p-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100">
                    {imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={imageUrl} alt={link.title} className="h-full w-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-2xl text-slate-300">open_in_new</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="mb-1 truncate text-sm font-bold leading-tight text-slate-800">{link.title}</h3>
                    <p className="truncate text-xs text-slate-500">{link.destination_url}</p>
                    <span
                      className={`mt-1 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                        link.status === "active" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {link.status.charAt(0).toUpperCase() + link.status.slice(1)}
                    </span>
                  </div>
                </div>
                <div className="mt-auto flex items-center justify-between px-4 pb-4 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px] text-primary">ads_click</span>
                    <span className="font-semibold text-slate-700">{link.clicks ?? 0}</span> clicks
                  </span>
                  {page && (
                    <a href={`/dashboard/pages/${page.id}`} className="font-bold text-primary hover:underline">
                      Manage on {page.title}
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
