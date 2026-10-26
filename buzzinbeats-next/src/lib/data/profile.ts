"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/data/current-user";
import { createClient } from "@/lib/supabase/server";
import { resizeToWebp } from "@/lib/image";
import { uploadPublicObject } from "@/lib/storage/r2";

/** Mirrors Laravel ProfileController::update() + updatePhoto(), combined
 * into one action (same pattern as ProductForm's image handling): photo is
 * optional — when omitted, the existing profile_photo_path is left as-is. */
export async function updateAccountAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  const name = String(formData.get("name") ?? "").trim();
  const phone = (formData.get("phone") as string) || null;
  const phoneCode = (formData.get("phone_code") as string) || "+91";
  const photoFile = formData.get("photo") as File | null;

  const update: Record<string, unknown> = {
    name,
    phone,
    phone_code: phoneCode,
    updated_at: new Date().toISOString(),
  };

  if (photoFile && photoFile.size > 0) {
    const buffer = Buffer.from(await photoFile.arrayBuffer());
    const webpBuffer = await resizeToWebp(buffer, 400, 400);
    const objectPath = `avatars/${user.id}-${crypto.randomUUID()}.webp`;
    await uploadPublicObject(objectPath, webpBuffer, "image/webp");
    update.profile_photo_path = objectPath;
  }

  const supabase = await createClient();
  const { error } = await supabase.from("users").update(update).eq("id", user.id);
  if (error) throw new Error(error.message);

  revalidatePath("/profile/account");
  revalidatePath("/profile", "layout");
}

export async function updatePasswordAction(formData: FormData) {
  const newPassword = String(formData.get("new_password") ?? "");
  const confirmPassword = String(formData.get("confirm_password") ?? "");
  if (newPassword.length < 6) throw new Error("Password must be at least 6 characters");
  if (newPassword !== confirmPassword) throw new Error("Passwords don't match");

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw new Error(error.message);
}

export async function updateLandingLayoutAction(layout: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  const supabase = await createClient();
  const { error } = await supabase
    .from("users")
    .update({ landing_layout: layout, updated_at: new Date().toISOString() })
    .eq("id", user.id);
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/landing-layouts");
}

export async function createSupportTicketAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  const topic = String(formData.get("topic") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  if (!topic || !message) throw new Error("Topic and message are required");

  const supabase = await createClient();
  const { error } = await supabase.from("support_tickets").insert({
    user_id: user.id,
    ticket_number: `TCK-${Date.now().toString(36).toUpperCase()}`,
    topic,
    message,
    status: "open",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  if (error) throw new Error(error.message);

  revalidatePath("/support");
}
