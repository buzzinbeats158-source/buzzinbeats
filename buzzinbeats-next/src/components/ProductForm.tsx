"use client";

import { useState } from "react";
import { publicStorageUrl } from "@/lib/storage";
import ImageCropField from "@/components/ImageCropField";
import RichTextEditor from "@/components/RichTextEditor";

type Country = { id: number; name: string; code: string; currency_code: string | null; currency_symbol: string | null };
type StoreOption = { name: string };

type Product = {
  id: number;
  title: string;
  description: string | null;
  starting_price: number | null;
  show_price: boolean;
  primary_country_id: number | null;
  image_path: string | null;
  link: string;
  store_platform: string | null;
};

const DEFAULT_PLATFORMS = ["Shopify", "Amazon", "Flipkart", "Meesho", "Myntra", "Etsy", "Walmart", "eBay", "Ajio"];

function parseJsonArray(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function ProductForm({
  pageId,
  countries,
  userStores,
  defaultShowPrice,
  editing,
  onCancelEdit,
  createAction,
  updateAction,
}: {
  pageId: number;
  countries: Country[];
  userStores: StoreOption[];
  defaultShowPrice: boolean;
  editing: Product | null;
  onCancelEdit: () => void;
  createAction: (formData: FormData) => Promise<void>;
  updateAction: (formData: FormData) => Promise<void>;
}) {
  const india = countries.find((c) => c.code === "IN") ?? countries[0];
  const editingLinks = editing ? parseJsonArray(editing.link) : [];
  const editingPlatforms = editing ? parseJsonArray(editing.store_platform) : [];

  const [title, setTitle] = useState(editing?.title ?? "");
  const [countryId, setCountryId] = useState(editing?.primary_country_id ?? india?.id ?? 0);
  const [rows, setRows] = useState(
    editingLinks.length > 0
      ? editingLinks.map((link, i) => ({ platform: editingPlatforms[i] || DEFAULT_PLATFORMS[1], link }))
      : [{ platform: DEFAULT_PLATFORMS[1], link: "" }],
  );
  const [submitting, setSubmitting] = useState(false);
  const [resetCount, setResetCount] = useState(0);

  const selectedCountry = countries.find((c) => c.id === countryId);
  const storeOptions = [...DEFAULT_PLATFORMS, ...userStores.map((s) => s.name)];

  function updateRow(i: number, field: "platform" | "link", value: string) {
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setSubmitting(true);
    const formData = new FormData(form);
    formData.set("page_id", String(pageId));
    formData.set("currency_code", selectedCountry?.currency_code ?? "INR");
    formData.set("currency_symbol", selectedCountry?.currency_symbol ?? "₹");
    formData.set("primary_country_name", selectedCountry?.name ?? "");
    try {
      if (editing) {
        formData.set("id", String(editing.id));
        await updateAction(formData);
        onCancelEdit();
      } else {
        await createAction(formData);
        form.reset();
        setResetCount((n) => n + 1);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      key={editing?.id ?? `new-${resetCount}`}
      onSubmit={handleSubmit}
      className="mb-4 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div>
        <div className="mb-1 flex items-center justify-between">
          <label className="block text-sm font-medium text-slate-700">Product Title</label>
          <span className="text-[10px] text-slate-400">{title.length}/50</span>
        </div>
        <input
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value.slice(0, 50))}
          maxLength={50}
          required
          placeholder="e.g. Limited Edition Vinyl"
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
        <RichTextEditor name="description" defaultValue={editing?.description ?? ""} placeholder="Briefly describe your product..." />
      </div>

      <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex flex-col items-end gap-6 md:flex-row">
          <label className="flex items-center gap-2 pb-2">
            <input type="checkbox" name="show_price" defaultChecked={editing?.show_price ?? defaultShowPrice} className="h-5 w-9 accent-primary" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Show price</span>
          </label>

          <div className="w-full flex-1">
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Currency</label>
            <select
              name="primary_country_id"
              value={countryId}
              onChange={(e) => setCountryId(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary"
            >
              {countries.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.currency_code ? ` (${c.currency_code})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full flex-1">
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Starting Price</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-sm text-slate-400">
                {selectedCountry?.currency_symbol ?? "$"}
              </span>
              <input
                name="starting_price"
                type="number"
                min="0"
                step="0.01"
                defaultValue={editing?.starting_price ?? ""}
                placeholder="e.g. 199.00"
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-7 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>
        <p className="border-t border-slate-100 pt-3 text-[10px] italic leading-relaxed text-slate-500">
          <span className="material-symbols-outlined align-middle text-[12px]">info</span> If you are using affiliate
          marketing, it&apos;s better not to show prices, as they may vary across sites.
        </p>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-slate-700">Store Links</label>
        {rows.map((row, i) => (
          <div key={i} className="flex items-start gap-3">
            <select
              name="store_platform[]"
              value={row.platform}
              onChange={(e) => updateRow(i, "platform", e.target.value)}
              required
              className="w-[140px] shrink-0 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary"
            >
              {storeOptions.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <div className="flex w-full flex-1 gap-2">
              <input
                name="product_link[]"
                type="url"
                value={row.link}
                onChange={(e) => updateRow(i, "link", e.target.value)}
                required
                placeholder="https://..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary"
              />
              {rows.length > 1 && (
                <button
                  type="button"
                  onClick={() => setRows((r) => r.filter((_, idx) => idx !== i))}
                  className="shrink-0 self-center rounded p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              )}
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setRows((r) => [...r, { platform: DEFAULT_PLATFORMS[0], link: "" }])}
          className="flex items-center gap-1 text-xs font-bold text-primary hover:underline"
        >
          <span className="material-symbols-outlined text-sm">add_circle</span> Add Another Link
        </button>
      </div>

      <ImageCropField
        name="image"
        label="Product Image"
        aspectRatio={1}
        existingImageUrl={editing?.image_path ? publicStorageUrl(editing.image_path) : null}
        required={!editing}
      />

      <div className="mt-1 flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="self-start rounded-lg bg-primary px-5 py-2 text-sm font-bold text-white hover:bg-primary/90 disabled:opacity-60"
        >
          {submitting ? "Saving..." : editing ? "Save Changes" : "Add product"}
        </button>
        {editing && (
          <button type="button" onClick={onCancelEdit} className="text-sm font-medium text-primary hover:text-primary/80">
            Cancel Edit
          </button>
        )}
      </div>
    </form>
  );
}
