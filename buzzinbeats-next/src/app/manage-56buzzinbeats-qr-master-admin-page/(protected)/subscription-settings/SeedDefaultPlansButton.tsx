"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { seedDefaultPlansAction } from "@/lib/data/subscription-settings";

export default function SeedDefaultPlansButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    if (!confirm("Initialize the plan matrix with BuzzinBeats' default Starter/Growth/Premium/Pro plans? You can edit every value afterward.")) return;
    setError(null);
    startTransition(async () => {
      try {
        await seedDefaultPlansAction();
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to initialize plans.");
      }
    });
  }

  return (
    <div>
      <button onClick={handleClick} disabled={isPending} className="rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary/90 disabled:opacity-60">
        {isPending ? "Initializing…" : "Initialize Default Plans"}
      </button>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  );
}
