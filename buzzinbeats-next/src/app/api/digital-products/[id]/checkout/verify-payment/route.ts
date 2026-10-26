import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { sendPurchaseConfirmationEmail } from "@/lib/brevo";

/** Mirrors DigitalProductPaymentController::verifyPayment() — step 4. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, sale_id: saleId } = await request.json();

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !saleId) {
    return NextResponse.json({ error: "Invalid request" }, { status: 422 });
  }

  const supabase = createAdminClient();
  const { data: sale } = await supabase
    .from("digital_product_sales")
    .select("*, digital_products(title)")
    .eq("id", saleId)
    .eq("digital_product_id", id)
    .eq("razorpay_order_id", razorpay_order_id)
    .maybeSingle();

  if (!sale) return NextResponse.json({ error: "Checkout session not found." }, { status: 404 });
  if (!sale.email_verified_at) {
    return NextResponse.json({ error: "Email not verified for this checkout session." }, { status: 422 });
  }

  if (!verifyPaymentSignature({ orderId: razorpay_order_id, paymentId: razorpay_payment_id, signature: razorpay_signature })) {
    await supabase.from("digital_product_sales").update({ status: "failed" }).eq("id", sale.id);
    return NextResponse.json({ error: "Payment verification failed. Please contact support if amount was deducted." }, { status: 422 });
  }

  await supabase
    .from("digital_product_sales")
    .update({
      razorpay_payment_id,
      razorpay_signature,
      status: "paid",
      purchased_at: new Date().toISOString(),
    })
    .eq("id", sale.id);

  const downloadUrl = `${new URL(request.url).origin}/digital-product/${id}/download?token=${sale.access_token}`;
  const product = sale.digital_products as unknown as { title: string } | null;

  // Mail failure must never fail an already-successful payment.
  try {
    await sendPurchaseConfirmationEmail({
      toEmail: sale.buyer_email,
      buyerName: sale.buyer_name,
      productTitle: product?.title ?? "Digital Product",
      downloadUrl,
    });
  } catch {
    // logged nowhere yet — acceptable, matches Laravel's Log::warning-and-continue
  }

  return NextResponse.json({ success: true, access_token: sale.access_token, download_url: downloadUrl });
}
