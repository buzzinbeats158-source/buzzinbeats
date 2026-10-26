import { redirect } from "next/navigation";
import { PLAN_CONFIG } from "@/lib/coupons";
import { getActiveRazorpayKeyId } from "@/lib/payment-gateway";
import CheckoutForm from "@/components/CheckoutForm";

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; cycle?: string }>;
}) {
  const { plan, cycle = "monthly" } = await searchParams;

  if (!plan || !(plan in PLAN_CONFIG)) {
    redirect("/profile/subscription");
  }

  const razorpayKeyId = await getActiveRazorpayKeyId();

  return (
    <div className="mx-auto max-w-2xl">
      <CheckoutForm plan={plan} planData={PLAN_CONFIG[plan]} cycle={cycle} razorpayKeyId={razorpayKeyId} />
    </div>
  );
}
