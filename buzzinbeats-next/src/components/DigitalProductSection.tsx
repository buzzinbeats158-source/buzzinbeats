import { publicStorageUrl } from "@/lib/storage";
import { normalizeDescriptionToHtml } from "@/lib/richtext-core";
import DigitalProductCheckout from "@/components/DigitalProductCheckout";

type DigitalProduct = {
  id: number;
  title: string;
  description: string | null;
  cover_image_path: string | null;
  delivery_note: string | null;
  price: number;
  currency_symbol: string;
};

/** Port of the old public.partials.sections.digital_product blade partial (card grid; checkout modal is DigitalProductCheckout). */
export default function DigitalProductSection({
  items,
  renderActions,
}: {
  items: DigitalProduct[];
  /** Optional per-card corner overlay (edit/delete) — the dashboard preview passes this; the public page never does. */
  renderActions?: (item: DigitalProduct) => React.ReactNode;
}) {
  if (items.length === 0) return null;

  return (
    <div>
      <h2 className="mb-8 text-center text-2xl font-black tracking-tight text-slate-900">Digital Products</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((product) => {
          const imageUrl = publicStorageUrl(product.cover_image_path);
          const descriptionHtml = normalizeDescriptionToHtml(product.description);
          return (
            <div
              key={product.id}
              className="relative flex flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
            >
              {renderActions && <div className="absolute right-3 top-3 z-10 flex items-center gap-1">{renderActions(product)}</div>}
              <div className="flex aspect-video items-center justify-center overflow-hidden bg-slate-50">
                {imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imageUrl} alt={product.title} className="h-full w-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-5xl text-slate-300">description</span>
                )}
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-lg font-black text-slate-900">{product.title}</h3>
                {descriptionHtml && (
                  <div
                    className="rt-content mt-1 line-clamp-3 text-sm text-slate-500"
                    dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                  />
                )}
                {product.delivery_note && (
                  <p className="mt-2 text-xs italic text-slate-400">{product.delivery_note}</p>
                )}
                <div className="mt-auto flex items-center justify-between pt-4">
                  <span className="text-xl font-black text-primary">
                    {product.currency_symbol}
                    {Number(product.price).toFixed(2)}
                  </span>
                  <div className="w-32 shrink-0">
                    <DigitalProductCheckout
                      product={{
                        id: product.id,
                        title: product.title,
                        price: product.price,
                        currency_symbol: product.currency_symbol,
                        delivery_note: product.delivery_note,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
