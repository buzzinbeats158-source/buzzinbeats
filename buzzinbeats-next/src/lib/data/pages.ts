"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/data/current-user";
import { createClient } from "@/lib/supabase/server";

function slugify(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function createPageAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  const title = String(formData.get("title") ?? "").trim();
  const description = (formData.get("description") as string) || null;
  if (!title) throw new Error("Title is required");

  const supabase = await createClient();
  const baseSlug = slugify(title);
  let { data: page, error } = await supabase.rpc("create_page", {
    p_user_id: user.id,
    p_title: title,
    p_slug: baseSlug,
    p_description: description,
  });

  // slug is unique per user — retry once with a short random suffix on collision
  if (error?.code === "23505") {
    ({ data: page, error } = await supabase.rpc("create_page", {
      p_user_id: user.id,
      p_title: title,
      p_slug: `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`,
      p_description: description,
    }));
  }

  if (error) throw new Error(error.message);
  if (!page?.is_published) throw new Error("The page was saved but could not be published. Open it in My Pages and choose Publish Page.");
  revalidatePath("/dashboard/pages");
  return page;
}

export async function togglePublishAction(pageId: number, isPublished: boolean) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  const supabase = await createClient();
  const { data: page, error } = await supabase
    .from("pages")
    .update({ is_published: isPublished, updated_at: new Date().toISOString() })
    .eq("id", pageId)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!page) throw new Error("Page not found or you do not have permission to change it.");
  revalidatePath("/dashboard/pages");
  revalidatePath(`/dashboard/pages/${pageId}`);
}

/**
 * Mirrors Laravel's PATCH /dashboard/page/{id}/status toggle used by
 * my-pages.blade.php's per-row switch. Enforces the same plan-limit gate
 * as activate-all below: flipping a page to "active" while a user is
 * already at (or over) their active-page limit is rejected, mirroring
 * PageController@updateStatus's subscription check.
 */
export async function togglePageStatusAction(pageId: number, status: "active" | "inactive") {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  const supabase = await createClient();

  if (status === "active" && !user.bypass_subscription) {
    const { limit, activeCount } = await getPlanUsage(user.id, user.bypass_subscription ?? false);
    if (limit === 0) throw new Error("No active subscription — activate a plan to enable pages.");
    if (activeCount >= limit) throw new Error(`You've reached your plan limit of ${limit} active pages.`);
  }

  const { error } = await supabase
    .from("pages")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", pageId)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/pages");
  revalidatePath("/dashboard");
  return { status };
}

/** Activates the user's most recent pages up to their plan's active-page
 * limit, mirroring PageController@activateAll (activates newest first,
 * skips once the limit is hit). No-op (all inactive) when bypass or
 * plan limit is 0. */
export async function activateAllPagesAction() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  const supabase = await createClient();
  const { limit } = await getPlanUsage(user.id, user.bypass_subscription ?? false);

  if (!user.bypass_subscription && limit === 0) {
    throw new Error("No active subscription — activate a plan first.");
  }

  const { data: pages } = await supabase
    .from("pages")
    .select("id")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .order("id", { ascending: false });

  const ids = (pages ?? []).map((p) => p.id);
  const toActivate = user.bypass_subscription ? ids : ids.slice(0, limit);
  const toDeactivate = user.bypass_subscription ? [] : ids.slice(limit);

  await Promise.all([
    toActivate.length
      ? supabase.from("pages").update({ status: "active", updated_at: new Date().toISOString() }).in("id", toActivate)
      : Promise.resolve(),
    toDeactivate.length
      ? supabase.from("pages").update({ status: "inactive", updated_at: new Date().toISOString() }).in("id", toDeactivate)
      : Promise.resolve(),
  ]);

  revalidatePath("/dashboard/pages");
  revalidatePath("/dashboard");
}

/** Deactivates every page for the user, mirroring PageController@deactivateAll. */
export async function deactivateAllPagesAction() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  const supabase = await createClient();
  const { error } = await supabase
    .from("pages")
    .update({ status: "inactive", updated_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .is("deleted_at", null);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/pages");
  revalidatePath("/dashboard");
}

/** Shared active-page-count / plan-limit lookup used by the toggle and
 * bulk-activate actions above, and by the dashboard sidebar usage card. */
export async function getPlanUsage(userId: number, bypassSubscription: boolean) {
  const supabase = await createClient();

  const [{ count: activeCount }, { data: subscription }] = await Promise.all([
    supabase.from("pages").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("status", "active").is("deleted_at", null),
    supabase.from("subscriptions").select("plan").eq("user_id", userId).eq("status", "active").maybeSingle(),
  ]);

  if (bypassSubscription) {
    return { activeCount: activeCount ?? 0, limit: Infinity, planName: null as string | null };
  }

  const { PLAN_CONFIG } = await import("@/lib/coupons");
  const planConfig = subscription?.plan ? PLAN_CONFIG[subscription.plan] : undefined;
  return { activeCount: activeCount ?? 0, limit: planConfig?.pages ?? 0, planName: planConfig?.name ?? null };
}
