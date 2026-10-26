"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateRedirectPageSettingsAction } from "@/lib/data/redirect-page";

type Settings = {
  page_title: string;
  hero_title: string;
  hero_subtitle: string;
  button_1_label: string | null;
  button_1_url: string | null;
  button_1_enabled: boolean;
  button_2_label: string | null;
  button_2_url: string | null;
  button_2_enabled: boolean;
  button_3_label: string | null;
  button_3_url: string | null;
  button_3_enabled: boolean;
  fallback_landing_url: string | null;
  fallback_landing_enabled: boolean;
  is_active: boolean;
};

export default function RedirectSettingsForm({ settings }: { settings: Settings }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(settings.is_active);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        await updateRedirectPageSettingsAction(formData);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to save.");
      }
    });
  }

  return (
    <form action={handleSubmit}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
            <span className="material-symbols-outlined text-primary">alt_route</span>
            Redirect Page Editor
          </h1>
          <p className="text-sm text-slate-500">Manage your fallback traffic page.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
            {isActive ? "Active" : "Inactive"}
          </span>
          <a href="/redirect-page" target="_blank" rel="noreferrer" className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50">
            <span className="material-symbols-outlined text-base">open_in_new</span>
            Preview Page
          </a>
          <button type="submit" disabled={isPending} className="flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary/90 disabled:opacity-60">
            <span className="material-symbols-outlined text-base">save</span>
            {isPending ? "Saving…" : "Save All"}
          </button>
        </div>
      </div>

      {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">tune</span>
          <h3 className="font-bold text-slate-900">Basic Settings</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-500">Page Name</label>
            <input name="page_title" defaultValue={settings.page_title} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input type="checkbox" name="is_active" defaultChecked={settings.is_active} onChange={(e) => setIsActive(e.target.checked)} className="h-4 w-4 accent-primary" />
            Enable Redirect Page
            <span className="text-xs text-slate-400">— When enabled, dead-end pages redirect here instead of 404.</span>
          </label>
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">campaign</span>
          <h3 className="font-bold text-slate-900">Hero Content Editor</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-500">Hero Title</label>
            <input name="hero_title" defaultValue={settings.hero_title} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-500">Hero Subtitle</label>
            <textarea name="hero_subtitle" defaultValue={settings.hero_subtitle} rows={2} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">smart_button</span>
          <h3 className="font-bold text-slate-900">CTA Buttons Settings</h3>
        </div>
        <div className="space-y-4">
          {([1, 2, 3] as const).map((n) => (
            <div key={n} className="rounded-xl border border-slate-100 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1 text-xs font-bold text-slate-500">
                  <span className="material-symbols-outlined text-sm">drag_indicator</span>
                  Button {n} {n === 1 ? "(Primary)" : n === 2 ? "(Secondary)" : "(Optional)"}
                </span>
                <label className="flex items-center gap-1 text-xs">
                  <input type="checkbox" name={`button_${n}_enabled`} defaultChecked={settings[`button_${n}_enabled` as keyof Settings] as boolean} className="accent-primary" />
                  Enabled
                </label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  name={`button_${n}_label`}
                  defaultValue={(settings[`button_${n}_label` as keyof Settings] as string) ?? ""}
                  placeholder="Label"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
                <input
                  name={`button_${n}_url`}
                  defaultValue={(settings[`button_${n}_url` as keyof Settings] as string) ?? ""}
                  placeholder="URL"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">link</span>
          <h3 className="font-bold text-slate-900">Fallback Landing Link</h3>
        </div>
        <p className="mb-3 text-xs text-slate-500">When enabled, this link is shown on the public redirect page as a &quot;return to main page&quot; option.</p>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1 text-xs">
            <input type="checkbox" name="fallback_landing_enabled" defaultChecked={settings.fallback_landing_enabled} className="accent-primary" />
            Enabled
          </label>
          <input
            name="fallback_landing_url"
            defaultValue={settings.fallback_landing_url ?? ""}
            placeholder="https://…"
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
      </div>
    </form>
  );
}
