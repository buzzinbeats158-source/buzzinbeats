import type { Metadata } from "next";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";

type SampleProduct = { id: number; title: string; price: number | null; image_url: string | null; product_url: string };

const SAMPLE_PRODUCTS: SampleProduct[] = [
  {
    id: 0,
    title: "Elite Pro Wireless Headphones",
    price: 299,
    image_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAzukSccO1ELuSAFFV7VAF8BoVop3IFAk3iaaEUSbHQVKSarCrWKjHR4XROUvXIgtUDyuH92Ec9C2roVeyKkVGJLgSLlOWOdP8y0hqHgJv3-sCVqnDPZNdJKSP0xxq_J5cTKafW0xmKgCLzmYQ9CxfzmTRQh43nZtnVZB4a-QB0K06UpbXVhi7f8qEC4KqLlIRI8Fda9Lpyu1cy2oww5VSHST1qNvDu41Sdx1vTE3s3IjCOR40S5U8WSlf6s77249F1DeAGMYZzlTk",
    product_url: "#",
  },
  {
    id: 0,
    title: "Tactile Mechanical Keyboard",
    price: 145,
    image_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDIqEcP9EtwdgYiRaKIvoGligxFfi7x8lmmUsewEDNGNyUyin84qEW1p-ljb2jOgy47zKW8YsEaEC357NG0Yw30pbfhgdDfc8HwAaS1yYoaqj_QhZnVGH1Esq7s8Nhk9pGpBOBJauqskFlM83bmkm_JNZjbt0bHHwtybgLB0BhTE3y558CbkhfWTWu18PPbwINVfnLfLJtuFdC7jUNoF6V1sToyjclNYlHghgHZ8qWz78C9fpLIYj8VkB5smzMLC_qaLfbrasjE8QQ",
    product_url: "#",
  },
  {
    id: 0,
    title: "Streamer X Condenser Mic",
    price: 189,
    image_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDx6_R3eLX9-WcRJZfs5Ia9aCmgJJvmotgclT-JuUsyPPq2ls_OvsIrStBHZI7m6fwIqxnBFwRnWwODExYCWB4RY70yozP764YCuFu7qMQih-Hbatv4saS1i5fjtbU3L-MG_EnGo6yGp2Eqb5PwYHE2QFwXW7C978dtlRorjzTqbL1EaCSvJs79h90bE950e7j0MjFY8XLJzsLf3ZKDFJF49GFtSc3c2Til-u-IVnM6EM5ol7mB9qtRtDuOr8jCudv26JxBDLJytf0",
    product_url: "#",
  },
  {
    id: 0,
    title: "Panoramic 4K Curve Display",
    price: 599,
    image_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDQMARZmp3c4sqjaTlqJrXf44PGV_6a8DTcMeYa8zm6gRVs5dwhEzN0Sr2EKAVpdYANuM42i3pGwFIMUgbJGetX6okbQ_oj0Qfe9NyH4xEZGUd8FTGj7jsHzD_hMk06ArcD0kOOtKXb-b24ltlN04kwAIqGlAPtYDm58ISp4PFqHFrM45Qxy4LTzumrquQtifYY2gkKwjTiLSAnm82qIn6KPGYsvMtfesGtRbuvUG7s8yNowG7YOuZq3f7SXRXuPnia91PZm23B4nk",
    product_url: "#",
  },
];

function priceLabel(price: number | null) {
  if (!price) return "Check Price";
  return price >= 1000 ? `₹${Math.round(price).toLocaleString()}` : `$${price.toFixed(2)}`;
}

function productHref(id: number, fallbackUrl: string) {
  return id ? `/redirect-page/products/${id}` : fallbackUrl;
}

export async function generateMetadata(): Promise<Metadata> {
  const supabase = createAdminClient();
  const { data: settings } = await supabase.from("redirect_page_settings").select("page_title, hero_subtitle").limit(1).maybeSingle();
  return {
    title: `${settings?.page_title ?? "Page Unavailable"} | BuzzinBeats`,
    description: settings?.hero_subtitle ?? "This page is currently unavailable.",
  };
}

