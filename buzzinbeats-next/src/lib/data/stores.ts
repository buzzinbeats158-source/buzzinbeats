"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/data/current-user";
import { createClient } from "@/lib/supabase/server";

export async function createStoreAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  const name = String(formData.get("name") ?? "").trim();
  const buttonText = (formData.get("button_text") as string) || "Buy Now";
  const buttonColor = (formData.get("button_color") as string) || "#FF6600";
  const textColor = (formData.get("text_color") as string) || "#FFFFFF";
  if (!name) throw new Error("Name is required");

  const supabase = await createClient();
  const { error } = await supabase.from("user_stores").insert({
    user_id: user.id,
    name,
    button_text: buttonText,
    button_color: buttonColor,
    text_color: textColor,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/store");
}

export async function deleteStoreAction(id: number) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  const supabase = await createClient();
  const { error } = await supabase.from("user_stores").delete().eq("id", id).eq("user_id", user.id);
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/store");
}
