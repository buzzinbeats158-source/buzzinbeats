"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/data/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendDeletionWarningEmail } from "@/lib/brevo";
import { getCurrentUser } from "@/lib/data/current-user";

const USERS_BASE = "/manage-56buzzinbeats-qr-master-admin-page/users";

/** Called right after a successful Supabase sign-in on the admin login
 * page — mirrors old AdminController::login()'s role check ("Access
 * denied. Admins only.") without silently bouncing to the generic
 * /login page like requireAdmin() does for already-rendered pages. */
export async function checkCurrentUserIsAdminAction() {
  const user = await getCurrentUser();
  return user?.role === "admin";
}

export async function toggleBypassSubscriptionAction(userId: number, current: boolean) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from("users").update({ bypass_subscription: !current }).eq("id", userId);
  if (error) throw new Error(error.message);
  revalidatePath(USERS_BASE);
  revalidatePath(`${USERS_BASE}/${userId}`);
}

async function assertNotAdmin(userId: number) {
  const supabase = createAdminClient();
  const { data: user } = await supabase.from("users").select("role").eq("id", userId).maybeSingle();
  if (user?.role === "admin") throw new Error("Cannot perform this action on an admin user.");
  return supabase;
}

export async function deleteUserAction(userId: number) {
  await requireAdmin();
  const supabase = await assertNotAdmin(userId);
  const { data: user } = await supabase.from("users").select("auth_user_id").eq("id", userId).maybeSingle();
  const { error } = await supabase.from("users").delete().eq("id", userId);
  if (error) throw new Error(error.message);
  if (user?.auth_user_id) await supabase.auth.admin.deleteUser(user.auth_user_id);
  revalidatePath(USERS_BASE);
}

export async function scheduleUserDeletionAction(userId: number) {
  await requireAdmin();
  const supabase = await assertNotAdmin(userId);
  const { data: user } = await supabase.from("users").select("name, email").eq("id", userId).maybeSingle();
  if (!user) throw new Error("User not found.");

  const deletionDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
  const { error } = await supabase
    .from("users")
    .update({
      scheduled_deletion_at: deletionDate.toISOString(),
      deletion_notified_10d_at: new Date().toISOString(),
      deletion_notified_5d_at: null,
      deletion_notified_1d_at: null,
    })
    .eq("id", userId);
  if (error) throw new Error(error.message);

  await sendDeletionWarningEmail(user.email, user.name, deletionDate);

  revalidatePath(USERS_BASE);
  revalidatePath(`${USERS_BASE}/${userId}`);
}

export async function cancelUserDeletionAction(userId: number) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("users")
    .update({
      scheduled_deletion_at: null,
      deletion_notified_10d_at: null,
      deletion_notified_5d_at: null,
      deletion_notified_1d_at: null,
    })
    .eq("id", userId);
  if (error) throw new Error(error.message);
  revalidatePath(USERS_BASE);
  revalidatePath(`${USERS_BASE}/${userId}`);
}

export async function deletePageAction(pageId: number) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from("pages").delete().eq("id", pageId);
  if (error) throw new Error(error.message);
  revalidatePath("/manage-56buzzinbeats-qr-master-admin-page/pages");
  revalidatePath("/manage-56buzzinbeats-qr-master-admin-page/content-pages");
}

export async function deleteProductAdminAction(productId: number) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from("products").delete().eq("id", productId);
  if (error) throw new Error(error.message);
  revalidatePath("/manage-56buzzinbeats-qr-master-admin-page/products");
}

export async function deleteRedirectLinkAdminAction(id: number) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from("redirect_links").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/manage-56buzzinbeats-qr-master-admin-page/redirect-links");
}

export async function deleteDigitalProductAdminAction(id: number) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from("digital_products").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/manage-56buzzinbeats-qr-master-admin-page/digital-products");
}
