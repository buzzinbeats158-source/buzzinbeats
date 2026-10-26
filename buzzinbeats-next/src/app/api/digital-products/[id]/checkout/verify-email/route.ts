import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyOtp } from "@/lib/otp";

/** Mirrors DigitalProductPaymentController::verifyEmail() — step 2. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { sale_id: saleId, otp } = await request.json();

  if (!saleId || !otp || String(otp).length !== 6) {
    return NextResponse.json({ error: "Invalid request" }, { status: 422 });
  }

  const supabase = createAdminClient();
  const { data: sale } = await supabase
    .from("digital_product_sales")
    .select("id")
    .eq("id", saleId)
    .eq("digital_product_id", id)
    .eq("status", "pending")
    .maybeSingle();

  if (!sale) return NextResponse.json({ error: "Checkout session not found." }, { status: 404 });

  const { data: verification } = await supabase
    .from("digital_product_email_verifications")
    .select("*")
    .eq("digital_product_sale_id", sale.id)
    .is("verified_at", null)
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!verification) {
    return NextResponse.json({ error: "No verification request found. Please restart checkout." }, { status: 422 });
  }
  if (verification.attempts >= 3) {
    return NextResponse.json({ error: "Maximum attempts reached. Please restart checkout." }, { status: 422 });
  }
  if (new Date() > new Date(verification.expires_at)) {
    return NextResponse.json({ error: "Verification code expired. Please restart checkout." }, { status: 422 });
  }
  if (!verifyOtp(String(otp), verification.otp_hash)) {
    await supabase
      .from("digital_product_email_verifications")
      .update({ attempts: verification.attempts + 1 })
      .eq("id", verification.id);
    return NextResponse.json({ error: "Invalid verification code." }, { status: 422 });
  }

  const now = new Date().toISOString();
  await supabase.from("digital_product_email_verifications").update({ verified_at: now }).eq("id", verification.id);
  await supabase.from("digital_product_sales").update({ email_verified_at: now }).eq("id", sale.id);

  return NextResponse.json({ verified: true });
}
