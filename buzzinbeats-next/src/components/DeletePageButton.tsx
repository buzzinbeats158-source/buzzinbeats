"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function DeletePageButton({ pageId, title }: { pageId: number; title: string }) {
  const router = useRouter();
  const headingId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) dialogRef.current?.showModal();
  }, [open]);

  async function deletePage() {
    setDeleting(true);
    setError(null);
    try {
      const response = await fetch(`/api/pages/${pageId}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Could not delete this page.");
      setOpen(false);
      router.push("/dashboard/pages");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not delete this page. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <button type="button" onClick={() => { setError(null); setOpen(true); }} className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50">
        Delete Page
      </button>
      {open && (
          <dialog ref={dialogRef} aria-labelledby={headingId} onCancel={(event) => { event.preventDefault(); if (!deleting) setOpen(false); }} className="m-auto w-[calc(100%_-_2rem)] max-w-md rounded-2xl bg-white p-6 text-left shadow-xl backdrop:bg-slate-900/50">
            <h3 id={headingId} className="text-xl font-bold text-slate-900">Delete Page?</h3>
            <p className="mt-3 text-sm font-normal text-slate-600">
              Delete &quot;{title}&quot;? It will be removed from your pages, and its public link and QR code will stop opening it.
            </p>
            {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" autoFocus disabled={deleting} onClick={() => setOpen(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 disabled:opacity-50">Keep Page</button>
              <button type="button" disabled={deleting} onClick={deletePage} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{deleting ? "Deleting…" : "Yes, Delete"}</button>
            </div>
          </dialog>
      )}
    </>
  );
}
