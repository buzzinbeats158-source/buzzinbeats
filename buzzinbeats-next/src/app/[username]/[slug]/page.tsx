import { notFound } from "next/navigation";
import { loadPublicPage } from "@/lib/data/public-page";
import SiteFooter from "@/components/SiteFooter";
import PublicPageHeader, { hasPersonalBranding } from "@/components/PublicPageHeader";
import { AboutSection, ContactSection, ServicesSection, SocialLinksSection } from "@/components/PublicBrandingSections";
import ProductClassicGrid from "@/components/ProductClassicGrid";
import RedirectLinkSection from "@/components/RedirectLinkSection";
import DigitalProductSection from "@/components/DigitalProductSection";
import AffiliateDisclosure from "@/components/AffiliateDisclosure";

export const dynamic = "force-dynamic"; // view count must be fresh on every load

type Props = {
  params: Promise<{ username: string; slug: string }>;
};

export default async function PublicPage({ params }: Props) {
  const { username, slug } = await params;
  const result = await loadPublicPage(decodeURIComponent(username), decodeURIComponent(slug));

  if (result.kind === "not_found") notFound();

  if (result.kind === "inactive") {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-2 px-6 text-center">
        <h1 className="text-xl font-semibold">This page isn&apos;t available right now</h1>
      </main>
    );
  }

  if (result.kind === "subscription_required") {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-2 px-6 text-center">
        <h1 className="text-xl font-semibold">This creator&apos;s page is temporarily unavailable</h1>
        <p className="text-sm text-neutral-500">Their subscription needs to be renewed.</p>
      </main>
    );
  }

  const { owner, page, products, redirectLinks, digitalProducts, sections, socialLinks, landingSections } = result;
  const personalBranding = hasPersonalBranding(owner);

  // content_page_sections holds at most one row per section_type (product /
  // redirect_link / digital_product), ordered by section_order — map each
  // to its already-fetched item list, matching the old Laravel page's
  // per-section item loading.
  const sectionRenderers: Record<string, () => React.ReactNode> = {
    product: () => (products.length > 0 ? <ProductClassicGrid products={products} /> : null),
    redirect_link: () => <RedirectLinkSection items={redirectLinks} />,
    digital_product: () => <DigitalProductSection items={digitalProducts} />,
  };
  const orderedSectionTypes = sections.length > 0 ? sections.map((s) => s.section_type) : ["product", "redirect_link", "digital_product"];

  return (
    <div className="min-h-screen bg-white">
      <PublicPageHeader owner={owner} socialLinks={socialLinks} />

      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <header className="mb-20 text-center">
          <h1 className="mb-6 text-4xl font-black tracking-tight text-slate-900 lg:text-7xl">{page.title}</h1>
          {page.description && page.description.trim() !== "" && (
            <p className="mx-auto max-w-2xl text-lg font-medium leading-relaxed text-slate-500 lg:text-xl">
              {page.description}
            </p>
          )}
        </header>

        <AboutSection owner={owner} landingSections={landingSections} />
        <SocialLinksSection socialLinks={socialLinks} landingSections={landingSections} />
        <ServicesSection owner={owner} landingSections={landingSections} />
        <ContactSection owner={owner} landingSections={landingSections} />

        <div className="mb-32 space-y-20">
          {orderedSectionTypes.map((type) => (
            <div key={type}>{sectionRenderers[type]?.()}</div>
          ))}
          {products.length === 0 && redirectLinks.length === 0 && digitalProducts.length === 0 && (
            <div className="rounded-[3rem] border border-dashed border-slate-200 bg-slate-50 py-20 text-center">
              <span className="material-symbols-outlined mb-4 text-6xl text-slate-300">layers</span>
              <p className="text-lg font-bold text-slate-500">Nothing shared here yet.</p>
            </div>
          )}
        </div>

        <AffiliateDisclosure products={products} />
      </main>

      {!personalBranding && <SiteFooter />}
    </div>
  );
}
