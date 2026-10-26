import { getCurrentUser } from "@/lib/data/current-user";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function updateBrandingAction(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("users")
    .update({
      business_title: (formData.get("business_title") as string) || null,
      bio: (formData.get("bio") as string) || null,
      category: (formData.get("category") as string) || null,
      public_branding_enabled: formData.get("public_branding_enabled") === "on",
      updated_at: new Date().toISOString(),
    })
    .eq("auth_user_id", authUser.id);
  if (error) throw new Error(error.message);
  revalidatePath("/profile/branding");
}

export default async function BrandingSettingsPage() {
  const user = await getCurrentUser();

  return (
    <div>
      <h1 className="mb-2 text-2xl font-extrabold tracking-tight text-slate-900">Public Branding</h1>
      <p className="mb-8 text-slate-500">Design your public profile presence.</p>

      <form action={updateBrandingAction} className="flex flex-col gap-6">
        <div
          className={`flex items-center justify-between gap-4 rounded-3xl border p-6 ${
            user!.public_branding_enabled ? "border-green-200 bg-green-50" : "border-slate-200 bg-slate-50"
          }`}
        >
          <div>
            <h3 className="text-base font-bold text-slate-900">Public Branding</h3>
            <p className={`text-sm ${user!.public_branding_enabled ? "text-green-700" : "text-slate-500"}`}>
              {user!.public_branding_enabled ? "Visible on your public page." : "Hidden from your public page."}
            </p>
          </div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              name="public_branding_enabled"
              defaultChecked={user!.public_branding_enabled ?? true}
              className="peer sr-only"
            />
            <div className="h-7 w-14 rounded-full bg-slate-300 shadow-sm transition-all after:absolute after:top-0.5 after:left-[2px] after:h-6 after:w-6 after:rounded-full after:bg-white after:shadow-sm after:transition-all after:content-[''] peer-checked:bg-green-500 peer-checked:after:translate-x-full" />
          </label>
        </div>

        <div className="rounded-3xl border border-orange-100 bg-white p-8 shadow-sm">
          <h3 className="mb-6 text-lg font-bold text-slate-900">Profile Details</h3>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="ml-1 text-sm font-bold text-slate-700">Business Title</label>
              <input
                name="business_title"
                defaultValue={user!.business_title ?? ""}
                className="rounded-2xl border border-orange-100 bg-orange-50/30 px-5 py-3.5 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="ml-1 text-sm font-bold text-slate-700">Category</label>
              <input
                name="category"
                defaultValue={user!.category ?? ""}
                className="rounded-2xl border border-orange-100 bg-orange-50/30 px-5 py-3.5 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="ml-1 text-sm font-bold text-slate-700">Bio</label>
              <textarea
                name="bio"
                defaultValue={user!.bio ?? ""}
                rows={4}
                className="rounded-2xl border border-orange-100 bg-orange-50/30 px-5 py-3.5 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
              />
            </div>
          </div>
        </div>

        <button type="submit" className="self-end rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary/90">
          Save Changes
        </button>
      </form>
    </div>
  );
}
