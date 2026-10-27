import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/data/current-user";
import { createClient } from "@/lib/supabase/server";
import { createProductAction, deleteProductAction, updateProductAction } from "@/lib/data/products";
import { createRedirectLinkAction, deleteRedirectLinkAction, updateRedirectLinkAction } from "@/lib/data/redirect-links";
import { createDigitalProductAction, deleteDigitalProductAction, updateDigitalProductAction } from "@/lib/data/digital-products";
import { normalizeDescriptionToHtml } from "@/lib/richtext";
import PageHeaderCard from "@/components/PageHeaderCard";
import PageContentManager from "@/components/PageContentManager";
import { publicPageUrl } from "@/lib/public-page-url";

export default async function PageDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pageId = Number(id);
  const user = await getCurrentUser();
  const supabase = await createClient();

  const { data: page } = await supabase
    .from("pages")
    .select("*")
    .eq("id", pageId)
    .eq("user_id", user!.id)
    .maybeSingle();

  if (!page) notFound();

  const [{ data: products }, { data: redirectLinks }, { data: digitalProducts }, { data: countries }, { data: userStores }] =
    await Promise.all([
      supabase.from("products").select("*").eq("page_id", pageId).order("serial_number"),
      supabase.from("redirect_links").select("*").eq("page_id", pageId).is("deleted_at", null).order("serial_number"),
      supabase.from("digital_products").select("*").eq("page_id", pageId).is("deleted_at", null).order("serial_number"),
      supabase.from("countries").select("id, name, code, currency_code, currency_symbol").order("name"),
      supabase.from("user_stores").select("name").eq("user_id", user!.id).eq("is_active", true),
    ]);

  const publicUrl = publicPageUrl(page, process.env.NEXT_PUBLIC_SITE_URL ?? "");

  const normalizedProducts = (products ?? []).map((product) => ({
    ...product,
    description: normalizeDescriptionToHtml(product.description),
  }));
  const normalizedRedirectLinks = (redirectLinks ?? []).map((link) => ({
    ...link,
    description: normalizeDescriptionToHtml(link.description),
  }));
  const normalizedDigitalProducts = (digitalProducts ?? []).map((product) => ({
    ...product,
    description: normalizeDescriptionToHtml(product.description),
  }));

  async function createProduct(formData: FormData) {
    "use server";
    await createProductAction(formData);
  }
  async function updateProduct(formData: FormData) {
    "use server";
    await updateProductAction(formData);
  }
  async function deleteProduct(productId: number) {
    "use server";
    await deleteProductAction(productId);
  }
  async function createRedirectLink(formData: FormData) {
    "use server";
    await createRedirectLinkAction(formData);
  }
  async function updateRedirectLink(formData: FormData) {
    "use server";
    await updateRedirectLinkAction(formData);
  }
  async function deleteRedirectLink(linkId: number) {
    "use server";
    await deleteRedirectLinkAction(linkId, pageId);
  }
  async function createDigitalProduct(formData: FormData) {
    "use server";
    await createDigitalProductAction(formData);
  }
  async function updateDigitalProduct(formData: FormData) {
    "use server";
    await updateDigitalProductAction(formData);
  }
  async function deleteDigitalProduct(productId: number) {
    "use server";
    await deleteDigitalProductAction(productId, pageId);
  }

  return (
    <div className="mx-auto max-w-7xl">
      <a href="/dashboard/pages" className="mb-2 inline-flex items-center gap-1 text-sm font-bold text-slate-500 hover:text-primary">
        <span className="material-symbols-outlined text-sm">arrow_back</span>
        My Content
      </a>

      <PageHeaderCard page={page} publicUrl={publicUrl} />

      <PageContentManager
        pageId={pageId}
        pageTitle={page.title}
        pageDescription={page.description}
        hasAmazonStoreId={!!user!.amazon_store_id}
        countries={countries ?? []}
        userStores={userStores ?? []}
        defaultShowPrice={user!.show_price_pref ?? true}
        products={normalizedProducts}
        redirectLinks={normalizedRedirectLinks}
        digitalProducts={normalizedDigitalProducts}
        createProduct={createProduct}
        updateProduct={updateProduct}
        deleteProduct={deleteProduct}
        createRedirectLink={createRedirectLink}
        updateRedirectLink={updateRedirectLink}
        deleteRedirectLink={deleteRedirectLink}
        createDigitalProduct={createDigitalProduct}
        updateDigitalProduct={updateDigitalProduct}
        deleteDigitalProduct={deleteDigitalProduct}
      />
    </div>
  );
}
