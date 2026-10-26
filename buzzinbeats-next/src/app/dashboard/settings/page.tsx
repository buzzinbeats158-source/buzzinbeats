import { getCurrentUser } from "@/lib/data/current-user";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function updateAmazonStoreIdAction(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) throw new Error("Not authenticated");

  const amazonStoreId = String(formData.get("amazon_store_id") ?? "").trim();
  const { error } = await supabase
    .from("users")
    .update({ amazon_store_id: amazonStoreId || null, updated_at: new Date().toISOString() })
    .eq("auth_user_id", authUser.id);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/settings");
}

export default async function GeneralSettingsPage() {
  const user = await getCurrentUser();
  const supabase = await createClient();
  const { data: deletedPages } = await supabase
    .from("pages")
    .select("id, title, deleted_at")
    .eq("user_id", user!.id)
    .not("deleted_at", "is", null)
    .order("deleted_at", { ascending: false });

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-10 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20">
          <span className="material-symbols-outlined">settings</span>
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">General Settings</h1>
          <p className="text-slate-500">Manage your account preferences and page recovery options.</p>
        </div>
      </header>

      <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <span className="material-symbols-outlined text-3xl">palette</span>
            </div>
            <div>
              <h3 className="mb-2 text-xl font-bold">Customise Landing Page</h3>
              <p className="text-sm leading-relaxed text-slate-500">Personalize your link-in-bio with premium design presets.</p>
            </div>
          </div>
          <a
            href="/dashboard/landing-layouts"
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white transition-all hover:scale-[1.02]"
          >
            <span className="material-symbols-outlined text-base">palette</span>
            Select Theme
          </a>
        </div>
      </section>

      <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <span className="material-symbols-outlined text-[#FF9900]">shopping_cart</span>
          <div>
            <h2 className="text-xl font-bold">Amazon Affiliate Setup</h2>
            <p className="text-sm text-slate-500">Set your Amazon Associate Store ID to enable Auto Add Product via ASIN.</p>
          </div>
        </div>
        <form action={updateAmazonStoreIdAction} className="flex gap-3">
          <input
            name="amazon_store_id"
            defaultValue={user!.amazon_store_id ?? ""}
            placeholder="e.g. yourname-21"
            className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
          />
          <button type="submit" className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-primary/90">
            Save
          </button>
        </form>
      </section>

      {deletedPages && deletedPages.length > 0 && (
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="mb-4 text-xl font-bold">Deleted Pages</h2>
          <div className="flex flex-col gap-2">
            {deletedPages.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm">
                <span className="font-bold text-slate-700">{p.title}</span>
                <span className="text-slate-400">
                  Deleted {p.deleted_at && new Date(p.deleted_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
