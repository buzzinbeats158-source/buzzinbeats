"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateSubscriptionSettingsAction, type PlanMatrixRow } from "@/lib/data/subscription-settings";

function BoolCell({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <td className="border-t border-slate-100 px-3 py-2 text-center">
      <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-primary" />
    </td>
  );
}

function NumberCell({ value, onChange, prefix }: { value: number | null; onChange: (v: number | null) => void; prefix?: string }) {
  return (
    <td className="border-t border-slate-100 px-3 py-2">
      <div className="flex items-center gap-1">
        {prefix && <span className="text-xs text-slate-400">{prefix}</span>}
        <input
          type="number"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
          className="w-full rounded-lg border border-slate-200 px-2 py-1 text-sm"
        />
      </div>
    </td>
  );
}

function SelectCell({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <td className="border-t border-slate-100 px-3 py-2">
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-lg border border-slate-200 px-2 py-1 text-sm">
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </td>
  );
}

function SectionRow({ label, colSpan }: { label: string; colSpan: number }) {
  return (
    <tr>
      <td colSpan={colSpan} className="bg-slate-50 px-3 py-2 text-[10px] font-black tracking-widest text-primary uppercase">
        {label}
      </td>
    </tr>
  );
}

const LINK_MONITORING_OPTIONS = [
  { value: "off", label: "Off" },
  { value: "basic", label: "Basic" },
  { value: "advanced", label: "Advanced" },
  { value: "advanced_realtime", label: "Advanced + Real-time" },
];

const SUPPORT_LEVEL_OPTIONS = [
  { value: "standard", label: "Standard" },
  { value: "priority", label: "Priority" },
  { value: "vip", label: "VIP" },
];

