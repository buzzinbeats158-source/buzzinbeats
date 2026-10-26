"use client";

import { useState } from "react";
import ProductClassicGrid from "@/components/ProductClassicGrid";
import RedirectLinkSection from "@/components/RedirectLinkSection";
import DigitalProductSection from "@/components/DigitalProductSection";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = any;

type PendingDelete = {
  kind: "product" | "redirect_link" | "digital_product";
  id: number;
  title: string;
};

function CardActionButton({
  icon,
  title,
  variant,
  onClick,
}: {
  icon: string;
  title: string;
  variant: "edit" | "delete";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      data-preview-action
      title={title}
      onClick={onClick}
      className={`flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-500 shadow-sm backdrop-blur transition-colors hover:text-white ${
        variant === "edit" ? "hover:border-primary hover:bg-primary" : "hover:border-red-500 hover:bg-red-500"
      }`}
    >
      <span className="material-symbols-outlined text-[18px]">{icon}</span>
    </button>
  );
}

/**
 * Renders the same section components the public `[username]/[slug]` page
 * uses, so this preview can't visually drift from the real thing. Clicks
 * are swallowed at capture time — the buy/visit/checkout controls carry
 * real hrefs and side effects on the live page, which must stay inert here
 * — except for the edit/delete overlay buttons ([data-preview-action]),
 * which mirror what the "Added Content" list below already does.
 */
export default function ContentPreviewPanel({
  pageTitle,
  pageDescription,
  products,
  redirectLinks,
  digitalProducts,
  savedProducts,
  savedRedirectLinks,
  savedDigitalProducts,
  onEditProduct,
  onEditLink,
  onEditDigitalProduct,
  deleteProduct,
  deleteRedirectLink,
  deleteDigitalProduct,
}: {
  pageTitle: string;
  pageDescription: string | null;
  products: AnyRow[];
  redirectLinks: AnyRow[];
  digitalProducts: AnyRow[];
  /** Pristine (unmerged) saved rows — edit hands the DB row to the form, never the preview's draft-overridden copy. */
  savedProducts: AnyRow[];
  savedRedirectLinks: AnyRow[];
  savedDigitalProducts: AnyRow[];
  onEditProduct: (product: AnyRow) => void;
  onEditLink: (link: AnyRow) => void;
  onEditDigitalProduct: (product: AnyRow) => void;
  deleteProduct: (id: number) => Promise<void>;
  deleteRedirectLink: (id: number) => Promise<void>;
  deleteDigitalProduct: (id: number) => Promise<void>;
}) {
  const isEmpty = products.length === 0 && redirectLinks.length === 0 && digitalProducts.length === 0;
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const [deleting, setDeleting] = useState(false);

  function findSaved(list: AnyRow[], id: number) {
    return list.find((row) => row.id === id) ?? null;
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      if (pendingDelete.kind === "product") await deleteProduct(pendingDelete.id);
      else if (pendingDelete.kind === "redirect_link") await deleteRedirectLink(pendingDelete.id);
      else await deleteDigitalProduct(pendingDelete.id);
      setPendingDelete(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <h2 className="text-sm font-bold text-slate-900">Preview</h2>
        <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Live Preview
        </span>
      </div>

      <div
        className="flex-1 overflow-y-auto bg-white lg:max-h-[calc(100vh-11rem)]"
        onClickCapture={(e) => {
          if ((e.target as HTMLElement).closest("[data-preview-action]")) return;
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <div className="mx-auto max-w-3xl px-6 py-10">
          <header className="mb-10 text-center">
            <h1 className="mb-3 text-2xl font-black tracking-tight text-slate-900 lg:text-4xl">{pageTitle}</h1>
            {pageDescription && pageDescription.trim() !== "" && (
              <p className="mx-auto max-w-xl text-sm font-medium leading-relaxed text-slate-500">{pageDescription}</p>
            )}
          </header>

          <div className="space-y-14">
            {products.length > 0 && (
              <ProductClassicGrid
                products={products}
                renderActions={(product) =>
                  product.id === -1 ? null : (
                    <>
                      <CardActionButton
                        icon="edit"
                        title="Edit product"
                        variant="edit"
                        onClick={() => {
                          const saved = findSaved(savedProducts, product.id);
                          if (saved) onEditProduct(saved);
                        }}
                      />
                      <CardActionButton
                        icon="delete"
                        title="Delete product"
                        variant="delete"
                        onClick={() => setPendingDelete({ kind: "product", id: product.id, title: product.title })}
                      />
                    </>
                  )
                }
              />
            )}
            <RedirectLinkSection
              items={redirectLinks}
              renderActions={(link) =>
                link.id === -1 ? null : (
                  <>
                    <CardActionButton
                      icon="edit"
                      title="Edit redirect link"
                      variant="edit"
                      onClick={() => {
                        const saved = findSaved(savedRedirectLinks, link.id);
                        if (saved) onEditLink(saved);
                      }}
                    />
                    <CardActionButton
                      icon="delete"
                      title="Delete redirect link"
                      variant="delete"
                      onClick={() => setPendingDelete({ kind: "redirect_link", id: link.id, title: link.title })}
                    />
                  </>
                )
              }
            />
            <DigitalProductSection
              items={digitalProducts}
              renderActions={(product) =>
                product.id === -1 ? null : (
                  <>
                    <CardActionButton
                      icon="edit"
                      title="Edit digital product"
                      variant="edit"
                      onClick={() => {
                        const saved = findSaved(savedDigitalProducts, product.id);
                        if (saved) onEditDigitalProduct(saved);
                      }}
                    />
                    <CardActionButton
                      icon="delete"
                      title="Delete digital product"
                      variant="delete"
                      onClick={() => setPendingDelete({ kind: "digital_product", id: product.id, title: product.title })}
                    />
                  </>
                )
              }
            />
          </div>

          {isEmpty && (
            <div className="rounded-[2rem] border border-dashed border-slate-200 bg-slate-50 py-16 text-center">
              <span className="material-symbols-outlined mb-3 text-5xl text-slate-300">visibility</span>
              <p className="text-sm font-bold text-slate-500">Nothing to preview yet.</p>
              <p className="mt-1 text-xs text-slate-400">Add content on the left to see it appear here.</p>
            </div>
          )}
        </div>
      </div>

      {pendingDelete && (
        <ConfirmDeleteModal
          title="Delete this content?"
          itemName={pendingDelete.title}
          pending={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}
