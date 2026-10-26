import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyWebhookSignature } from "@/lib/razorpay";

/**
 * Mirrors Laravel PaymentController::webhook(). Razorpay signs the raw
 * request body — must read request.text() (not .json()) before any
 * parsing, or the HMAC will never match. No CSRF protection needed here
 * (this is a server-to-server webhook, not a browser form), matching the
 * Laravel route's CSRF exemption for this one path.
 */
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!signature || !verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ message: "Invalid signature" }, { status: 400 });
  }

  const payload = JSON.parse(rawBody);
  const event = payload.event as string;
  const data = payload.payload?.payment?.entity;

  if (event === "payment.captured") {
    await updatePaymentStatus(data?.id, "paid");
  } else if (event === "payment.failed") {
    await updatePaymentStatus(data?.id, "failed");
  }

  return NextResponse.json({ status: "ok" });
}

async function updatePaymentStatus(razorpayPaymentId: string | undefined, status: "paid" | "failed") {
  if (!razorpayPaymentId) return;
  const supabase = createAdminClient();
  await supabase
    .from("payments")
    .update({ status })
    .eq("razorpay_payment_id", razorpayPaymentId);
}
