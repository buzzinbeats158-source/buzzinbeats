import { redirect } from "next/navigation";
import crypto from "node:crypto";
import { getCurrentUser } from "@/lib/data/current-user";
import { publicStorageUrl } from "@/lib/storage";
import DashboardSidebar from "@/components/DashboardSidebar";

const TABS = [
  { href: "/profile/account", label: "Account Info" },
  { href: "/profile/branding", label: "Public Branding" },
  { href: "/profile/subscription", label: "Subscription" },
  { href: "/profile/security", label: "Security" },
];

export default async function ProfileLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const avatarUrl =
    publicStorageUrl(user.profile_photo_path) ??
    `https://www.gravatar.com/avatar/${crypto
      .createHash("md5")
      .update(user.email.trim().toLowerCase())
      .digest("hex")}?d=mp&s=200`;

  return (
    <div className="flex h-screen overflow-hidden bg-background-light">
      <DashboardSidebar
        user={{
          name: user.name,
          email: user.email,
          avatarUrl,
          bypass_subscription: user.bypass_subscription ?? false,
        }}
      />
      <main className="flex flex-1 flex-col overflow-y-auto p-8 lg:p-12">
        <div className="mx-auto w-full max-w-4xl flex-1">
          <div className="mb-8 flex gap-2 overflow-x-auto border-b border-orange-100 pb-px">
            {TABS.map((t) => (
              <a
                key={t.href}
                href={t.href}
                className="whitespace-nowrap px-4 py-3 text-sm font-bold text-slate-500 hover:text-primary"
              >
                {t.label}
              </a>
            ))}
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
