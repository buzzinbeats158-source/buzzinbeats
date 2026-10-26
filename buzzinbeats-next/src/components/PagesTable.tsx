"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";

type PageRow = {
  id: number;
  page_id: string | null;
  serial_number: number | null;
  title: string;
  description: string | null;
  slug: string;
  status: string;
  is_published: boolean;
  productsCount: number;
  redirectLinksCount: number;
  digitalProductsCount: number;
  qrVersion: string;
};

export default function PagesTable({
  pages,
  username,
  planLimit,
  initialActiveCount,
  togglePageStatus,
  activateAll,
  deactivateAll,
}: {
  pages: PageRow[];
  username: string;
  planLimit: number;
  initialActiveCount: number;
  togglePageStatus: (pageId: number, status: "active" | "inactive") => Promise<{ status: string }>;
  activateAll: () => Promise<void>;
  deactivateAll: () => Promise<void>;
}) {
  const [search, setSearch] = useState("");
  const [statuses, setStatuses] = useState<Record<number, string>>(() =>
    Object.fromEntries(pages.map((p) => [p.id, p.status])),
  );
  const [activeCount, setActiveCount] = useState(initialActiveCount);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [bulkPending, setBulkPending] = useState<"activate" | "deactivate" | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return pages;
    return pages.filter((p) => p.title.toLowerCase().includes(q) || (p.page_id ?? "").toLowerCase().includes(q));
  }, [search, pages]);

  function handleToggle(page: PageRow, checked: boolean) {
    const prevStatus = statuses[page.id];
    const nextStatus = checked ? "active" : "inactive";
    setStatuses((s) => ({ ...s, [page.id]: nextStatus }));
    setActiveCount((c) => c + (checked ? 1 : -1));
    setError(null);

    startTransition(async () => {
      try {
        await togglePageStatus(page.id, nextStatus);
      } catch (err) {
        setStatuses((s) => ({ ...s, [page.id]: prevStatus }));
        setActiveCount((c) => c + (checked ? -1 : 1));
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  async function handleActivateAll() {
    if (!confirm("This will activate your most recent pages within your subscription limit. Continue?")) return;
    setBulkPending("activate");
    setError(null);
    try {
      await activateAll();
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to activate pages.");
      setBulkPending(null);
    }
  }

  async function handleDeactivateAll() {
    if (!confirm("This will deactivate all your pages. Continue?")) return;
    setBulkPending("deactivate");
    setError(null);
    try {
      await deactivateAll();
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to deactivate pages.");
      setBulkPending(null);
    }
  }

  return (
    <div>
      {/* Subscription usage banner */}
      <div className="mb-6 flex items-center gap-3">
        {planLimit === 0 ? (
          <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-2 text-sm font-medium text-red-600">
            <span className="material-symbols-outlined text-base">warning</span>
            No active subscription — all pages are OFF.
            <Link href="/profile/subscription" className="ml-2 font-bold underline hover:text-red-800">
              View plans
            </Link>
          </div>
        ) : (
          <div
            className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium ${
              planLimit !== Infinity && activeCount >= planLimit
                ? "border-orange-200 bg-orange-50 text-orange-700"
                : "border-green-100 bg-green-50 text-green-700"
            }`}
          >
            <span className="material-symbols-outlined text-base">
              {planLimit !== Infinity && activeCount >= planLimit ? "info" : "check_circle"}
            </span>
            <span>
              <strong>{activeCount}</strong> of <strong>{planLimit === Infinity ? "unlimited" : planLimit}</strong> pages active
            </span>
            {planLimit !== Infinity && activeCount >= planLimit && (
              <>
                <span className="mx-1">&middot;</span>
                <Link href="/profile/subscription" className="font-bold underline hover:text-orange-900">
                  Upgrade to activate more
                </Link>
              </>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <span className="material-symbols-outlined shrink-0 text-base">error</span>
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-700">
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-50 bg-gray-50/50 p-6">
          <div className="relative w-72">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl text-gray-400">search</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm focus:border-primary focus:ring-primary"
              placeholder="Search pages..."
              type="text"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleActivateAll}
              disabled={planLimit === 0 || bulkPending !== null}
              className="flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-green-700 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-base">toggle_on</span>
              {bulkPending === "activate" ? "Activating…" : "Activate All"}
            </button>
            <button
              onClick={handleDeactivateAll}
              disabled={bulkPending !== null}
              className="flex items-center gap-1.5 rounded-lg bg-red-500 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-red-600 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-base">toggle_off</span>
              {bulkPending === "deactivate" ? "Deactivating…" : "Deactivate All"}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 text-xs font-bold uppercase tracking-wider text-gray-500">
                <th className="w-16 px-6 py-4 text-center">Page No</th>
                <th className="px-6 py-4">Page Title</th>
                <th className="px-6 py-4">Content</th>
                <th className="px-6 py-4">QR Code</th>
                <th className="px-6 py-4 text-right">Actions</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((page) => {
                const status = statuses[page.id];
                const publicHref = `/${username}/${page.slug}`;
                return (
                  <tr key={page.id} className="group transition-colors hover:bg-orange-50/30">
                    <td className="px-6 py-5 text-center text-sm font-bold text-gray-400">
                      {page.page_id ?? `P${page.serial_number ?? page.id}`}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-800">{page.title}</span>
                        <span className="text-xs font-medium text-primary/60">
                          {(page.description ?? "").length > 30 ? `${page.description!.slice(0, 30)}…` : page.description}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-0.5 text-xs font-bold text-gray-600">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px] text-primary">inventory_2</span>
                          {page.productsCount} products
                        </span>
                        {page.redirectLinksCount > 0 && (
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px] text-primary">open_in_new</span>
                            {page.redirectLinksCount} redirects
                          </span>
                        )}
                        {page.digitalProductsCount > 0 && (
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px] text-primary">cloud_download</span>
                            {page.digitalProductsCount} digital
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 rounded border border-slate-200 bg-white p-1 shadow-sm">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={`/api/pages/${page.id}/qr-code?v=${page.qrVersion}`} className="h-8 w-8" alt="QR" />
                        </div>
                        <a
                          href={`/api/pages/${page.id}/qr-code`}
                          className="download-qr-png flex w-fit items-center gap-1.5 rounded-lg bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-600 transition-colors hover:bg-orange-100"
                        >
                          <span className="material-symbols-outlined text-sm">download</span>
                          Download
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={publicHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 rounded-lg border border-orange-200 bg-orange-100/50 px-3 py-1.5 text-xs font-bold text-orange-600 transition-colors hover:bg-orange-100"
                          title="Open public page in new tab"
                        >
                          <span className="material-symbols-outlined text-sm">open_in_new</span>
                          View
                        </a>
                        <a
                          href={`/dashboard/pages/${page.id}`}
                          className="flex items-center gap-1.5 rounded-lg bg-primary/5 px-3 py-1.5 text-xs font-bold text-primary transition-colors hover:bg-primary/10"
                        >
                          <span className="material-symbols-outlined text-sm">tune</span>
                          Continue Editing
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="flex flex-col items-center gap-1.5">
                        <label className="relative inline-flex cursor-pointer items-center justify-center">
                          <input
                            type="checkbox"
                            className="peer sr-only"
                            checked={status === "active"}
                            disabled={pending}
                            onChange={(e) => handleToggle(page, e.target.checked)}
                          />
                          <div className="h-6 w-11 rounded-full bg-red-500 shadow-sm transition-all after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-green-500 peer-checked:after:translate-x-full" />
                        </label>
                        <span className={`text-xs font-semibold ${status === "active" ? "text-green-600" : "text-red-500"}`}>
                          {status === "active" ? "Active" : "Inactive"}
                        </span>
                        <span
                          className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                            page.is_published ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-500"
                          }`}
                        >
                          {page.is_published ? "Published" : "Draft"}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                    {pages.length === 0 ? "No pages found. Create one to get started!" : "No pages match your search."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
