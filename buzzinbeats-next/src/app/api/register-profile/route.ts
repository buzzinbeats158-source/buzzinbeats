import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Creates the application-side `users` row for a freshly-registered
 * Supabase Auth account and links it via auth_user_id (see migration
 * 0001). Must run server-side with the service-role client — there's no
 * RLS insert policy on `users` since normal app code never creates other
 * users' rows, only its own (via this one-time registration path).
 *
 * `password` stays NOT NULL from the legacy Laravel schema but is never
 * read or checked anywhere in this app — Supabase Auth is the sole
 * credential store now (see migration plan, auth section).
 */
export async function POST(request: Request) {
  const { authUserId, name, email } = await request.json();
  if (!authUserId || !name || !email) {
    return NextResponse.json({ message: "Missing fields" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { error } = await supabase.from("users").insert({
    name,
    email,
    password: "supabase-auth-managed", // unused placeholder, see docblock
    role: "user",
    auth_user_id: authUserId,
    bypass_subscription: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ status: "ok" });
}
