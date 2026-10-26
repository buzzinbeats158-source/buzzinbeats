"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/data/current-user";
import { createClient } from "@/lib/supabase/server";
import { resizeToWebp } from "@/lib/image";
import { uploadPublicObject, uploadPrivateObject, deletePrivateObject } from "@/lib/storage/r2";
import { normalizeDescriptionToHtml } from "@/lib/richtext";

export async function createDigitalProductAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  const pageId = Number(formData.get("page_id"));
  const title = String(formData.get("title") ?? "").trim();
  const description = normalizeDescriptionToHtml((formData.get("description") as string) || null) || null;
  const priceRaw = formData.get("price") as string;
  const price = priceRaw ? Number(priceRaw) : 0;
  const coverFile = formData.get("cover_image") as File | null;
  const file = formData.get("file") as File | null;

  if (!title || !file || file.size === 0) throw new Error("Title and file are required");

  const supabase = await createClient();

  let coverImagePath: string | null = null;
  if (coverFile && coverFile.size > 0) {
    const webpBuffer = await resizeToWebp(Buffer.from(await coverFile.arrayBuffer()), 1280, 720);
    coverImagePath = `digital-products/${crypto.randomUUID()}.webp`;
    await uploadPublicObject(coverImagePath, webpBuffer, "image/webp");
  }

  // Upload the purchasable file to the private R2 bucket (no public custom
  // domain — reachable only via presigned URLs after an access check).
  const objectKey = `digital-products/${crypto.randomUUID()}.${file.name.split(".").pop()}`;
  const fileBuffer = Buffer.from(await file.arrayBuffer());
  await uploadPrivateObject(objectKey, fileBuffer, file.type || "application/octet-stream");

  const { data: product, error } = await supabase.rpc("create_digital_product", {
    p_user_id: user.id,
    p_page_id: pageId,
    p_title: title,
    p_price: price,
    p_description: description,
  });
  if (error) {
    await deletePrivateObject(objectKey);
    throw new Error(error.message);
  }

  await supabase
    .from("digital_products")
    .update({
      cover_image_path: coverImagePath,
      storage_provider: "r2",
      storage_bucket: process.env.R2_PRIVATE_BUCKET,
      storage_object_key: objectKey,
      original_file_name: file.name,
      mime_type: file.type,
      file_size: file.size,
    })
    .eq("id", product.id);

  revalidatePath(`/dashboard/pages/${pageId}`);
  revalidatePath("/dashboard/digital-products");
}

export async function updateDigitalProductAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  const id = Number(formData.get("id"));
  const pageId = Number(formData.get("page_id"));
  const title = String(formData.get("title") ?? "").trim();
  const description = normalizeDescriptionToHtml((formData.get("description") as string) || null) || null;
  const priceRaw = formData.get("price") as string;
  const price = priceRaw ? Number(priceRaw) : 0;
  const coverFile = formData.get("cover_image") as File | null;
  const file = formData.get("file") as File | null; // optional — replaces the sold file

  if (!title) throw new Error("Title is required");

  const supabase = await createClient();
  const update: Record<string, unknown> = { title, description, price, updated_at: new Date().toISOString() };

  if (coverFile && coverFile.size > 0) {
    const webpBuffer = await resizeToWebp(Buffer.from(await coverFile.arrayBuffer()), 1280, 720);
    const coverImagePath = `digital-products/${crypto.randomUUID()}.webp`;
    await uploadPublicObject(coverImagePath, webpBuffer, "image/webp");
    update.cover_image_path = coverImagePath;
  }

  if (file && file.size > 0) {
    const { data: existing } = await supabase
      .from("digital_products")
      .select("storage_object_key, storage_provider")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    const objectKey = `digital-products/${crypto.randomUUID()}.${file.name.split(".").pop()}`;
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    await uploadPrivateObject(objectKey, fileBuffer, file.type || "application/octet-stream");

    update.storage_provider = "r2";
    update.storage_bucket = process.env.R2_PRIVATE_BUCKET;
    update.storage_object_key = objectKey;
    update.original_file_name = file.name;
    update.mime_type = file.type;
    update.file_size = file.size;

    if (existing?.storage_object_key) {
      if (existing.storage_provider === "r2") {
        await deletePrivateObject(existing.storage_object_key);
      } else {
        await supabase.storage.from("digital-products").remove([existing.storage_object_key]);
      }
    }
  }

  const { error } = await supabase.from("digital_products").update(update).eq("id", id).eq("user_id", user.id);
  if (error) throw new Error(error.message);

  revalidatePath(`/dashboard/pages/${pageId}`);
  revalidatePath("/dashboard/digital-products");
}

export async function deleteDigitalProductAction(id: number, pageId: number) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  const supabase = await createClient();
  const { data: product } = await supabase
    .from("digital_products")
    .select("storage_object_key, storage_provider")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  const { error } = await supabase.from("digital_products").delete().eq("id", id).eq("user_id", user.id);
  if (error) throw new Error(error.message);

  if (product?.storage_object_key) {
    if (product.storage_provider === "r2") {
      await deletePrivateObject(product.storage_object_key);
    } else {
      await supabase.storage.from("digital-products").remove([product.storage_object_key]);
    }
  }

  revalidatePath(`/dashboard/pages/${pageId}`);
  revalidatePath("/dashboard/digital-products");
}
