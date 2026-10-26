"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/data/current-user";
import { createClient } from "@/lib/supabase/server";
import { resizeToWebp } from "@/lib/image";
import { uploadPublicObject } from "@/lib/storage/r2";
import { normalizeDescriptionToHtml } from "@/lib/richtext";

export async function listProducts(pageId: number) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("page_id", pageId)
    .order("serial_number");
  return data ?? [];
}

/**
 * Mirrors Laravel ProductController::store(): image required, resized to
 * an 800x800 cover crop and compressed as webp (quality 80), stored on
 * Cloudflare R2. Uses the create_product RPC (migration 0004) for the
 * concurrency-safe serial number + insert, not a raw insert.
 */
export async function createProductAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  const pageId = Number(formData.get("page_id"));
  const title = String(formData.get("title") ?? "").trim();
  const description = normalizeDescriptionToHtml((formData.get("description") as string) || null) || null;
  const priceRaw = formData.get("starting_price") as string;
  const startingPrice = priceRaw ? Number(priceRaw) : null;
  const imageFile = formData.get("image") as File | null;
  const showPrice = formData.get("show_price") === "on";
  const primaryCountryId = formData.get("primary_country_id") ? Number(formData.get("primary_country_id")) : null;
  const currencyCode = (formData.get("currency_code") as string) || null;
  const currencySymbol = (formData.get("currency_symbol") as string) || null;
  const primaryCountryName = (formData.get("primary_country_name") as string) || null;

  // store_platform[] / product_link[] — repeatable rows, same as Laravel's
  // dynamic "Store Links" section.
  const platforms = formData.getAll("store_platform[]").map(String).filter(Boolean);
  const links = formData.getAll("product_link[]").map(String).filter(Boolean);

  if (!title || links.length === 0 || !imageFile || imageFile.size === 0) {
    throw new Error("Title, at least one store link, and image are required");
  }

  const supabase = await createClient();

  const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
  const webpBuffer = await resizeToWebp(imageBuffer, 800, 800);
  const objectPath = `products/${crypto.randomUUID()}.webp`;
  await uploadPublicObject(objectPath, webpBuffer, "image/webp");

  const { data: product, error } = await supabase.rpc("create_product", {
    p_user_id: user.id,
    p_page_id: pageId,
    p_title: title,
    p_link: JSON.stringify(links),
    p_image_path: objectPath,
    p_description: description,
    p_starting_price: startingPrice,
    p_currency_code: currencyCode ?? "INR",
    p_currency_symbol: currencySymbol ?? "₹",
  });

  if (error) throw new Error(error.message);

  await supabase
    .from("products")
    .update({
      store_platform: JSON.stringify(platforms),
      show_price: showPrice,
      primary_country_id: primaryCountryId,
      primary_country_name: primaryCountryName,
    })
    .eq("id", product.id);

  revalidatePath("/dashboard/products");
  return product;
}

/** Mirrors Laravel ProductController::update()/updateImage() — combined
 * into one action here for simplicity (image is optional; when omitted,
 * the existing image_path is left untouched). */
export async function updateProductAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  const productId = Number(formData.get("id"));
  const title = String(formData.get("title") ?? "").trim();
  const description = normalizeDescriptionToHtml((formData.get("description") as string) || null) || null;
  const priceRaw = formData.get("starting_price") as string;
  const startingPrice = priceRaw ? Number(priceRaw) : null;
  const showPrice = formData.get("show_price") === "on";
  const currencyCode = (formData.get("currency_code") as string) || "INR";
  const currencySymbol = (formData.get("currency_symbol") as string) || "₹";
  const primaryCountryId = formData.get("primary_country_id") ? Number(formData.get("primary_country_id")) : null;
  const primaryCountryName = (formData.get("primary_country_name") as string) || null;
  const platforms = formData.getAll("store_platform[]").map(String).filter(Boolean);
  const links = formData.getAll("product_link[]").map(String).filter(Boolean);
  const imageFile = formData.get("image") as File | null;

  if (!title || links.length === 0) throw new Error("Title and at least one store link are required");

  const supabase = await createClient();
  const update: Record<string, unknown> = {
    title,
    description,
    starting_price: startingPrice,
    show_price: showPrice,
    currency_code: currencyCode,
    currency_symbol: currencySymbol,
    primary_country_id: primaryCountryId,
    primary_country_name: primaryCountryName,
    link: JSON.stringify(links),
    store_platform: JSON.stringify(platforms),
    updated_at: new Date().toISOString(),
  };

  if (imageFile && imageFile.size > 0) {
    const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
    const webpBuffer = await resizeToWebp(imageBuffer, 800, 800);
    const objectPath = `products/${crypto.randomUUID()}.webp`;
    await uploadPublicObject(objectPath, webpBuffer, "image/webp");
    update.image_path = objectPath;
  }

  const { error } = await supabase.from("products").update(update).eq("id", productId).eq("user_id", user.id);
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/products");
}

export async function deleteProductAction(productId: number) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", productId).eq("user_id", user.id);
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/products");
}
