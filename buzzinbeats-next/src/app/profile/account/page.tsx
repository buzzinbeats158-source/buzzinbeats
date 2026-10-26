import { getCurrentUser } from "@/lib/data/current-user";
import { updateAccountAction } from "@/lib/data/profile";
import { publicStorageUrl } from "@/lib/storage";
import ImageCropField from "@/components/ImageCropField";

export default async function AccountSettingsPage() {
  const user = await getCurrentUser();
  const avatarUrl = publicStorageUrl(user!.profile_photo_path);
  const handle = (user!.name ?? "").trim().toLowerCase().replace(/\s+/g, "_");

  return (
    <div>
      <h1 className="mb-2 text-2xl font-extrabold tracking-tight text-slate-900">
        Welcome back, {user!.name.split(" ")[0]}
      </h1>
      <p className="mb-8 text-slate-500">Manage your creator profile and optimize your product performance.</p>

      <form
        action={async (formData) => {
          "use server";
          await updateAccountAction(formData);
        }}
        className="rounded-[2rem] border border-orange-100 bg-white p-8 shadow-sm"
      >
        <h3 className="mb-6 text-lg font-bold text-slate-900">Account Information</h3>

        {/* Profile Photo */}
        <div className="mb-10 flex flex-col items-center gap-8 border-b border-orange-50 pb-10 sm:flex-row">
          <ImageCropField
            name="photo"
            label=""
            aspectRatio={1}
            existingImageUrl={avatarUrl}
            shape="circle"
            sizeClassName="h-40 w-40 border-4 border-orange-100 shadow-xl bg-orange-50"
            hoverIcon="photo_camera"
          />
          <div className="text-center sm:text-left">
            <h4 className="text-2xl font-extrabold tracking-tight text-slate-900">@{handle}</h4>
            <p className="mt-2 text-xs text-slate-500">Click image to upload, crop, rotate, then save changes.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="ml-1 text-sm font-bold text-slate-700">Full Name</label>
            <input
              name="name"
              defaultValue={user!.name}
              className="rounded-2xl border border-orange-100 bg-orange-50/30 px-5 py-3.5 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="ml-1 flex items-center gap-1.5 text-sm font-bold text-slate-700">
              Username
              <span
                className="material-symbols-outlined cursor-help text-xs text-slate-400"
                title="Your public URL uses your full name as the username. Change your name above to update it — limited to once every 30 days."
              >
                info
              </span>
            </label>
            <div className="relative">
              <div className="cursor-not-allowed rounded-2xl border border-orange-100 bg-slate-50 px-5 py-3.5 text-slate-400">
                {handle}
              </div>
              <span className="material-symbols-outlined absolute right-5 top-1/2 -translate-y-1/2 text-slate-300">
                lock
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="ml-1 text-sm font-bold text-slate-700">Email Address</label>
            <div className="rounded-2xl border border-transparent bg-slate-50 px-5 py-3.5 text-slate-500">
              {user!.email}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="ml-1 text-sm font-bold text-slate-700">Phone Number</label>
            <div className="flex gap-3">
              <select
                name="phone_code"
                defaultValue={user!.phone_code ?? "+91"}
                className="w-28 rounded-2xl border border-orange-100 bg-orange-50/30 px-3 py-3.5 outline-none focus:border-primary"
              >
                <option value="+91">+91 (IN)</option>
                <option value="+1">+1 (US)</option>
                <option value="+44">+44 (UK)</option>
                <option value="+971">+971 (UAE)</option>
                <option value="+61">+61 (AU)</option>
                <option value="+65">+65 (SG)</option>
              </select>
              <input
                name="phone"
                defaultValue={user!.phone ?? ""}
                placeholder="000 000 0000"
                className="flex-1 rounded-2xl border border-orange-100 bg-orange-50/30 px-5 py-3.5 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="ml-1 text-sm font-bold text-slate-700">Member Since</label>
            <div className="rounded-2xl bg-slate-50 px-5 py-3.5 text-sm text-slate-600">
              {new Date(user!.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end border-t border-orange-50 pt-6">
          <button type="submit" className="rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary/90">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
