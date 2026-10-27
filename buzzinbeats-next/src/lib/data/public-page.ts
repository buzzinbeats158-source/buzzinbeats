import "server-only";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { detectDeviceType } from "@/lib/analytics";

/**
 * Resolves and loads a public bio-link page, mirroring
 * Laravel PageController::publicShow(). Uses the service-role client
 * because the visibility rule (published + active + subscription bypass)
 * is enforced here in application code, not via RLS — same authorization
 * model as the original controller. Never expose this module to the client.
 * Resolves the immutable page address before loading the owner, so profile
 * renames cannot break shared links or make them resolve to another owner.
 */
export async function loadPublicPage(username: string, slug: string) {
  const supabase = createAdminClient();

  const { data: page } = await supabase
    .from("pages")
    .select("*")
    .eq("public_username", username)
    .eq("slug", slug)
    .eq("is_published", true)
    .is("deleted_at", null)
    .maybeSingle();

  if (!page) return { kind: "not_found" as const };

  const { data: owner } = await supabase
    .from("users")
    .select(
      "id, name, bypass_subscription, public_branding_enabled, logo_path, logo_enabled, header_branding_enabled, profile_photo_path, business_title, category, bio, services_text, contact_email, contact_phone, contact_phone_code, contact_whatsapp, landing_layout"
    )
    .eq("id", page.user_id)
    .maybeSingle();

  if (!owner) return { kind: "not_found" as const };

  if (page.status !== "active") return { kind: "inactive" as const };

  const hasAccess = owner.bypass_subscription === true || (await hasActiveSubscription(owner.id));
  if (!hasAccess) return { kind: "subscription_required" as const, owner };

  // Fire-and-forget view tracking, matching the Laravel controller's
  // synchronous increment + analytics_events insert on every page load.
  const requestHeaders = await headers();
  await Promise.all([
    supabase.from("pages").update({ views: (page.views ?? 0) + 1 }).eq("id", page.id),
    supabase.from("analytics_events").insert({
      user_id: owner.id,
      page_id: page.id,
      event_type: "page_view",
      device_type: detectDeviceType(requestHeaders.get("user-agent")),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }),
  ]);

  const [
    { data: products },
    { data: redirectLinks },
    { data: digitalProducts },
    { data: sections },
    { data: socialLinks },
    { data: landingSections },
  ] = await Promise.all([
    supabase.from("products").select("*").eq("page_id", page.id).order("serial_number"),
    supabase
      .from("redirect_links")
      .select("*")
      .eq("page_id", page.id)
      .eq("status", "active")
      .is("deleted_at", null)
      .order("serial_number"),
    supabase
      .from("digital_products")
      .select("*")
      .eq("page_id", page.id)
      .eq("status", "active")
      .is("deleted_at", null)
      .order("serial_number"),
    supabase
      .from("content_page_sections")
      .select("*")
      .eq("content_page_id", page.id)
      .eq("is_enabled", true)
      .order("section_order"),
    // Personal-branding content: only meaningful when the creator has
    // branding enabled, mirrors the old Laravel page's $enabledSocials.
    owner.public_branding_enabled
      ? supabase
          .from("user_social_media")
          .select("*")
          .eq("user_id", owner.id)
          .eq("is_enabled", true)
          .order("sort_order")
      : Promise.resolve({ data: [] }),
    owner.public_branding_enabled
      ? supabase
          .from("user_landing_sections")
          .select("*")
          .eq("user_id", owner.id)
          .eq("is_enabled", true)
      : Promise.resolve({ data: [] }),
  ]);

  return {
    kind: "ok" as const,
    owner,
    page,
    products: products ?? [],
    redirectLinks: redirectLinks ?? [],
    digitalProducts: digitalProducts ?? [],
    sections: sections ?? [],
    socialLinks: socialLinks ?? [],
    landingSections: landingSections ?? [],
  };
}

async function hasActiveSubscription(userId: number) {
  const supabase = createAdminClient();
  const { count } = await supabase
    .from("subscriptions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "active");
  return (count ?? 0) > 0;
}
