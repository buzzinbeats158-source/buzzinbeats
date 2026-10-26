import { parseStringArray } from "@/lib/public-page/store-configs";

type Product = { store_platform: unknown };

/** Port of the Affiliate Disclosure section in the old page.blade.php. */
export default function AffiliateDisclosure({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  const allStoreNames = Array.from(
    new Set(products.flatMap((p) => parseStringArray(p.store_platform)).filter(Boolean))
  );

  let storeText: string;
  if (allStoreNames.length === 1) storeText = allStoreNames[0];
  else if (allStoreNames.length === 2) storeText = `${allStoreNames[0]} and ${allStoreNames[1]}`;
  else if (allStoreNames.length > 2)
    storeText = `${allStoreNames[0]}, ${allStoreNames[1]} and ${allStoreNames.length - 2} other stores`;
  else storeText = "our partner stores";

  return (
    <section className="group relative mb-16 overflow-hidden rounded-3xl border border-primary/10 bg-primary/5 px-8 py-12">
      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
          <span className="material-symbols-outlined text-3xl text-primary">verified_user</span>
        </div>
        <h3 className="mb-4 text-2xl font-bold text-slate-900">Affiliate Disclosure</h3>
        <p className="text-lg leading-relaxed text-slate-600">
          This page contains affiliate links to products on <span className="font-bold text-primary">{storeText}</span>.
          I may earn a commission from qualifying purchases at no extra cost to you. Your support helps keep this
          platform running!
        </p>
      </div>
    </section>
  );
}