export default async function RedirectPage() {
  const supabase = createAdminClient();
  const { data: settings } = await supabase.from("redirect_page_settings").select("*").limit(1).maybeSingle();

  const [{ data: trendingRaw }, { data: flashRaw }] = await Promise.all([
    supabase.from("redirect_page_products").select("*").eq("is_active", true).eq("section", "trending").order("sort_order").order("id"),
    supabase.from("redirect_page_products").select("*").eq("is_active", true).eq("section", "flash_deals").order("sort_order").order("id"),
  ]);

  const trending = trendingRaw && trendingRaw.length > 0 ? trendingRaw : SAMPLE_PRODUCTS;
  const flash = flashRaw && flashRaw.length > 0 ? flashRaw : SAMPLE_PRODUCTS.slice(0, 3);

  const heroFull = settings?.hero_title ?? "This page is currently unavailable.";
  const lastSpace = heroFull.lastIndexOf(" ");
  const heroStart = lastSpace !== -1 ? heroFull.slice(0, lastSpace + 1) : "";
  const heroEnd = lastSpace !== -1 ? heroFull.slice(lastSpace + 1) : heroFull;

  const btn1On = settings?.button_1_enabled && settings?.button_1_url;
  const btn2On = settings?.button_2_enabled && settings?.button_2_url;
  const btn3On = settings?.button_3_enabled && settings?.button_3_url;

  const gridCols = trending.length >= 4 ? "lg:grid-cols-4" : trending.length === 3 ? "lg:grid-cols-3" : trending.length === 2 ? "lg:grid-cols-2" : "lg:grid-cols-1";

  return (
    <div
      className="min-h-screen font-body text-on-surface"
      style={{
        backgroundColor: "var(--color-surface)",
        backgroundImage:
          "radial-gradient(at 0% 0%, rgba(224, 100, 25, 0.08) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(255, 99, 71, 0.08) 0px, transparent 50%)",
      }}
    >
      <main className="mx-auto max-w-7xl px-6 py-12 md:py-20">
        <section className="mb-16 space-y-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-bold tracking-wide text-primary">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            SYSTEM STATUS: {settings?.is_active ? "LIVE" : "UNAVAILABLE"}
          </div>

          <h1 className="font-display text-4xl leading-tight font-extrabold tracking-tight text-on-surface md:text-6xl">
            {heroStart}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{heroEnd}</span>
          </h1>

          <p className="mx-auto max-w-2xl text-lg font-medium text-on-surface-variant">
            {settings?.hero_subtitle ?? "Explore our featured recommendations below or return to the homepage to find what you're looking for."}
          </p>

          {(btn1On || btn2On || btn3On) && (
            <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
              {btn1On && (
                <a
                  href={settings!.button_1_url!}
                  className="inline-block w-full rounded-xl bg-gradient-to-r from-primary to-secondary px-8 py-4 text-center font-bold text-on-primary shadow-lg shadow-primary/30 transition-all hover:shadow-xl active:scale-95 sm:w-auto"
                >
                  {settings?.button_1_label || "Go to Homepage"}
                </a>
              )}
              {btn2On && (
                <a
                  href={settings!.button_2_url!}
                  className="inline-block w-full rounded-xl border-2 border-outline-variant px-8 py-4 text-center font-bold text-on-surface-variant transition-all hover:bg-surface-container-low active:scale-95 sm:w-auto"
                >
                  {settings?.button_2_label || "Explore Deals"}
                </a>
              )}
              {btn3On && (
                <a
                  href={settings!.button_3_url!}
                  className="inline-block w-full rounded-xl bg-secondary-container px-8 py-4 text-center font-bold text-on-secondary-container transition-all hover:bg-secondary-fixed active:scale-95 sm:w-auto"
                >
                  {settings?.button_3_label || "Create Your Own Page"}
                </a>
              )}
            </div>
          )}
        </section>

        {trending.length > 0 && (
          <section className="mb-20">
            <div className="mb-10">
              <h2 className="font-display text-3xl font-bold text-on-surface">Trending Today</h2>
              <p className="mt-2 font-medium text-on-surface-variant">Top picks from the community</p>
            </div>
            <div className={`grid grid-cols-1 gap-8 sm:grid-cols-2 ${gridCols}`}>
              {trending.map((product, i) => (
                <div key={`${product.id}-${i}`} className="group overflow-hidden rounded-2xl border border-primary/10 bg-surface-bright shadow-lg transition-all duration-300 hover:-translate-y-2">
                  <div className="relative aspect-square overflow-hidden">
                    {product.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" src={product.image_url} alt={product.title} loading="lazy" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-surface-container-low text-outline-variant">
                        <span className="material-symbols-outlined text-5xl">inventory_2</span>
                      </div>
                    )}
                    {i === 0 && (
                      <div className="absolute top-4 right-4 rounded-full bg-surface-bright/90 px-3 py-1 text-xs font-bold text-primary backdrop-blur-sm">FEATURED</div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="mb-2 truncate font-display text-lg font-bold text-on-surface" title={product.title}>
                      {product.title}
                    </h3>
                    <div className="mb-6 flex items-center justify-between">
                      <span className="text-2xl font-extrabold text-on-surface">{priceLabel(product.price)}</span>
                      <div className="flex items-center text-orange-400">
                        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                          star
                        </span>
                        <span className="ml-1 text-sm font-bold text-on-surface-variant">4.9</span>
                      </div>
                    </div>
                    <a
                      href={productHref(product.id, product.product_url)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-bold text-on-primary shadow-md shadow-primary/20 transition-colors hover:bg-primary-container"
                    >
                      <span className="material-symbols-outlined text-xl">shopping_cart</span>
                      Buy on Amazon
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {flash.length > 0 && (
          <section className="mb-20">
            <h2 className="mb-8 font-display text-2xl font-bold text-on-surface">Flash Deals</h2>
            <div className="scrollbar-hide flex flex-nowrap gap-6 overflow-x-auto pb-6">
              {flash.map((product, i) => (
                <div key={`${product.id}-${i}`} className="group flex w-64 shrink-0 items-center gap-4 rounded-xl bg-surface-container-low p-4">
                  {product.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="h-16 w-16 shrink-0 rounded-lg object-cover" src={product.image_url} alt={product.title} loading="lazy" />
                  ) : (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-surface-container">
                      <span className="material-symbols-outlined text-outline-variant">inventory_2</span>
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-sm font-bold text-on-surface">{product.title}</p>
                    <p className="text-sm font-extrabold text-primary">{priceLabel(product.price)}</p>
                    <a href={productHref(product.id, product.product_url)} target="_blank" rel="noreferrer" className="mt-1 flex items-center gap-1 text-xs font-bold text-on-surface-variant hover:text-primary">
                      View Deal <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="relative">
          <div className="absolute inset-0 rotate-1 scale-[1.02] rounded-[40px] bg-gradient-to-br from-primary via-secondary to-orange-400 opacity-10" />
          <div className="relative flex flex-col items-center justify-between gap-8 overflow-hidden rounded-[40px] bg-gradient-to-r from-on-surface to-zinc-900 p-8 text-center md:flex-row md:p-16 md:text-left">
            <div className="absolute top-0 right-0 -mt-32 -mr-32 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
            <div className="absolute bottom-0 left-0 -mb-24 -ml-24 h-48 w-48 rounded-full bg-secondary/10 blur-2xl" />
            <div className="relative z-10 max-w-2xl">
              <h2 className="mb-4 font-display text-3xl leading-tight font-extrabold text-on-primary md:text-4xl">
                Build your own high-converting link-in-bio page with BuzzinBeats
              </h2>
              <p className="text-lg font-medium text-surface-variant opacity-80">Join thousands of creators and turn your bio into a powerful digital storefront.</p>
            </div>
            <Link
              href="/register"
              className="relative z-10 w-full rounded-full bg-surface-bright px-10 py-5 text-center font-black text-on-surface shadow-2xl shadow-white/10 transition-all hover:scale-105 active:scale-95 md:w-auto"
            >
              Get Started Free
            </Link>
          </div>
        </section>

        {settings?.fallback_landing_enabled && settings?.fallback_landing_url && (
          <div className="mt-12 mb-4 text-center">
            <p className="mb-2 text-sm text-on-surface-variant">Looking for the main site?</p>
            <a href={settings.fallback_landing_url} className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
              <span className="material-symbols-outlined text-[16px]">home</span>
              Return to Main Page
            </a>
          </div>
        )}
      </main>

      <footer className="py-12 text-center text-sm font-medium text-on-surface-variant/60">
        &copy; {new Date().getFullYear()} BuzzinBeats. All rights reserved. &bull;{" "}
        <Link className="underline-offset-4 hover:text-primary" href="/privacy">
          Privacy
        </Link>{" "}
        &bull;{" "}
        <Link className="underline-offset-4 hover:text-primary" href="/terms">
          Terms
        </Link>
      </footer>
    </div>
  );
}
