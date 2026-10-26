"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/data/current-user";
import { createClient } from "@/lib/supabase/server";
import { resizeToWebp } from "@/lib/image";
import { uploadPublicObject } from "@/lib/storage/r2";
import { normalizeDescriptionToHtml } from "@/lib/richtext";

export async function createRedirectLinkAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  const pageId = Number(formData.get("page_id"));
  const title = String(formData.get("title") ?? "").trim();
  const destinationUrl = String(formData.get("destination_url") ?? "").trim();
  const description = normalizeDescriptionToHtml((formData.get("description") as string) || null) || null;
  const buttonText = (formData.get("button_text") as string) || "Visit";
  const imageFile = formData.get("image") as File | null;

  if (!title || !destinationUrl) throw new Error("Title and destination URL are required");

  const supabase = await createClient();

  let imagePath: string | null = null;
  if (imageFile && imageFile.size > 0) {
    const webpBuffer = await resizeToWebp(Buffer.from(await imageFile.arrayBuffer()), 1280, 800);
    imagePath = `redirect-links/${crypto.randomUUID()}.webp`;
    await uploadPublicObject(imagePath, webpBuffer, "image/webp");
  }

  const { data: link, error } = await supabase.rpc("create_redirect_link", {
    p_user_id: user.id,
    p_page_id: pageId,
    p_title: title,
    p_destination_url: destinationUrl,
    p_description: description,
    p_button_text: buttonText,
  });
  if (error) throw new Error(error.message);

  if (imagePath) {
    await supabase.from("redirect_links").update({ image_path: imagePath }).eq("id", link.id);
  }

  revalidatePath(`/dashboard/pages/${pageId}`);
  revalidatePath("/dashboard/redirect-links");
}

export async function updateRedirectLinkAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  const id = Number(formData.get("id"));
  const pageId = Number(formData.get("page_id"));
  const title = String(formData.get("title") ?? "").trim();
  const destinationUrl = String(formData.get("destination_url") ?? "").trim();
  const description = normalizeDescriptionToHtml((formData.get("description") as string) || null) || null;
  const buttonText = (formData.get("button_text") as string) || "Visit";
  const openInNewTab = formData.get("open_in_new_tab") === "on";
  const imageFile = formData.get("image") as File | null;

  if (!title || !destinationUrl) throw new Error("Title and destination URL are required");

  const supabase = await createClient();
  const update: Record<string, unknown> = {
    title,
    destination_url: destinationUrl,
    description,
    button_text: buttonText,
    open_in_new_tab: openInNewTab,
    updated_at: new Date().toISOString(),
  };

  if (imageFile && imageFile.size > 0) {
    const webpBuffer = await resizeToWebp(Buffer.from(await imageFile.arrayBuffer()), 1280, 800);
    const imagePath = `redirect-links/${crypto.randomUUID()}.webp`;
    await uploadPublicObject(imagePath, webpBuffer, "image/webp");
    update.image_path = imagePath;
  }

  const { error } = await supabase.from("redirect_links").update(update).eq("id", id).eq("user_id", user.id);
  if (error) throw new Error(error.message);

  revalidatePath(`/dashboard/pages/${pageId}`);
  revalidatePath("/dashboard/redirect-links");
}

export async function deleteRedirectLinkAction(id: number, pageId: number) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  const supabase = await createClient();
  const { error } = await supabase.from("redirect_links").delete().eq("id", id).eq("user_id", user.id);
  if (error) throw new Error(error.message);

  revalidatePath(`/dashboard/pages/${pageId}`);
  revalidatePath("/dashboard/redirect-links");
}
