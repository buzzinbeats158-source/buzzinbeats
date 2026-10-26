import "server-only";
import crypto from "node:crypto";
import Razorpay from "razorpay";
import { getActiveRazorpayKeyId } from "@/lib/payment-gateway";

/** Key ID is DB-backed (admin panel, no redeploy needed); secret always
 * comes from the server-only env var. */
export async function razorpayClient() {
  const keyId = (await getActiveRazorpayKeyId()) || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!;
  return new Razorpay({
    key_id: keyId,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });
}

/**
 * Mirrors Laravel PaymentController::verify() ->
 * $razorpay->utility->verifyPaymentSignature(). Razorpay's documented
 * algorithm: expected = HMAC_SHA256(order_id + "|" + payment_id, key_secret),
 * hex digest, compared to the signature the client returned after checkout.
 */
export function verifyPaymentSignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}) {
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(`${params.orderId}|${params.paymentId}`)
    .digest("hex");

  return timingSafeEqualHex(expected, params.signature);
}

/**
 * Mirrors Laravel PaymentController::webhook() HMAC check:
 * expected = HMAC_SHA256(raw_body, webhook_secret), hex digest.
 * `rawBody` MUST be the exact unparsed request body — recomputing the
 * signature from a re-serialized JSON object will not match.
 */
export function verifyWebhookSignature(rawBody: string, signature: string) {
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(rawBody)
    .digest("hex");

  return timingSafeEqualHex(expected, signature);
}

function timingSafeEqualHex(a: string, b: string) {
  const bufA = Buffer.from(a, "hex");
  const bufB = Buffer.from(b, "hex");
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}
