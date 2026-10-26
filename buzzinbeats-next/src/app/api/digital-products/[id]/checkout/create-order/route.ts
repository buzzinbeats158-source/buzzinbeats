import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { razorpayClient } from "@/lib/razorpay";
import { getActiveRazorpayKeyId } from "@/lib/payment-gateway";

/** Mirrors DigitalProductPaymentController::createOrder() — step 3. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { sale_id: saleId } = await request.json();
  if (!saleId) return NextResponse.json({ error: "Invalid request" }, { status: 422 });

  const supabase = createAdminClient();
  const { data: sale } = await supabase
    .from("digital_product_sales")
    .select("*")
    .eq("id", saleId)
    .eq("digital_product_id", id)
    .maybeSingle();

  if (!sale) return NextResponse.json({ error: "Checkout session not found." }, { status: 404 });
  if (!sale.email_verified_at) return NextResponse.json({ error: "Please verify your email first." }, { status: 422 });
  if (sale.status !== "pending") return NextResponse.json({ error: "This checkout session is no longer valid." }, { status: 422 });

  const amountPaise = Math.max(100, Math.round(Number(sale.amount) * 100));

  try {
    const client = await razorpayClient();
    const order = await client.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: `dp_${id}_${Date.now()}`,
      payment_capture: true,
      notes: { digital_product_id: String(id), sale_id: String(sale.id), buyer_email: sale.buyer_email },
    });

    await supabase.from("digital_product_sales").update({ razorpay_order_id: order.id }).eq("id", sale.id);

    return NextResponse.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key: await getActiveRazorpayKeyId(),
      sale_id: sale.id,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Payment gateway error. Please try again.";
    await supabase.from("digital_product_sales").update({ status: "failed" }).eq("id", sale.id);
    await supabase
      .from("payment_attempt_logs")
      .insert({ plan_key: `digital_product_${id}`, stage: "create_order", status: "failed", error_message: message });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
