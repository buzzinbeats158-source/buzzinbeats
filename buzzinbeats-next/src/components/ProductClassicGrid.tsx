import { parseStringArray, storeConfigFor } from "@/lib/public-page/store-configs";
import { publicStorageUrl } from "@/lib/storage";
import { normalizeDescriptionToHtml } from "@/lib/richtext-core";

type Product = {
  id: number;
  title: string;
  description: string | null;
  image_path: string | null;
  show_price: boolean | null;
  starting_price: number | string | null;
  currency_symbol: string | null;
  store_platform: unknown;
  link: unknown;
};

/**
 * Port of the old "classic_grid" product layout — the highest-fidelity of
 * the five Laravel layout partials, and the only one implemented here (see
 * the restoration report for why the other four were skipped).
 */
export default function ProductClassicGrid({
  products,
  renderActions,
}: {
  products: Product[];
  /** Optional per-card corner overlay (edit/delete) — the dashboard preview passes this; the public page never does. */
  renderActions?: (product: Product) => React.ReactNode;
}) {
  if (products.length === 0) return null;

  const colCount = Math.max(1, Math.min(4, products.length));
  const maxStyle = colCount < 4 ? { maxWidth: `${colCount * 280 + (colCount - 1) * 32}px` } : undefined;
  const gridColsClass =
    { 1: "lg:grid-cols-1", 2: "lg:grid-cols-2", 3: "lg:grid-cols-3", 4: "lg:grid-cols-4" }[colCount] ?? "lg:grid-cols-4";

  return (
    <div className="mx-auto w-full" style={maxStyle}>
      <div className={`grid grid-cols-1 gap-6 sm:grid-cols-2 lg:gap-8 ${gridColsClass}`}>
        {products.map((product) => {
          const platforms = parseStringArray(product.store_platform);
          const links = parseStringArray(product.link);
          const imageUrl = publicStorageUrl(product.image_path);
          const price = product.starting_price !== null ? Number(product.starting_price) : null;
          const descriptionHtml = normalizeDescriptionToHtml(product.description);

          return (
            <div
              key={product.id}
              className="group relative flex h-full flex-col rounded-[2rem] border border-primary/5 bg-white p-4 shadow-lg transition-all hover:-translate-y-2 hover:shadow-primary/20"
            >
              {renderActions && <div className="absolute right-3 top-3 z-10 flex items-center gap-1">{renderActions(product)}</div>}
              <div className="relative mb-6 flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl bg-slate-50 p-4">
                {imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageUrl}
                    alt={product.title}
                    className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-300">
                    <span className="material-symbols-outlined text-6xl">image</span>
                  </div>
                )}
              </div>
              <div className="flex flex-grow flex-col px-2 text-center">
                <h3 className="mb-2 text-xl font-bold text-slate-900">{product.title}</h3>
                {descriptionHtml && (
                  <div
                    className="rt-content mb-4 line-clamp-3 flex-grow text-sm leading-snug text-slate-500"
                    dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                  />
                )}
                {product.show_price && price !== null && (
                  <div className="mb-4 text-2xl font-black text-primary">
                    {product.currency_symbol ?? "$"}
                    {price.toFixed(2)}
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  {links.map((url, i) => {
                    if (!url) return null;
                    const storeName = platforms[i] || "Store";
                    const conf = storeConfigFor(storeName);
                    return (
                      <a
                        key={i}
                        href={`/product/track/${product.id}/${i}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ backgroundColor: conf.color, color: conf.text }}
                        className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-base font-bold shadow-md transition-all hover:brightness-110"
                      >
                        <span className="material-symbols-outlined text-xl">shopping_cart</span>
                        Buy on {storeName}
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
