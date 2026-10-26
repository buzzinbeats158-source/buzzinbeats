"use client";

import { publicStorageUrl } from "@/lib/storage";

export default function AddedContentList({
  products,
  redirectLinks,
  digitalProducts,
  onEditProduct,
  onEditLink,
  onEditDigitalProduct,
  deleteProduct,
  deleteRedirectLink,
  deleteDigitalProduct,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  products: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  redirectLinks: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  digitalProducts: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onEditProduct: (product: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onEditLink: (link: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onEditDigitalProduct: (product: any) => void;
  deleteProduct: (id: number) => Promise<void>;
  deleteRedirectLink: (id: number) => Promise<void>;
  deleteDigitalProduct: (id: number) => Promise<void>;
}) {
  const total = products.length + redirectLinks.length + digitalProducts.length;

  return (
    <div className="mt-4 border-t-8 border-slate-100 bg-slate-50/60 p-6">
      <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">Added Content ({total})</h3>

      {total === 0 && (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-12 text-center text-slate-400">
          <span className="material-symbols-outlined mb-2 text-4xl text-slate-300">layers</span>
          <p className="text-sm">No content added yet. Use the tabs above to add products, redirect links, or digital products.</p>
        </div>
      )}

      <div className="space-y-3">
        {products.map((p) => (
          <div key={`p-${p.id}`} className="group flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-primary/30">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
              {p.image_path ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={publicStorageUrl(p.image_path)!} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-slate-300">
                  <span className="material-symbols-outlined">image</span>
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="mb-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">Product</span>
                  <h3 className="truncate font-bold text-slate-900">{p.title}</h3>
                  <div
                    className="rt-content mt-0.5 line-clamp-2 text-xs text-slate-500"
                    dangerouslySetInnerHTML={{ __html: p.description ?? "" }}
                  />
                </div>
                <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button onClick={() => onEditProduct(p)} className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-primary/5 hover:text-primary" title="Edit Product">
                    <span className="material-symbols-outlined text-lg">edit</span>
                  </button>
                  <form action={async () => { await deleteProduct(p.id); }}>
                    <button type="submit" className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500">
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        ))}

        {redirectLinks.map((l) => (
          <div key={`r-${l.id}`} className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
              {l.image_path ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={publicStorageUrl(l.image_path)!} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-slate-300">open_in_new</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <span className="mb-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">Redirect Link</span>
              <p className="truncate text-sm font-bold text-slate-800">{l.title}</p>
              <p className="truncate text-xs text-slate-500">{l.destination_url}</p>
            </div>
            <span className={`rounded-full px-2 py-1 text-xs font-bold ${l.status === "active" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
              {l.status.charAt(0).toUpperCase() + l.status.slice(1)}
            </span>
            <button onClick={() => onEditLink(l)} className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-primary/5 hover:text-primary" title="Edit Redirect Link">
              <span className="material-symbols-outlined text-lg">edit</span>
            </button>
            <form action={async () => { await deleteRedirectLink(l.id); }}>
              <button type="submit" className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500">
                <span className="material-symbols-outlined text-lg">delete</span>
              </button>
            </form>
          </div>
        ))}

        {digitalProducts.map((d) => (
          <div key={`d-${d.id}`} className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
              {d.cover_image_path ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={publicStorageUrl(d.cover_image_path)!} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-slate-300">description</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <span className="mb-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">Digital Product</span>
              <p className="truncate text-sm font-bold text-slate-800">{d.title}</p>
              <p className="truncate text-xs text-slate-500">
                {d.currency_symbol}
                {Number(d.price).toFixed(2)} &middot; {d.original_file_name}
              </p>
            </div>
            <span className={`rounded-full px-2 py-1 text-xs font-bold ${d.status === "active" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
              {d.status.charAt(0).toUpperCase() + d.status.slice(1)}
            </span>
            <button onClick={() => onEditDigitalProduct(d)} className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-primary/5 hover:text-primary" title="Edit Digital Product">
              <span className="material-symbols-outlined text-lg">edit</span>
            </button>
            <form action={async () => { await deleteDigitalProduct(d.id); }}>
              <button type="submit" className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500">
                <span className="material-symbols-outlined text-lg">delete</span>
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
