import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendOtpEmail } from "@/lib/brevo";
import { hashOtp } from "@/lib/otp";

/** Mirrors DigitalProductPaymentController::startCheckout() — step 1: create
 * a pending sale, send a 6-digit OTP to verify the buyer's email. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const { buyer_name: buyerName, buyer_email: buyerEmail, buyer_phone: buyerPhone } = body;

  if (!buyerName || !buyerEmail) {
    return NextResponse.json({ error: "Name and email are required" }, { status: 422 });
  }

  const supabase = createAdminClient();
  const { data: product } = await supabase
    .from("digital_products")
    .select("id, page_id, user_id, price, currency_code, status")
    .eq("id", id)
    .eq("status", "active")
    .maybeSingle();

  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (Number(product.price) <= 0) {
    return NextResponse.json({ error: "This product is free and does not require payment." }, { status: 422 });
  }

  // Rate-limit: one OTP request per email per product per 60s.
  const { data: recentSale } = await supabase
    .from("digital_product_sales")
    .select("id, created_at")
    .eq("digital_product_id", product.id)
    .eq("buyer_email", buyerEmail)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (recentSale && Date.now() - new Date(recentSale.created_at).getTime() < 60_000) {
    return NextResponse.json({ error: "Please wait 60 seconds before requesting a new code." }, { status: 429 });
  }

  const { data: sale, error: saleError } = await supabase
    .from("digital_product_sales")
    .insert({
      digital_product_id: product.id,
      page_id: product.page_id,
      seller_user_id: product.user_id,
      buyer_name: buyerName,
      buyer_email: buyerEmail,
      buyer_phone: buyerPhone ?? null,
      amount: product.price,
      currency: product.currency_code ?? "INR",
      status: "pending",
      access_token: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (saleError || !sale) {
    return NextResponse.json({ error: saleError?.message ?? "Failed to start checkout" }, { status: 500 });
  }

  const otpCode = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = new Date(Date.now() + 10 * 60_000);

  await supabase.from("digital_product_email_verifications").insert({
    digital_product_sale_id: sale.id,
    otp_hash: hashOtp(otpCode),
    attempts: 0,
    expires_at: expiresAt.toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  try {
    await sendOtpEmail(buyerEmail, otpCode);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed to send verification email. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ sale_id: sale.id, message: "Verification code sent to your email." });
}
