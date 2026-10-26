import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { detectDeviceType } from "@/lib/analytics";

/**
 * Mirrors Laravel PageController::trackLink() — legacy `links` table
 * (superseded by redirect_links, but the route/table still exist and are
 * kept for parity). Increment clicks, log analytics_events
 * (event_type=link_click), redirect to link.url.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ linkId: string }> },
) {
  const { linkId } = await params;
  const supabase = createAdminClient();

  const { data: link } = await supabase
    .from("links")
    .select("id, page_id, url, clicks")
    .eq("id", linkId)
    .maybeSingle();

  if (!link) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const { data: page } = await supabase
    .from("pages")
    .select("user_id")
    .eq("id", link.page_id)
    .maybeSingle();

  await Promise.all([
    supabase.from("links").update({ clicks: (link.clicks ?? 0) + 1 }).eq("id", link.id),
    supabase.from("analytics_events").insert({
      user_id: page?.user_id ?? null,
      page_id: link.page_id,
      link_id: link.id,
      event_type: "link_click",
      device_type: detectDeviceType(request.headers.get("user-agent")),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }),
  ]);

  return NextResponse.redirect(link.url);
}
