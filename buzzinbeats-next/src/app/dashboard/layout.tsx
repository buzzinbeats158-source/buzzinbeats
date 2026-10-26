import { redirect } from "next/navigation";
import crypto from "node:crypto";
import { getCurrentUser } from "@/lib/data/current-user";
import { publicStorageUrl } from "@/lib/storage";
import { getPlanUsage } from "@/lib/data/pages";
import { createClient } from "@/lib/supabase/server";
import DashboardSidebar from "@/components/DashboardSidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const avatarUrl =
    publicStorageUrl(user.profile_photo_path) ??
    `https://www.gravatar.com/avatar/${crypto
      .createHash("md5")
      .update(user.email.trim().toLowerCase())
      .digest("hex")}?d=mp&s=200`;

  const supabase = await createClient();
  const [{ activeCount, limit: pageLimit, planName }, { count: brokenLinkCount }] = await Promise.all([
    getPlanUsage(user.id, user.bypass_subscription ?? false),
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("health_status", "broken"),
  ]);
  const usagePct = pageLimit > 0 && Number.isFinite(pageLimit) ? Math.min(100, Math.round((activeCount / pageLimit) * 100)) : 0;

  return (
    <div className="flex h-screen overflow-hidden bg-background-light">
      <DashboardSidebar
        user={{
          name: user.name,
          email: user.email,
          avatarUrl,
          bypass_subscription: user.bypass_subscription ?? false,
        }}
        activeCount={activeCount}
        pageLimit={Number.isFinite(pageLimit) ? pageLimit : null}
        usagePct={usagePct}
        planName={planName}
        brokenLinkCount={brokenLinkCount ?? 0}
      />
      <main className="flex flex-1 flex-col overflow-y-auto p-8 lg:p-12">
        <div className="flex-1">{children}</div>
      </main>
    </div>
  );
}
