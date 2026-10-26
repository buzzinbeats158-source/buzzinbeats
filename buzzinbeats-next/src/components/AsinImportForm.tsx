"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AsinImportForm({ pageId, hasStoreId }: { pageId: number; hasStoreId: boolean }) {
  const router = useRouter();
  const [raw, setRaw] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    created?: { id: number; title: string; asin: string }[];
    failedAsins?: string[];
    invalidAsins?: string[];
    error?: string;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const asins = raw
      .split(/[\s,]+/)
      .map((a) => a.trim())
      .filter(Boolean)
      .slice(0, 10);

    if (asins.length === 0) return;

    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`/api/pages/${pageId}/products/auto-add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ asins }),
      });
      const data = await res.json();
      setResult(data);
      if (data.success && data.created?.length > 0) {
        setRaw("");
        router.refresh();
      }
    } catch (e) {
      setResult({ error: e instanceof Error ? e.message : "Something went wrong" });
    } finally {
      setLoading(false);
    }
  }

  if (!hasStoreId) {
    return (
      <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        Please add your Amazon Affiliate Store ID in{" "}
        <a href="/dashboard/settings" className="font-bold underline">
          Settings
        </a>{" "}
        before using Auto Add Product.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mb-4 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <label className="text-sm font-medium text-slate-700">Add via ASIN</label>
      <textarea
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        placeholder="Paste up to 10 ASINs — comma, space, or newline separated"
        rows={2}
        className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary"
      />
      <p className="text-[11px] text-slate-400">
        Tip: You can enter up to 10 ASINs. Paste comma, space, or line-separated ASINs for quick bulk add.
      </p>
      <button
        type="submit"
        disabled={loading || !raw.trim()}
        className="self-start rounded-lg bg-primary px-5 py-2 text-sm font-bold text-white hover:bg-primary/90 disabled:opacity-60"
      >
        {loading ? "Fetching from Amazon..." : "Auto Add Product(s)"}
      </button>

      {result && (
        <div className="mt-2 flex flex-col gap-1 text-xs">
          {result.error && <p className="font-medium text-red-600">{result.error}</p>}
          {result.created && result.created.length > 0 && (
            <p className="font-medium text-green-600">
              Added {result.created.length} product{result.created.length > 1 ? "s" : ""}: {result.created.map((c) => c.title).join(", ")}
            </p>
          )}
          {result.failedAsins && result.failedAsins.length > 0 && (
            <p className="font-medium text-red-500">Failed: {result.failedAsins.join("; ")}</p>
          )}
          {result.invalidAsins && result.invalidAsins.length > 0 && (
            <p className="font-medium text-amber-600">
              Invalid ASINs (must be exactly 10 characters): {result.invalidAsins.join(", ")}
            </p>
          )}
        </div>
      )}
    </form>
  );
}
