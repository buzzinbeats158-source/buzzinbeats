import "server-only";
import { createClient } from "@/lib/supabase/server";

/**
 * Resolves the current Supabase Auth session back to the legacy integer
 * `users` row (see migration plan "User identity migration" section —
 * auth.uid() -> users.auth_user_id -> users.id). Returns null if there's
 * no session or the session isn't linked to an application user yet.
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) return null;

  const { data: appUser } = await supabase
    .from("users")
    .select("*")
    .eq("auth_user_id", authUser.id)
    .maybeSingle();

  return appUser;
}
