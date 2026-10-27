"use client";

import { useState } from "react";

export default function PageHeaderCard({
  page,
  publicUrl,
}: {
  page: { id: number; page_id: string | null; title: string; description: string | null; public_username: string; slug: string };
  publicUrl: string;
}) {
  const [copied, setCopied] = useState(false);

  function copyLink() {
    navigator.clipboard.writeText(publicUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col items-start justify-between gap-6 md:flex-row">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">
              <span className="mr-2 text-lg font-normal text-slate-400">{page.page_id ?? `#p${page.id}`}</span>
              {page.title}
            </h1>
            <a href={`/dashboard/pages/create?edit=${page.id}`} className="rounded-lg p-1.5 text-primary transition-colors hover:bg-primary/5" title="Edit Page Details">
              <span className="material-symbols-outlined text-xl">edit</span>
            </a>
          </div>
          <p className="mb-4 max-w-2xl text-sm leading-relaxed text-slate-500">{page.description || "No description provided."}</p>

          <div className="inline-flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 p-2 pr-4">
            <span className="rounded border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">Slug</span>
            <span className="font-mono text-sm text-slate-600">
              buzzinbeats.com/{page.public_username}/{page.slug}
            </span>
          </div>

          <div className="mt-4">
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-primary bg-white px-5 py-2 text-sm font-bold text-primary transition-all hover:bg-primary/5"
            >
              <span className="material-symbols-outlined text-sm">visibility</span>
              Preview Page
            </a>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
          <div className="rounded-lg border border-slate-100 bg-white p-1 shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/api/pages/${page.id}/qr-code`} className="h-20 w-20" alt="QR Code" />
          </div>
          <div className="flex w-full gap-2">
            <a
              href={`/api/pages/${page.id}/qr-code?format=svg`}
              className="flex flex-1 items-center justify-center gap-1 rounded border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-bold text-slate-600 transition-colors hover:bg-slate-50"
            >
              <span className="material-symbols-outlined text-sm">download</span> SVG
            </a>
            <a
              href={`/api/pages/${page.id}/qr-code`}
              className="flex flex-1 items-center justify-center gap-1 rounded border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-bold text-slate-600 transition-colors hover:bg-slate-50"
            >
              <span className="material-symbols-outlined text-sm">download</span> PNG
            </a>
            <div className="relative flex flex-1 items-center justify-center">
              <button onClick={copyLink} className="w-full rounded border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-bold text-slate-600 transition-colors hover:bg-slate-50">
                <span className="material-symbols-outlined mr-1 align-middle text-sm">content_copy</span> Link
              </button>
              {copied && <span className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-semibold text-green-600">Copied!</span>}
            </div>
          </div>
          <a
            href="/dashboard/pages/create"
            className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-[11px] font-bold text-white shadow-sm transition-all hover:bg-primary/90"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Create New Page
          </a>
        </div>
      </div>
    </div>
  );
}
