import { getCurrentUser } from "@/lib/data/current-user";
import { createClient } from "@/lib/supabase/server";
import { publicStorageUrl } from "@/lib/storage";
import { normalizeDescriptionToHtml } from "@/lib/richtext";
import { publicPagePath } from "@/lib/public-page-url";

const SORTS = {
  date_desc: { label: "Newest First", col: "created_at", asc: false },
  date_asc: { label: "Oldest First", col: "created_at", asc: true },
  performance: { label: "Performance", col: "clicks", asc: false },
  name: { label: "Name A–Z", col: "title", asc: true },
} as const;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const user = await getCurrentUser();
  const { sort: sortParam } = await searchParams;
  const sort = (sortParam && sortParam in SORTS ? sortParam : "date_desc") as keyof typeof SORTS;
  const { col, asc } = SORTS[sort];

  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("*, pages(id, title, public_username, slug)")
    .eq("user_id", user!.id)
    .order(col, { ascending: asc });

  const list = products ?? [];

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">My Products</h1>
          <p className="mt-1 text-sm text-slate-500">
            All products you&apos;ve added across your pages, with click performance data.
          </p>
        </div>
        <a
          href="/dashboard/pages"
          className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-primary/90"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Add Product
        </a>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <span className="mr-2 text-xs font-bold uppercase tracking-widest text-slate-400">Sort by</span>
        {Object.entries(SORTS).map(([key, { label }]) => (
          <a
            key={key}
            href={`/dashboard/products?sort=${key}`}
            className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${
              sort === key ? "bg-primary text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {label}
          </a>
        ))}
        <span className="ml-auto text-xs text-slate-400">
          {list.length} product{list.length !== 1 ? "s" : ""}
        </span>
      </div>

      {list.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-orange-50">
            <span className="material-symbols-outlined text-4xl text-primary">inventory_2</span>
          </div>
          <h2 className="mb-2 text-xl font-bold text-slate-800">No products yet</h2>
          <p className="mb-6 max-w-xs text-sm text-slate-500">
            Add products to your pages and they&apos;ll appear here with performance tracking.
          </p>
          <a
            href="/dashboard/pages"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-primary/90"
          >
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
            Go to My Pages
          </a>
        </div>
      ) : (
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {list.map((product) => {
            const page = product.pages as unknown as { id: number; title: string; public_username: string; slug: string } | null;
            const imageUrl = publicStorageUrl(product.image_path);
            const descriptionHtml = normalizeDescriptionToHtml(product.description);
            return (
              <div
                key={product.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
              >
                <div className="relative aspect-square overflow-hidden bg-slate-100">
                  {imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imageUrl}
                      alt={product.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <span className="material-symbols-outlined text-4xl text-slate-300">image</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex items-center gap-0.5 rounded-full bg-black/60 px-1.5 py-0.5 text-[9px] font-bold text-white backdrop-blur-sm">
                    <span className="material-symbols-outlined text-[10px]">ads_click</span>
                    {product.clicks ?? 0}
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-3">
                  <h3 className="mb-1 line-clamp-2 text-[11px] font-bold leading-tight text-slate-800">{product.title}</h3>
                  {descriptionHtml && (
                    <div
                      className="rt-content mb-2 line-clamp-2 text-[10px] leading-snug text-slate-500"
                      dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                    />
                  )}
                  <div className="mt-auto space-y-1.5">
                    <div className="flex items-center gap-1 text-[10px] text-slate-500">
                      <span className="material-symbols-outlined text-[12px] text-primary">ads_click</span>
                      <span className="font-semibold text-slate-700">{product.clicks ?? 0}</span> clicks
                    </div>
                    {page && (
                      <>
                        <a
                          href={`/dashboard/pages/${page.id}`}
                          className="flex w-full items-center justify-center gap-1 rounded-lg bg-slate-100 px-2 py-1.5 text-[10px] font-bold text-slate-700 transition-all hover:bg-slate-200"
                        >
                          <span className="material-symbols-outlined text-[12px]">settings</span>
                          Manage Page
                        </a>
                        <a
                          href={publicPagePath(page)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex w-full items-center justify-center gap-1 rounded-lg bg-primary/10 px-2 py-1.5 text-[10px] font-bold text-primary transition-all hover:bg-primary hover:text-white"
                        >
                          <span className="material-symbols-outlined text-[12px]">visibility</span>
                          View Page
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
