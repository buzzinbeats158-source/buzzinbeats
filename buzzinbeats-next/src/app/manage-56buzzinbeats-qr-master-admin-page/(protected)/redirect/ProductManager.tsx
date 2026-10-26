"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  autoAddRedirectProductsAction,
  toggleRedirectProductAction,
  removeRedirectProductAction,
  reorderRedirectProductsAction,
} from "@/lib/data/redirect-page";

type Product = {
  id: number;
  amazon_asin: string | null;
  title: string;
  image_url: string | null;
  price: number | null;
  is_active: boolean;
};

export default function ProductManager({
  section,
  title,
  icon,
  products,
}: {
  section: "trending" | "flash_deals";
  title: string;
  icon: string;
  products: Product[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(products);
  const [asinInput, setAsinInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  function handleAdd() {
    const asins = asinInput
      .split(/[\s,]+/)
      .map((a) => a.trim())
      .filter(Boolean)
      .slice(0, 10);
    if (asins.length === 0) return;

    setMessage(null);
    startTransition(async () => {
      try {
        const result = await autoAddRedirectProductsAction(asins, section);
        setAsinInput("");
        let msg = `${result.created.length} product${result.created.length !== 1 ? "s" : ""} added successfully.`;
        if (result.failed.length) msg += ` ${result.failed.length} ASIN${result.failed.length !== 1 ? "s" : ""} failed: ${result.failed.join(", ")}`;
        setMessage(msg);
        router.refresh();
      } catch (e) {
        setMessage(e instanceof Error ? e.message : "Failed to add products.");
      }
    });
  }

  function handleToggle(id: number, current: boolean) {
    startTransition(async () => {
      await toggleRedirectProductAction(id, current);
      router.refresh();
    });
  }

  function handleRemove(id: number) {
    if (!confirm("Remove this product?")) return;
    setItems((prev) => prev.filter((p) => p.id !== id));
    startTransition(async () => {
      await removeRedirectProductAction(id);
      router.refresh();
    });
  }

  function handleDrop(dropIndex: number) {
    if (dragIndex === null || dragIndex === dropIndex) return;
    const next = [...items];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(dropIndex, 0, moved);
    setItems(next);
    setDragIndex(null);
    startTransition(async () => {
      await reorderRedirectProductsAction(next.map((p) => p.id));
    });
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">{icon}</span>
        <h3 className="font-bold text-slate-900">{title}</h3>
      </div>

      <div className="mb-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
        <div className="mb-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-base text-primary">auto_awesome</span>
          <span className="text-sm font-bold text-slate-700">Auto Add Products</span>
        </div>
        <p className="mb-3 text-xs text-slate-500">Fetch product details using Amazon ASIN — up to 10 at once.</p>
        <div className="flex gap-2">
          <input
            value={asinInput}
            onChange={(e) => setAsinInput(e.target.value)}
            placeholder="Paste ASINs — comma, space, or line-separated"
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <button
            onClick={handleAdd}
            disabled={isPending || !asinInput.trim()}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary/90 disabled:opacity-60"
          >
            + Add
          </button>
        </div>
        {message && <p className="mt-2 text-xs text-slate-600">{message}</p>}
      </div>

      <p className="mb-2 text-xs font-bold text-slate-400 uppercase">Manage {title} ({items.length} items)</p>
      <div className="space-y-2">
        {items.map((p, i) => (
          <div
            key={p.id}
            draggable
            onDragStart={() => setDragIndex(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(i)}
            className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-2.5"
          >
            <span className="material-symbols-outlined cursor-grab text-slate-300">drag_handle</span>
            {p.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.image_url} alt="" className="h-10 w-10 rounded object-cover" />
            ) : (
              <div className="h-10 w-10 rounded bg-slate-100" />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-800">{p.title}</p>
              {p.amazon_asin && <p className="text-xs text-slate-400">ASIN: {p.amazon_asin}</p>}
            </div>
            <button
              onClick={() => handleToggle(p.id, p.is_active)}
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${p.is_active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}
            >
              {p.is_active ? "Active" : "Hidden"}
            </button>
            <button onClick={() => handleRemove(p.id)} className="text-slate-300 hover:text-red-500">
              <span className="material-symbols-outlined text-lg">delete</span>
            </button>
          </div>
        ))}
        {items.length === 0 && <p className="py-4 text-center text-sm text-slate-400">No products yet.</p>}
      </div>
    </div>
  );
}
