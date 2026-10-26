import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

/** Direct port of Laravel CouponService. */
export async function validateCoupon(code: string, userId: number, plan: string, amount: number) {
  const supabase = createAdminClient();
  const { data: coupon } = await supabase
    .from("coupons")
    .select("*")
    .eq("code", code.trim().toUpperCase())
    .maybeSingle();

  if (!coupon) return { valid: false as const, message: "Invalid coupon code." };
  if (coupon.status === "disabled") return { valid: false as const, message: "This coupon has been disabled." };
  if (coupon.status === "expired") return { valid: false as const, message: "This coupon has expired." };

  const now = new Date();
  if (coupon.starts_at && now < new Date(coupon.starts_at)) {
    return { valid: false as const, message: "This coupon is not active yet." };
  }
  if (coupon.ends_at && now > new Date(coupon.ends_at)) {
    return { valid: false as const, message: "This coupon has expired." };
  }
  if (coupon.usage_limit !== null && coupon.used_count >= coupon.usage_limit) {
    return { valid: false as const, message: "This coupon has reached its usage limit." };
  }
  if (coupon.applies_to_plan !== "all" && coupon.applies_to_plan !== plan) {
    return { valid: false as const, message: `This coupon is only valid for the ${coupon.applies_to_plan} plan.` };
  }

  const audienceError = await checkAudience(coupon, userId);
  if (audienceError) return { valid: false as const, message: audienceError };

  if (coupon.minimum_amount !== null && amount < Number(coupon.minimum_amount)) {
    return { valid: false as const, message: `Minimum order amount of ₹${Math.round(coupon.minimum_amount)} required for this coupon.` };
  }

  const discount = calculateDiscount(coupon, amount);
  const final = Math.max(0, Math.round((amount - discount) * 100) / 100);

  return { valid: true as const, coupon, discount, final };
}

export function calculateDiscount(coupon: { discount_type: string; discount_value: number }, amount: number) {
  const discount =
    coupon.discount_type === "percent"
      ? Math.round(amount * (coupon.discount_value / 100) * 100) / 100
      : Math.min(coupon.discount_value, amount);
  return Math.max(0, discount);
}

export async function redeemCoupon(couponId: number, userId: number, paymentId: number | null, originalAmount: number, discountAmount: number, code: string) {
  const supabase = createAdminClient();
  await supabase.from("coupon_redemptions").insert({
    coupon_id: couponId,
    user_id: userId,
    payment_id: paymentId,
    code_snapshot: code,
    discount_amount: discountAmount,
    original_amount: originalAmount,
    final_amount: Math.max(0, Math.round((originalAmount - discountAmount) * 100) / 100),
    used_at: new Date().toISOString(),
  });

  const { data: coupon } = await supabase.from("coupons").select("used_count").eq("id", couponId).maybeSingle();
  await supabase.from("coupons").update({ used_count: (coupon?.used_count ?? 0) + 1 }).eq("id", couponId);
}

async function checkAudience(coupon: { audience_type: string; specific_user_id: number | null }, userId: number): Promise<string | null> {
  const supabase = createAdminClient();
  if (coupon.audience_type === "new_users" || coupon.audience_type === "existing_users") {
    const { count } = await supabase
      .from("payments")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "paid");
    const hasPrevious = (count ?? 0) > 0;
    if (coupon.audience_type === "new_users" && hasPrevious) return "This coupon is only valid for new users.";
    if (coupon.audience_type === "existing_users" && !hasPrevious) return "This coupon is only valid for existing subscribers.";
  }
  if (coupon.audience_type === "specific_user" && coupon.specific_user_id !== userId) {
    return "This coupon is not valid for your account.";
  }
  return null;
}

/** Fallback hardcoded plan config — matches Subscription::planConfig()'s
 * fallback branch, used since subscription_plans is empty (no plans
 * configured in the DB yet). */
export const PLAN_CONFIG: Record<string, { name: string; pages: number; monthly: number; yearly: number }> = {
  starter: { name: "Starter", pages: 5, monthly: 149, yearly: 1430 },
  growth: { name: "Growth", pages: 15, monthly: 299, yearly: 2870 },
  pro: { name: "Pro", pages: 100, monthly: 999, yearly: 9590 },
};
