import { getCurrentUser } from "@/lib/data/current-user";
import { createClient } from "@/lib/supabase/server";
import { publicStorageUrl } from "@/lib/storage";

function fileSizeForHumans(bytes: number | null) {
  if (!bytes) return null;
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let i = 0;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i++;
  }
  return `${size.toFixed(size >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}

export default async function DigitalProductsPage() {
  const user = await getCurrentUser();
  const supabase = await createClient();
  const { data: digitalProducts } = await supabase
    .from("digital_products")
    .select("*, pages(id, title)")
    .eq("user_id", user!.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  const list = digitalProducts ?? [];

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">My Digital Products</h1>
          <p className="mt-1 text-sm text-slate-500">
            All downloadable products you&apos;ve added across your Content Pages.
          </p>
        </div>
        <a
          href="/dashboard/pages"
          className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-primary/90"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Add Digital Product
        </a>
      </div>

      {list.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-orange-50">
            <span className="material-symbols-outlined text-4xl text-primary">cloud_download</span>
          </div>
          <h2 className="mb-2 text-xl font-bold text-slate-800">No digital products yet</h2>
          <p className="mb-6 max-w-xs text-sm text-slate-500">
            Sell PDFs, notes, practice papers and other downloadable content from a Content Page.
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
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {list.map((product) => {
            const page = product.pages as unknown as { id: number; title: string } | null;
            const coverUrl = publicStorageUrl(product.cover_image_path);
            const size = fileSizeForHumans(product.file_size);
            return (
              <div
                key={product.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
              >
                <div className="relative aspect-square overflow-hidden bg-slate-100">
                  {coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={coverUrl}
                      alt={product.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <span className="material-symbols-outlined text-4xl text-slate-300">description</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex items-center gap-0.5 rounded-full bg-black/60 px-1.5 py-0.5 text-[9px] font-bold text-white backdrop-blur-sm">
                    <span className="material-symbols-outlined text-[10px]">download</span>
                    {product.clicks ?? 0}
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-3">
                  <h3 className="mb-1 line-clamp-2 text-[11px] font-bold leading-tight text-slate-800">{product.title}</h3>
                  <p className="mb-2 text-[11px] font-bold text-primary">
                    {product.currency_symbol}
                    {Number(product.price).toFixed(2)}
                  </p>
                  <p className="mb-2 truncate text-[10px] text-slate-400">
                    {product.original_file_name}
                    {size && <> &middot; {size}</>}
                  </p>
                  {page && (
                    <a
                      href={`/dashboard/pages/${page.id}`}
                      className="mt-auto flex w-full items-center justify-center gap-1 rounded-lg bg-slate-100 px-2 py-1.5 text-[10px] font-bold text-slate-700 transition-all hover:bg-slate-200"
                    >
                      <span className="material-symbols-outlined text-[12px]">settings</span>
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
