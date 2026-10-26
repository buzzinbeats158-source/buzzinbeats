"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateStoreIdAction } from "@/lib/data/redirect-page";

export default function StoreIdForm({ currentStoreId }: { currentStoreId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setMessage(null);
    startTransition(async () => {
      try {
        await updateStoreIdAction(formData);
        setMessage("Store ID saved successfully.");
        router.refresh();
      } catch (e) {
        setMessage(e instanceof Error ? e.message : "Failed to save.");
      }
    });
  }

  return (
    <form action={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">store</span>
        <h3 className="font-bold text-slate-900">Amazon Partner Tag (Store ID)</h3>
      </div>
      <p className="mb-3 text-xs text-slate-500">This is required to fetch Amazon products. It will be saved to your admin account.</p>
      <div className="flex gap-2">
        <input name="amazon_store_id" defaultValue={currentStoreId} placeholder="yourtag-21" className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        <button type="submit" disabled={isPending} className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary/90 disabled:opacity-60">
          {isPending ? "Saving…" : "Save"}
        </button>
      </div>
      {message && <p className="mt-2 text-xs text-slate-600">{message}</p>}
    </form>
  );
}