export default function PlanMatrixForm({ initialRows }: { initialRows: PlanMatrixRow[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(initialRows);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  function update(index: number, patch: Partial<PlanMatrixRow>) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  function handleSave() {
    setError(null);
    startTransition(async () => {
      try {
        await updateSubscriptionSettingsAction(rows);
        setSavedAt(new Date());
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to save.");
      }
    });
  }

  function handleReset() {
    setRows(initialRows);
  }

  const colSpan = rows.length + 1;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Plan Matrix</h1>
          <p className="text-sm text-slate-500">Configure and compare BuzzinBeats tiers.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isPending}
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary/90 disabled:opacity-60"
        >
          {isPending ? "Saving…" : "Save Changes"}
        </button>
      </div>

      {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-xs font-bold text-slate-500 uppercase">
                <th className="px-3 py-3">Features</th>
                {rows.map((r, i) => (
                  <th key={r.id} className="min-w-[160px] px-3 py-3">
                    <input
                      value={r.name}
                      onChange={(e) => update(i, { name: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm font-bold text-slate-800 normal-case"
                    />
                    <div className="mt-2 flex items-center gap-3 text-[10px] font-semibold normal-case">
                      <label className="flex items-center gap-1">
                        <input type="checkbox" checked={r.is_active} onChange={(e) => update(i, { is_active: e.target.checked })} className="accent-primary" />
                        Active
                      </label>
                      <label className="flex items-center gap-1">
                        <input type="checkbox" checked={r.is_popular} onChange={(e) => update(i, { is_popular: e.target.checked })} className="accent-primary" />
                        Popular
                      </label>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <SectionRow label="Pricing" colSpan={colSpan} />
              <tr>
                <td className="border-t border-slate-100 px-3 py-2 font-semibold text-slate-600">Monthly Price</td>
                {rows.map((r, i) => (
                  <NumberCell key={r.id} value={r.monthly_price} onChange={(v) => update(i, { monthly_price: v ?? 0 })} prefix="₹" />
                ))}
              </tr>
              <tr>
                <td className="border-t border-slate-100 px-3 py-2 font-semibold text-slate-600">Yearly Price</td>
                {rows.map((r, i) => (
                  <NumberCell key={r.id} value={r.yearly_price} onChange={(v) => update(i, { yearly_price: v })} prefix="₹" />
                ))}
              </tr>
              <tr>
                <td className="border-t border-slate-100 px-3 py-2 font-semibold text-slate-600">Yearly Discount %</td>
                {rows.map((r, i) => (
                  <NumberCell key={r.id} value={r.yearly_discount_percent} onChange={(v) => update(i, { yearly_discount_percent: v })} />
                ))}
              </tr>

              <SectionRow label="Page Controls" colSpan={colSpan} />
              <tr>
                <td className="border-t border-slate-100 px-3 py-2 font-semibold text-slate-600">Max Active Pages</td>
                {rows.map((r, i) => (
                  <NumberCell key={r.id} value={r.max_active_pages} onChange={(v) => update(i, { max_active_pages: v ?? 1 })} />
                ))}
              </tr>
              <tr>
                <td className="border-t border-slate-100 px-3 py-2 font-semibold text-slate-600">Extra Pages Toggle</td>
                {rows.map((r, i) => (
                  <BoolCell key={r.id} value={r.extra_pages_enabled} onChange={(v) => update(i, { extra_pages_enabled: v })} />
                ))}
              </tr>
              <tr>
                <td className="border-t border-slate-100 px-3 py-2 font-semibold text-slate-600">Extra Page Price</td>
                {rows.map((r, i) => (
                  <NumberCell key={r.id} value={r.extra_page_price} onChange={(v) => update(i, { extra_page_price: v })} prefix="₹" />
                ))}
              </tr>

              <SectionRow label="Product Controls" colSpan={colSpan} />
              <tr>
                <td className="border-t border-slate-100 px-3 py-2 font-semibold text-slate-600">Products Per Page</td>
                {rows.map((r, i) => (
                  <NumberCell key={r.id} value={r.products_per_page} onChange={(v) => update(i, { products_per_page: v ?? 1 })} />
                ))}
              </tr>
              <tr>
                <td className="border-t border-slate-100 px-3 py-2 font-semibold text-slate-600">Extra Products Toggle</td>
                {rows.map((r, i) => (
                  <BoolCell key={r.id} value={r.extra_products_enabled} onChange={(v) => update(i, { extra_products_enabled: v })} />
                ))}
              </tr>
              <tr>
                <td className="border-t border-slate-100 px-3 py-2 font-semibold text-slate-600">Extra Product Price</td>
                {rows.map((r, i) => (
                  <NumberCell key={r.id} value={r.extra_product_price} onChange={(v) => update(i, { extra_product_price: v })} prefix="₹" />
                ))}
              </tr>

              <SectionRow label="Visual Aesthetics" colSpan={colSpan} />
              {([1, 2, 3, 4, 5, 6] as const).map((n) => {
                const key = `template_${n}_enabled` as keyof PlanMatrixRow;
                return (
                  <tr key={n}>
                    <td className="border-t border-slate-100 px-3 py-2 font-semibold text-slate-600">Landing Template T{n}</td>
                    {rows.map((r, i) => (
                      <BoolCell key={r.id} value={r[key] as boolean} onChange={(v) => update(i, { [key]: v } as Partial<PlanMatrixRow>)} />
                    ))}
                  </tr>
                );
              })}

              <SectionRow label="Advanced Features" colSpan={colSpan} />
              {(
                [
                  ["auto_product_fetch", "Auto Product Fetch"],
                  ["branding_removal", "Branding Removal"],
                  ["bulk_asin_upload", "Bulk ASIN Upload"],
                  ["social_media_tags", "Social Media Tags"],
                  ["social_media_links", "Social Media Links"],
                  ["extra_custom_link", "Extra Custom Link"],
                  ["profile_on_landing", "Profile on Landing"],
                  ["product_reorder_highlight", "Product Reorder & Highlight"],
                ] as const
              ).map(([key, label]) => (
                <tr key={key}>
                  <td className="border-t border-slate-100 px-3 py-2 font-semibold text-slate-600">{label}</td>
                  {rows.map((r, i) => (
                    <BoolCell key={r.id} value={r[key] as boolean} onChange={(v) => update(i, { [key]: v } as Partial<PlanMatrixRow>)} />
                  ))}
                </tr>
              ))}

              <SectionRow label="Operations" colSpan={colSpan} />
              <tr>
                <td className="border-t border-slate-100 px-3 py-2 font-semibold text-slate-600">Link Monitoring</td>
                {rows.map((r, i) => (
                  <SelectCell key={r.id} value={r.link_monitoring_level} onChange={(v) => update(i, { link_monitoring_level: v })} options={LINK_MONITORING_OPTIONS} />
                ))}
              </tr>
              <tr>
                <td className="border-t border-slate-100 px-3 py-2 font-semibold text-slate-600">Support Level</td>
                {rows.map((r, i) => (
                  <SelectCell key={r.id} value={r.support_level} onChange={(v) => update(i, { support_level: v })} options={SUPPORT_LEVEL_OPTIONS} />
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-slate-200 p-4 text-xs text-slate-400">
          <button onClick={handleReset} className="flex items-center gap-1 font-semibold text-slate-500 hover:text-slate-700">
            <span className="material-symbols-outlined text-sm">refresh</span> Reset All Rows
          </button>
          <span>{savedAt ? `Last updated: ${savedAt.toLocaleTimeString()}` : "Not saved yet"}</span>
        </div>
      </div>
    </div>
  );
}
