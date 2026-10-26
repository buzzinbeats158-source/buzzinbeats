"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/data/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { getItemInfo } from "@/lib/amazon";

const BASE = "/manage-56buzzinbeats-qr-master-admin-page/redirect";

const DEFAULT_SETTINGS = {
  page_title: "Redirect Page",
  hero_title: "This page is currently unavailable.",
  hero_subtitle: "Please explore featured recommendations or return to the homepage.",
  button_1_label: "Go to Homepage",
  button_1_url: "/",
  button_1_enabled: true,
  button_2_label: "Explore Deals",
  button_2_url: "/deals",
  button_2_enabled: true,
  button_3_label: "",
  button_3_url: "",
  button_3_enabled: false,
  fallback_landing_url: "",
  fallback_landing_enabled: false,
  is_active: false,
};

export async function getOrCreateRedirectPageSettings() {
  const supabase = createAdminClient();
  const { data: existing } = await supabase.from("redirect_page_settings").select("*").limit(1).maybeSingle();
  if (existing) return existing;

  const { data: created, error } = await supabase.from("redirect_page_settings").insert(DEFAULT_SETTINGS).select("*").single();
  if (error) throw new Error(error.message);
  return created;
}

export async function updateRedirectPageSettingsAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  const settings = await getOrCreateRedirectPageSettings();

  const strip = (v: FormDataEntryValue | null) => String(v ?? "").replace(/<[^>]*>/g, "");

  const { error } = await supabase
    .from("redirect_page_settings")
    .update({
      page_title: strip(formData.get("page_title")),
      hero_title: strip(formData.get("hero_title")),
      hero_subtitle: strip(formData.get("hero_subtitle")),
      button_1_label: strip(formData.get("button_1_label")),
      button_1_url: String(formData.get("button_1_url") ?? ""),
      button_1_enabled: formData.get("button_1_enabled") === "on",
      button_2_label: strip(formData.get("button_2_label")),
      button_2_url: String(formData.get("button_2_url") ?? ""),
      button_2_enabled: formData.get("button_2_enabled") === "on",
      button_3_label: strip(formData.get("button_3_label")),
      button_3_url: String(formData.get("button_3_url") ?? ""),
      button_3_enabled: formData.get("button_3_enabled") === "on",
      fallback_landing_url: String(formData.get("fallback_landing_url") ?? ""),
      fallback_landing_enabled: formData.get("fallback_landing_enabled") === "on",
      is_active: formData.get("is_active") === "on",
    })
    .eq("id", settings.id);
  if (error) throw new Error(error.message);

  revalidatePath(BASE);
}

export async function updateStoreIdAction(formData: FormData) {
  const admin = await requireAdmin();
  const supabase = createAdminClient();
  const storeId = String(formData.get("amazon_store_id") ?? "").trim();
  if (!storeId) throw new Error("Amazon Partner Tag (Store ID) is required.");

  const { error } = await supabase.from("users").update({ amazon_store_id: storeId }).eq("id", admin.id);
  if (error) throw new Error(error.message);

  revalidatePath(BASE);
}

const ASIN_PATTERN = /^[A-Z0-9]{10}$/;

export async function autoAddRedirectProductsAction(asins: string[], section: "trending" | "flash_deals") {
  const admin = await requireAdmin();
  const supabase = createAdminClient();

  if (!admin.amazon_store_id) {
    throw new Error("Amazon Partner Tag (Store ID) is not configured on your admin account. Please set it above first.");
  }

  const cleaned = Array.from(new Set(asins.map((a) => a.trim().toUpperCase()).filter(Boolean))).slice(0, 10);
  const valid = cleaned.filter((a) => ASIN_PATTERN.test(a));

  if (valid.length === 0) {
    throw new Error("Please provide at least one valid ASIN (exactly 10 letters/numbers).");
  }

  const { data: maxRow } = await supabase
    .from("redirect_page_products")
    .select("sort_order")
    .eq("section", section)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  let nextSortOrder = (maxRow?.sort_order ?? 0) + 1;

  const created: string[] = [];
  const failed: string[] = [];

  for (const asin of valid) {
    const { data: info, error: amazonError } = await getItemInfo(asin, admin.amazon_store_id);
    if (!info) {
      failed.push(`${asin}${amazonError ? ` (${amazonError})` : ""}`);
      continue;
    }

    const { error } = await supabase.from("redirect_page_products").insert({
      amazon_asin: asin,
      title: (info.title || "Amazon Product").slice(0, 500),
      image_url: info.image,
      product_url: `https://www.amazon.in/dp/${asin}?tag=${admin.amazon_store_id}`,
      price: info.price,
      sort_order: nextSortOrder++,
      is_active: true,
      section,
    });

    if (error) {
      failed.push(`${asin} (${error.message})`);
      continue;
    }
    created.push(asin);
  }

  revalidatePath(BASE);
  return { created, failed };
}

export async function toggleRedirectProductAction(id: number, current: boolean) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from("redirect_page_products").update({ is_active: !current }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(BASE);
}

export async function removeRedirectProductAction(id: number) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from("redirect_page_products").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(BASE);
}

export async function reorderRedirectProductsAction(orderedIds: number[]) {
  await requireAdmin();
  const supabase = createAdminClient();
  await Promise.all(
    orderedIds.map((id, index) => supabase.from("redirect_page_products").update({ sort_order: index + 1 }).eq("id", id))
  );
  revalidatePath(BASE);
}
