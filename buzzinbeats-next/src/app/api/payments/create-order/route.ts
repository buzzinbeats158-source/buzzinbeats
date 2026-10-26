import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/data/current-user";
import { razorpayClient } from "@/lib/razorpay";
import { validateCoupon, PLAN_CONFIG } from "@/lib/coupons";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { plan, cycle, months, coupon_code: couponCode } = await request.json();

  if (!plan || !(plan in PLAN_CONFIG) || !["monthly", "yearly"].includes(cycle) || !months || months < 1 || months > 24) {
    return NextResponse.json({ error: "Invalid request" }, { status: 422 });
  }

  const monthlyPrice = PLAN_CONFIG[plan].monthly;
  const originalAmount = monthlyPrice * months;
  let discountAmount = 0;
  let finalAmount = originalAmount;
  let appliedCouponCode: string | null = null;

  if (couponCode) {
    const result = await validateCoupon(couponCode, user.id, plan, originalAmount);
    if (result.valid) {
      discountAmount = result.discount;
      finalAmount = result.final;
      appliedCouponCode = result.coupon.code;
    }
  }

  const amountPaise = Math.max(100, Math.round(finalAmount * 100));

  try {
    const client = await razorpayClient();
    const order = await client.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: `buzz_${user.id}_${Date.now()}`,
      payment_capture: true,
      notes: {
        user_id: String(user.id),
        plan,
        cycle,
        months: String(months),
        coupon_code: appliedCouponCode ?? "",
        original_amount: String(originalAmount),
        discount_amount: String(discountAmount),
      },
    });

    return NextResponse.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      months,
      original_amount: originalAmount,
      discount_amount: discountAmount,
      final_amount: finalAmount,
      coupon_code: appliedCouponCode,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Payment gateway error. Please try again.";
    await createAdminClient()
      .from("payment_attempt_logs")
      .insert({ user_id: user.id, plan_key: plan, stage: "create_order", status: "failed", error_message: message });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
