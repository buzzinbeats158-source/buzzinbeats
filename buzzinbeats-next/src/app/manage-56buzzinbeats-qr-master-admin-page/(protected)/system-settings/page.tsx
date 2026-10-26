import { requireAdmin } from "@/lib/data/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

async function updateSettingsAction(formData: FormData) {
  "use server";
  await requireAdmin();
  const supabase = createAdminClient();

  const entries = [
    "amazon_access_key",
    "amazon_secret_key",
    "amazon_region",
    "amazon_host",
  ].map((key) => ({ key, value: (formData.get(key) as string) || null }));

  for (const entry of entries) {
    await supabase.from("system_settings").upsert(entry, { onConflict: "key" });
  }
  revalidatePath("/manage-56buzzinbeats-qr-master-admin-page/system-settings");
}

export default async function AdminSystemSettingsPage() {
  await requireAdmin();
  const supabase = createAdminClient();
  const { data: settings } = await supabase.from("system_settings").select("key, value");
  const map = Object.fromEntries((settings ?? []).map((s) => [s.key, s.value]));

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">System Settings</h1>
      <form action={updateSettingsAction} className="max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-slate-800">Amazon PA-API Fallback Credentials</h2>
        <p className="mb-4 text-xs text-slate-500">
          Used only if AMAZON_ACCESS_KEY/AMAZON_SECRET_KEY environment variables aren&apos;t set.
        </p>
        <div className="flex flex-col gap-3">
          <input name="amazon_access_key" defaultValue={map.amazon_access_key ?? ""} placeholder="Access Key" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <input name="amazon_secret_key" defaultValue={map.amazon_secret_key ?? ""} placeholder="Secret Key" type="password" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <input name="amazon_region" defaultValue={map.amazon_region ?? "eu-west-1"} placeholder="Region" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <input name="amazon_host" defaultValue={map.amazon_host ?? "webservices.amazon.in"} placeholder="Host" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <button type="submit" className="mt-4 rounded-lg bg-primary px-5 py-2 text-sm font-bold text-white hover:bg-primary/90">
          Save
        </button>
      </form>
    </div>
  );
}
