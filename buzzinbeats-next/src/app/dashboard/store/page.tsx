import { getCurrentUser } from "@/lib/data/current-user";
import { createClient } from "@/lib/supabase/server";
import { createStoreAction, deleteStoreAction } from "@/lib/data/stores";

export default async function StorePage() {
  const user = await getCurrentUser();
  const supabase = await createClient();
  const { data: stores } = await supabase
    .from("user_stores")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-slate-900">Store Settings</h1>
      <p className="mb-8 text-slate-500">Custom buy-button branding for your product cards.</p>

      <form
        action={async (formData) => {
          "use server";
          await createStoreAction(formData);
        }}
        className="mb-8 flex flex-col gap-3 rounded-2xl border border-orange-100 bg-white p-6 shadow-sm"
      >
        <input name="name" placeholder="Store name (e.g. Amazon, My Shop)" required className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <input name="button_text" placeholder="Button text (default: Buy Now)" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <div className="flex gap-3">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-500">
            Button color
            <input name="button_color" type="color" defaultValue="#FF6600" className="h-8 w-12 rounded" />
          </label>
          <label className="flex items-center gap-2 text-xs font-bold text-slate-500">
            Text color
            <input name="text_color" type="color" defaultValue="#FFFFFF" className="h-8 w-12 rounded" />
          </label>
        </div>
        <button type="submit" className="mt-1 self-start rounded-lg bg-primary px-5 py-2 text-sm font-bold text-white hover:bg-primary/90">
          Add store
        </button>
      </form>

      <div className="flex flex-col gap-3">
        {(stores ?? []).map((store) => (
          <div key={store.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <button
                style={{ backgroundColor: store.button_color, color: store.text_color }}
                className="rounded-lg px-4 py-2 text-xs font-bold"
              >
                {store.button_text || "Buy Now"}
              </button>
              <span className="font-bold text-slate-800">{store.name}</span>
            </div>
            <form
              action={async () => {
                "use server";
                await deleteStoreAction(store.id);
              }}
            >
              <button type="submit" className="text-xs font-bold text-red-600 hover:underline">
                Delete
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
