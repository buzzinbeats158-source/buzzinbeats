"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { PERIOD_OPTIONS, type PeriodKey } from "@/lib/analytics-periods";

export default function PeriodSelector({ current }: { current: PeriodKey }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [customStart, setCustomStart] = useState(searchParams.get("start") ?? "");
  const [customEnd, setCustomEnd] = useState(searchParams.get("end") ?? "");
  const today = new Date().toISOString().split("T")[0];

  function goTo(period: PeriodKey, start?: string, end?: string) {
    const params = new URLSearchParams();
    params.set("period", period);
    if (period === "custom" && start && end) {
      params.set("start", start);
      params.set("end", end);
    }
    router.push(`/dashboard/analytics?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative w-full sm:w-56">
        <select
          value={current}
          onChange={(e) => goTo(e.target.value as PeriodKey, customStart, customEnd)}
          className="w-full cursor-pointer appearance-none rounded-xl border-none bg-slate-100 py-2 pl-4 pr-10 text-xs font-bold text-slate-600 shadow-sm transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 md:text-sm"
          style={{
            backgroundImage:
              "url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 24 24%27 stroke=%27%2353433c%27 stroke-width=%272%27%3E%3Cpath stroke-linecap=%27round%27 stroke-linejoin=%27round%27 d=%27M19 9l-7 7-7-7%27%3E%3C/path%3E%3C/svg%3E')",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 1rem center",
            backgroundSize: "1rem",
          }}
        >
          {PERIOD_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {current === "custom" && (
        <div className="flex flex-col items-end gap-3 sm:flex-row">
          <div className="flex flex-1 flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">From</label>
            <input
              type="date"
              value={customStart}
              max={customEnd || today}
              onChange={(e) => setCustomStart(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 transition-all focus:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">To</label>
            <input
              type="date"
              value={customEnd}
              min={customStart}
              max={today}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 transition-all focus:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <button
            type="button"
            disabled={!customStart || !customEnd}
            onClick={() => goTo("custom", customStart, customEnd)}
            className="whitespace-nowrap rounded-xl bg-primary px-5 py-2 text-sm font-bold text-white shadow-sm shadow-primary/20 transition-all enabled:hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}
