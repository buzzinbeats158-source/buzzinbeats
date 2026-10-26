import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/data/current-user";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { validateCoupon, redeemCoupon, PLAN_CONFIG } from "@/lib/coupons";

const PLAN_RANK: Record<string, number> = { starter: 1, growth: 2, pro: 3 };

/** Mirrors Laravel PaymentController::verify() — upgrade/downgrade/same-plan
 * logic, subscription + payment record creation, coupon redemption. */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });

  const body = await request.json();
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan, cycle, months, coupon_code: couponCode } = body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !(plan in PLAN_CONFIG)) {
    return NextResponse.json({ success: false, message: "Invalid request" }, { status: 422 });
  }

  if (!verifyPaymentSignature({ orderId: razorpay_order_id, paymentId: razorpay_payment_id, signature: razorpay_signature })) {
    await createAdminClient()
      .from("payment_attempt_logs")
      .insert({ user_id: user.id, plan_key: plan, stage: "verify_payment", status: "failed", error_code: "SIGNATURE_MISMATCH", error_message: "Razorpay signature verification failed" });
    return NextResponse.json(
      { success: false, message: "Payment verification failed. Please contact support if amount was deducted." },
      { status: 400 },
    );
  }

  const monthsNum = Number(months);
  const originalAmount = PLAN_CONFIG[plan].monthly * monthsNum;
  let discountAmount = 0;
  let finalAmount = originalAmount;
  let coupon: { id: number; code: string } | null = null;

  if (couponCode) {
    const result = await validateCoupon(couponCode, user.id, plan, originalAmount);
    if (result.valid) {
      coupon = result.coupon;
      discountAmount = result.discount;
      finalAmount = result.final;
    }
  }

  const supabase = createAdminClient();

  const { data: currentSub } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const isDowngrade = !!currentSub && (PLAN_RANK[plan] ?? 0) < (PLAN_RANK[currentSub.plan] ?? 0);

  // Cancel any previously scheduled (pending downgrade) subscription
  await supabase
    .from("subscriptions")
    .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("status", "scheduled");

  let subscriptionId: number;

  if (isDowngrade && currentSub) {
    const scheduledStart = new Date(currentSub.expires_at);
    scheduledStart.setDate(scheduledStart.getDate() + 1);
    const scheduledExpires = new Date(scheduledStart);
    scheduledExpires.setMonth(scheduledExpires.getMonth() + monthsNum);

    const { data: sub, error } = await supabase
      .from("subscriptions")
      .insert({
        user_id: user.id,
        plan,
        billing_cycle: cycle,
        status: "scheduled",
        price: finalAmount,
        currency: "INR",
        started_at: scheduledStart.toISOString().slice(0, 10),
        expires_at: scheduledExpires.toISOString().slice(0, 10),
      })
      .select("id")
      .single();
    if (error || !sub) return NextResponse.json({ success: false, message: error?.message }, { status: 500 });
    subscriptionId = sub.id;
  } else {
    let startedAt = new Date();
    let expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + monthsNum);

    if (currentSub) {
      if (currentSub.plan === plan) {
        const currentExpires = new Date(currentSub.expires_at);
        const baseDate = currentExpires > new Date() ? currentExpires : new Date();
        expiresAt = new Date(baseDate);
        expiresAt.setMonth(expiresAt.getMonth() + monthsNum);
        startedAt = new Date(currentSub.started_at);
      }
      if (currentSub.status !== "cancelled") {
        await supabase
          .from("subscriptions")
          .update({ status: "cancelled", cancelled_at: new Date().toISOString(), expires_at: new Date().toISOString().slice(0, 10) })
          .eq("id", currentSub.id);
      }
    }

    const { data: sub, error } = await supabase
      .from("subscriptions")
      .insert({
        user_id: user.id,
        plan,
        billing_cycle: cycle,
        status: "active",
        price: finalAmount,
        currency: "INR",
        started_at: startedAt.toISOString().slice(0, 10),
        expires_at: expiresAt.toISOString().slice(0, 10),
      })
      .select("id")
      .single();
    if (error || !sub) return NextResponse.json({ success: false, message: error?.message }, { status: 500 });
    subscriptionId = sub.id;
  }

  const invoiceNumber = `INV-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  const { data: payment, error: paymentError } = await supabase
    .from("payments")
    .insert({
      user_id: user.id,
      subscription_id: subscriptionId,
      invoice_number: invoiceNumber,
      amount: finalAmount,
      original_amount: originalAmount,
      discount_amount: discountAmount,
      final_paid_amount: finalAmount,
      coupon_id: coupon?.id ?? null,
      coupon_code: coupon?.code ?? null,
      currency: "INR",
      payment_method: "razorpay",
      transaction_id: razorpay_payment_id,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      status: "paid",
      paid_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (paymentError || !payment) {
    await supabase
      .from("payment_attempt_logs")
      .insert({ user_id: user.id, plan_key: plan, stage: "verify_payment", status: "failed", error_code: "DB_INSERT_FAILED", error_message: paymentError?.message ?? "Unknown error" });
    return NextResponse.json({ success: false, message: paymentError?.message }, { status: 500 });
  }

  if (coupon) {
    await redeemCoupon(coupon.id, user.id, payment.id, originalAmount, discountAmount, coupon.code);
  }

  if (isDowngrade && currentSub) {
    const scheduledDate = new Date(currentSub.expires_at);
    scheduledDate.setDate(scheduledDate.getDate() + 1);
    return NextResponse.json({
      success: true,
      message: `Payment successful! Your ${plan} plan is scheduled and will be activated on ${scheduledDate.toLocaleDateString()}.`,
    });
  }

  return NextResponse.json({ success: true, message: `Payment successful! Your ${plan} plan is now active.` });
}
