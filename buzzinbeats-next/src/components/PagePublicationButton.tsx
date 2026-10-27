"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { togglePublishAction } from "@/lib/data/pages";

export default function PagePublicationButton({ pageId, isPublished }: { pageId: number; isPublished: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function togglePublication() {
    setError(null);
    startTransition(async () => {
      try {
        await togglePublishAction(pageId, !isPublished);
        router.refresh();
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Could not change publication. Please try again.");
      }
    });
  }

  return (
    <div>
      <button
        type="button"
        role="switch"
        aria-checked={isPublished}
        aria-label="Page publication"
        onClick={togglePublication}
        disabled={pending}
        className={`rounded-lg border px-4 py-2 text-xs font-bold transition-colors disabled:opacity-50 ${isPublished ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100" : "border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100"}`}
      >
        {pending ? "Saving…" : isPublished ? "Published · Move to Draft" : "Draft · Publish Page"}
      </button>
      {error && <p role="alert" className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
