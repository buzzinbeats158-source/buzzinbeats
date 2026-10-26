"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import AsinImportForm from "@/components/AsinImportForm";
import ProductForm from "@/components/ProductForm";
import RedirectLinkForm from "@/components/RedirectLinkForm";
import DigitalProductForm from "@/components/DigitalProductForm";
import AddedContentList from "@/components/AddedContentList";
import ContentPreviewPanel from "@/components/ContentPreviewPanel";
import { useDraftObjectUrl, useLiveFormDraft } from "@/lib/use-live-form-draft";

const TABS = [
  { key: "product", label: "Products", icon: "inventory_2" },
  { key: "redirect_link", label: "Product Redirect Link", icon: "open_in_new" },
  { key: "digital_product", label: "Digital Products", icon: "cloud_download" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = any;

const DESKTOP_QUERY = "(min-width: 1024px)";

function subscribeToDesktopQuery(onChange: () => void) {
  const mq = window.matchMedia(DESKTOP_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getIsDesktopSnapshot() {
  return window.matchMedia(DESKTOP_QUERY).matches;
}

export default function PageContentManager({
  pageId,
  pageTitle,
  pageDescription,
  hasAmazonStoreId,
  countries,
  userStores,
  defaultShowPrice,
  products,
  redirectLinks,
  digitalProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  createRedirectLink,
  updateRedirectLink,
  deleteRedirectLink,
  createDigitalProduct,
  updateDigitalProduct,
  deleteDigitalProduct,
}: {
  pageId: number;
  pageTitle: string;
  pageDescription: string | null;
  hasAmazonStoreId: boolean;
  countries: AnyRow[];
  userStores: AnyRow[];
  defaultShowPrice: boolean;
  products: AnyRow[];
  redirectLinks: AnyRow[];
  digitalProducts: AnyRow[];
  createProduct: (formData: FormData) => Promise<void>;
  updateProduct: (formData: FormData) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
  createRedirectLink: (formData: FormData) => Promise<void>;
  updateRedirectLink: (formData: FormData) => Promise<void>;
  deleteRedirectLink: (id: number) => Promise<void>;
  createDigitalProduct: (formData: FormData) => Promise<void>;
  updateDigitalProduct: (formData: FormData) => Promise<void>;
  deleteDigitalProduct: (id: number) => Promise<void>;
}) {
  const [active, setActive] = useState<TabKey>("product");
  const [editingProduct, setEditingProduct] = useState<AnyRow | null>(null);
  const [editingLink, setEditingLink] = useState<AnyRow | null>(null);
  const [editingDigitalProduct, setEditingDigitalProduct] = useState<AnyRow | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const productSectionRef = useRef<HTMLDivElement>(null);
  const linkSectionRef = useRef<HTMLDivElement>(null);
  const digitalSectionRef = useRef<HTMLDivElement>(null);

  function goEdit(tab: TabKey, setter: (row: AnyRow) => void, row: AnyRow) {
    setEditingProduct(null);
    setEditingLink(null);
    setEditingDigitalProduct(null);
    setter(row);
    setActive(tab);
    requestAnimationFrame(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  // --- Live preview: mirror the currently-typed (unsaved) form state -----

  const productDraft = useLiveFormDraft(productSectionRef, (fd) => {
    const title = String(fd.get("title") ?? "").trim();
    if (!title) return null;
    const countryId = Number(fd.get("primary_country_id") ?? 0);
    const country = countries.find((c) => c.id === countryId);
    const priceRaw = fd.get("starting_price");
    const image = fd.get("image");
    return {
      title,
      description: String(fd.get("description") ?? ""),
      show_price: fd.get("show_price") != null,
      starting_price: priceRaw ? Number(priceRaw) : null,
      currency_symbol: country?.currency_symbol ?? "₹",
      store_platform: fd.getAll("store_platform[]").map(String),
      link: fd.getAll("product_link[]").map(String),
      imageFile: image instanceof File ? image : null,
    };
  });
  const productDraftImageUrl = useDraftObjectUrl(productDraft?.imageFile);

  const linkDraft = useLiveFormDraft(linkSectionRef, (fd) => {
    const title = String(fd.get("title") ?? "").trim();
    if (!title) return null;
    const image = fd.get("image");
    return {
      title,
      description: String(fd.get("description") ?? ""),
      button_text: String(fd.get("button_text") ?? "") || null,
      open_in_new_tab: fd.get("open_in_new_tab") != null,
      imageFile: image instanceof File ? image : null,
    };
  });
  const linkDraftImageUrl = useDraftObjectUrl(linkDraft?.imageFile);

  const digitalDraft = useLiveFormDraft(digitalSectionRef, (fd) => {
    const title = String(fd.get("title") ?? "").trim();
    if (!title) return null;
    const priceRaw = fd.get("price");
    const image = fd.get("cover_image");
    return {
      title,
      description: String(fd.get("description") ?? ""),
      price: priceRaw ? Number(priceRaw) : 0,
      imageFile: image instanceof File ? image : null,
    };
  });
  const digitalDraftImageUrl = useDraftObjectUrl(digitalDraft?.imageFile);

  const previewProducts = useMemo(() => {
    if (!productDraft) return products;
    const overrides: AnyRow = {
      title: productDraft.title,
      description: productDraft.description,
      show_price: productDraft.show_price,
      starting_price: productDraft.starting_price,
      currency_symbol: productDraft.currency_symbol,
      store_platform: productDraft.store_platform,
      link: productDraft.link,
      ...(productDraftImageUrl ? { image_path: productDraftImageUrl } : {}),
    };
    if (editingProduct) {
      return products.map((p) => (p.id === editingProduct.id ? { ...p, ...overrides } : p));
    }
    return [...products, { id: -1, image_path: null, ...overrides }];
  }, [products, productDraft, productDraftImageUrl, editingProduct]);

  const previewRedirectLinks = useMemo(() => {
    if (!linkDraft) return redirectLinks;
    const overrides: AnyRow = {
      title: linkDraft.title,
      description: linkDraft.description,
      button_text: linkDraft.button_text,
      open_in_new_tab: linkDraft.open_in_new_tab,
      ...(linkDraftImageUrl ? { image_path: linkDraftImageUrl } : {}),
    };
    if (editingLink) {
      return redirectLinks.map((l) => (l.id === editingLink.id ? { ...l, ...overrides } : l));
    }
    return [...redirectLinks, { id: -1, image_path: null, ...overrides }];
  }, [redirectLinks, linkDraft, linkDraftImageUrl, editingLink]);

  const previewDigitalProducts = useMemo(() => {
    if (!digitalDraft) return digitalProducts;
    const overrides: AnyRow = {
      title: digitalDraft.title,
      description: digitalDraft.description,
      price: digitalDraft.price,
      ...(digitalDraftImageUrl ? { cover_image_path: digitalDraftImageUrl } : {}),
    };
    if (editingDigitalProduct) {
      return digitalProducts.map((d) => (d.id === editingDigitalProduct.id ? { ...d, ...overrides } : d));
    }
    return [
      ...digitalProducts,
      { id: -1, cover_image_path: null, delivery_note: null, currency_symbol: "₹", ...overrides },
    ];
  }, [digitalProducts, digitalDraft, digitalDraftImageUrl, editingDigitalProduct]);

  // --- Resizable split between the editor and the preview ----------------

  const splitRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const [leftPct, setLeftPct] = useState(52);
  const isDesktop = useSyncExternalStore(subscribeToDesktopQuery, getIsDesktopSnapshot, () => false);

  useEffect(() => {
    function handleMove(e: PointerEvent) {
      if (!draggingRef.current || !splitRef.current) return;
      const rect = splitRef.current.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      setLeftPct(Math.min(75, Math.max(25, pct)));
    }
    function handleUp() {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, []);

  function startDrag() {
    draggingRef.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }

  return (
    <div ref={splitRef} className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-0">
      <div className="min-w-0 flex-1 lg:flex-none" style={isDesktop ? { flexBasis: `${leftPct}%` } : undefined}>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div ref={formRef} className="border-b border-slate-100 p-6">
            <h2 className="text-lg font-bold text-slate-900">Content</h2>
            <p className="text-xs text-slate-500">Add products, redirect links, and digital products to this page.</p>
          </div>

          <div className="flex border-b border-slate-200 bg-slate-50">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActive(tab.key)}
                className={`flex flex-1 items-center justify-center gap-2 px-4 py-3.5 text-sm transition-all ${
                  active === tab.key ? "border-b-2 border-primary bg-white font-bold text-primary" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <span className="material-symbols-outlined text-sm">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            <div ref={productSectionRef} className={active === "product" ? "" : "hidden"}>
              {!editingProduct && (
                <div className="mb-5 border-b border-slate-100 pb-5">
                  <p className="mb-3 text-xs text-slate-500">
                    Choose how you&apos;d like to import this product — enter it manually or auto-fetch it from Amazon by ASIN.
                  </p>
                  <AsinImportForm pageId={pageId} hasStoreId={hasAmazonStoreId} />
                </div>
              )}
              <ProductForm
                pageId={pageId}
                countries={countries}
                userStores={userStores}
                defaultShowPrice={defaultShowPrice}
                editing={editingProduct}
                onCancelEdit={() => setEditingProduct(null)}
                createAction={createProduct}
                updateAction={updateProduct}
              />
            </div>

            <div ref={linkSectionRef} className={active === "redirect_link" ? "" : "hidden"}>
              <RedirectLinkForm
                pageId={pageId}
                editing={editingLink}
                onCancelEdit={() => setEditingLink(null)}
                createAction={createRedirectLink}
                updateAction={updateRedirectLink}
              />
            </div>

            <div ref={digitalSectionRef} className={active === "digital_product" ? "" : "hidden"}>
              <DigitalProductForm
                pageId={pageId}
                editing={editingDigitalProduct}
                onCancelEdit={() => setEditingDigitalProduct(null)}
                createAction={createDigitalProduct}
                updateAction={updateDigitalProduct}
              />
            </div>
          </div>
        </div>

        <AddedContentList
          products={products}
          redirectLinks={redirectLinks}
          digitalProducts={digitalProducts}
          onEditProduct={(p) => goEdit("product", setEditingProduct, p)}
          onEditLink={(l) => goEdit("redirect_link", setEditingLink, l)}
          onEditDigitalProduct={(d) => goEdit("digital_product", setEditingDigitalProduct, d)}
          deleteProduct={deleteProduct}
          deleteRedirectLink={deleteRedirectLink}
          deleteDigitalProduct={deleteDigitalProduct}
        />
      </div>

      {isDesktop && (
        <div
          role="separator"
          aria-orientation="vertical"
          onPointerDown={startDrag}
          className="group relative mx-3 hidden w-2 shrink-0 cursor-col-resize select-none items-stretch justify-center self-stretch lg:flex"
        >
          <div className="w-px bg-slate-200 transition-colors group-hover:bg-primary/50" />
          <div className="absolute inset-y-0 my-auto h-10 w-1.5 rounded-full bg-slate-300 transition-colors group-hover:bg-primary" />
        </div>
      )}

      <div className="min-w-0 flex-1 lg:sticky lg:top-4 lg:flex-none" style={isDesktop ? { flexBasis: `${100 - leftPct}%` } : undefined}>
        <ContentPreviewPanel
          pageTitle={pageTitle}
          pageDescription={pageDescription}
          products={previewProducts}
          redirectLinks={previewRedirectLinks}
          digitalProducts={previewDigitalProducts}
          savedProducts={products}
          savedRedirectLinks={redirectLinks}
          savedDigitalProducts={digitalProducts}
          onEditProduct={(p) => goEdit("product", setEditingProduct, p)}
          onEditLink={(l) => goEdit("redirect_link", setEditingLink, l)}
          onEditDigitalProduct={(d) => goEdit("digital_product", setEditingDigitalProduct, d)}
          deleteProduct={deleteProduct}
          deleteRedirectLink={deleteRedirectLink}
          deleteDigitalProduct={deleteDigitalProduct}
        />
      </div>
    </div>
  );
}
