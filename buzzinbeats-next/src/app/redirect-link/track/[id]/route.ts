import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { detectDeviceType } from "@/lib/analytics";

/**
 * Mirrors Laravel RedirectLinkController::trackClick() exactly:
 * increment clicks, log an analytics_events row, then a redirect
 * (Laravel used redirect()->away() — an external redirect) to
 * destination_url. This route is linked from real QR codes already in
 * circulation, so the URL and behavior must stay stable.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: link } = await supabase
    .from("redirect_links")
    .select("id, user_id, page_id, destination_url, clicks")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (!link) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  await Promise.all([
    supabase.from("redirect_links").update({ clicks: (link.clicks ?? 0) + 1 }).eq("id", link.id),
    supabase.from("analytics_events").insert({
      user_id: link.user_id,
      page_id: link.page_id,
      redirect_link_id: link.id,
      event_type: "redirect_link_click",
      device_type: detectDeviceType(request.headers.get("user-agent")),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }),
  ]);

  return NextResponse.redirect(link.destination_url);
}
