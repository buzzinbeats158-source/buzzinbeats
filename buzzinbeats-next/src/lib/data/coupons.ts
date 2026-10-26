"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/data/admin";
import { createAdminClient } from "@/lib/supabase/admin";

const BASE = "/manage-56buzzinbeats-qr-master-admin-page/coupons";

function couponFieldsFromForm(formData: FormData) {
  const startsDate = String(formData.get("starts_at_date") ?? "");
  const startsTime = String(formData.get("starts_at_time") ?? "");
  const endsDate = String(formData.get("ends_at_date") ?? "");
  const endsTime = String(formData.get("ends_at_time") ?? "");

  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  const discountValue = Number(formData.get("discount_value") ?? 0);
  if (!code) throw new Error("Coupon code is required.");
  if (!discountValue || discountValue <= 0) throw new Error("Discount value must be greater than 0.");

  const audienceType = String(formData.get("audience_type") ?? "all");
  const specificUserId = formData.get("specific_user_id") ? Number(formData.get("specific_user_id")) : null;
  if (audienceType === "specific_user" && !specificUserId) {
    throw new Error("Specific user ID is required when audience is \"Specific User\".");
  }

  return {
    code,
    title: String(formData.get("title") ?? "").trim() || null,
    description: String(formData.get("description") ?? "").trim() || null,
    discount_type: String(formData.get("discount_type") ?? "percent"),
    discount_value: discountValue,
    applies_to_plan: String(formData.get("applies_to_plan") ?? "all"),
    audience_type: audienceType,
    specific_user_id: audienceType === "specific_user" ? specificUserId : null,
    minimum_amount: formData.get("minimum_amount") ? Number(formData.get("minimum_amount")) : null,
    usage_limit: formData.get("usage_limit") ? Number(formData.get("usage_limit")) : null,
    starts_at: startsDate ? `${startsDate}T${startsTime || "00:00"}:00` : null,
    ends_at: endsDate ? `${endsDate}T${endsTime || "00:00"}:00` : null,
    status: String(formData.get("status") ?? "active"),
  };
}

export async function generateCouponCode() {
  await requireAdmin();
  const supabase = createAdminClient();
  const random = () =>
    Array.from({ length: 4 }, () => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 32)]).join("");

  let code = `${random()}-${random()}`;
  while (true) {
    const { data } = await supabase.from("coupons").select("id").eq("code", code).maybeSingle();
    if (!data) return code;
    code = `${random()}-${random()}`;
  }
}

export async function createCouponAction(formData: FormData) {
  const admin = await requireAdmin();
  const supabase = createAdminClient();
  const fields = couponFieldsFromForm(formData);

  const { error } = await supabase.from("coupons").insert({
    ...fields,
    used_count: 0,
    created_by_admin_id: admin.id,
  });
  if (error) throw new Error(error.code === "23505" ? `Coupon code "${fields.code}" already exists.` : error.message);

  revalidatePath(BASE);
}

export async function updateCouponAction(id: number, formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();
  const fields = couponFieldsFromForm(formData);

  const { error } = await supabase.from("coupons").update(fields).eq("id", id);
  if (error) throw new Error(error.code === "23505" ? `Coupon code "${fields.code}" already exists.` : error.message);

  revalidatePath(BASE);
}

export async function toggleCouponAction(id: number, current: string) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("coupons")
    .update({ status: current === "active" ? "disabled" : "active" })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(BASE);
}

export async function duplicateCouponAction(id: number) {
  const admin = await requireAdmin();
  const supabase = createAdminClient();
  const { data: coupon } = await supabase.from("coupons").select("*").eq("id", id).maybeSingle();
  if (!coupon) throw new Error("Coupon not found.");

  let newCode = `${coupon.code}_COPY`;
  let suffix = 2;
  while (true) {
    const { data } = await supabase.from("coupons").select("id").eq("code", newCode).maybeSingle();
    if (!data) break;
    newCode = `${coupon.code}_COPY${suffix++}`;
  }

  const { error } = await supabase.from("coupons").insert({
    code: newCode,
    title: coupon.title ? `${coupon.title} (Copy)` : null,
    description: coupon.description,
    discount_type: coupon.discount_type,
    discount_value: coupon.discount_value,
    applies_to_plan: coupon.applies_to_plan,
    audience_type: coupon.audience_type,
    specific_user_id: coupon.specific_user_id,
    minimum_amount: coupon.minimum_amount,
    usage_limit: coupon.usage_limit,
    starts_at: coupon.starts_at,
    ends_at: coupon.ends_at,
    status: "disabled",
    used_count: 0,
    created_by_admin_id: admin.id,
  });
  if (error) throw new Error(error.message);
  revalidatePath(BASE);
}

export async function deleteCouponAction(id: number) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from("coupons").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(BASE);
}
