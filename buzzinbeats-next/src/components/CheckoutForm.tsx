"use client";

import { useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";

const PLAN_BLURBS: Record<string, string> = {
  starter: "Essential tools to get started",
  growth: "Professional tools for rising creators",
  pro: "Unlimited power for serious creators",
};

export default function CheckoutForm({
  plan,
  planData,
  cycle,
  razorpayKeyId,
}: {
  plan: string;
  planData: { name: string; monthly: number; yearly: number };
  cycle: string;
  razorpayKeyId: string;
}) {
  const router = useRouter();
  const [months, setMonths] = useState(1);
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const subtotal = planData.monthly * months;
  const discount = coupon?.discount ?? 0;
  const total = Math.max(0, subtotal - discount);

  async function applyCoupon() {
    setCouponError(null);
    if (!couponInput.trim()) return;
    const res = await fetch("/api/payments/validate-coupon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: couponInput, plan, amount: subtotal }),
    });
    const data = await res.json();
    if (!data.valid) {
      setCouponError(data.message || "Invalid coupon");
      setCoupon(null);
      return;
    }
    setCoupon({ code: data.code, discount: data.discount });
  }

  async function handlePay() {
    setPaying(true);
    setError(null);
    try {
      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, cycle, months, coupon_code: coupon?.code ?? null }),
      });
      const order = await orderRes.json();
      if (order.error) throw new Error(order.error);

      const rzp = new window.Razorpay({
        key: razorpayKeyId,
        amount: order.amount,
        currency: order.currency,
        name: "BuzzinBeats",
        description: `${planData.name} Plan — ${months} month${months > 1 ? "s" : ""}`,
        order_id: order.order_id,
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          const verifyRes = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...response,
              plan,
              cycle,
              months,
              coupon_code: coupon?.code ?? null,
            }),
          });
          const verify = await verifyRes.json();
          if (!verify.success) {
            setError(verify.message || "Payment verification failed.");
            return;
          }
          setSuccess(verify.message);
          setTimeout(() => router.push("/profile/subscription"), 2000);
        },
        modal: { ondismiss: () => setPaying(false) },
      });
      rzp.open();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Payment gateway error. Please try again.");
    } finally {
      setPaying(false);
    }
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="flex items-center gap-3 pb-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20">
          <span className="material-symbols-outlined">receipt_long</span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight">Checkout</h1>
      </div>

      <div className="relative overflow-hidden rounded-[2.5rem] border border-primary/5 bg-white p-8 shadow-lg">
        <div className="flex items-start justify-between border-b border-slate-100 pb-6">
          <div>
            <p className="text-lg font-bold text-primary">{planData.name} Plan</p>
            <p className="mt-1 text-sm text-slate-500">{PLAN_BLURBS[plan]}</p>
          </div>
          <p className="whitespace-nowrap text-lg font-bold">
            ₹{planData.monthly.toLocaleString()} <span className="text-xs font-medium text-slate-400">/ month</span>
          </p>
        </div>

        <div className="space-y-4 border-b border-slate-100 py-6">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Duration</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMonths((m) => Math.max(1, m - 1))}
                disabled={months <= 1}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 disabled:opacity-40"
              >
                −
              </button>
              <span className="w-20 text-center font-bold">{months} Month{months > 1 ? "s" : ""}</span>
              <button
                onClick={() => setMonths((m) => Math.min(24, m + 1))}
                disabled={months >= 24}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 disabled:opacity-40"
              >
                +
              </button>
            </div>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Subtotal</span>
            <span className="font-semibold text-slate-900">₹{subtotal.toLocaleString()}</span>
          </div>
          {coupon && (
            <div className="flex justify-between text-emerald-600">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">local_offer</span>
                Coupon Discount
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-black">{coupon.code}</span>
              </span>
              <span className="font-bold">−₹{discount.toLocaleString()}</span>
            </div>
          )}
        </div>

        <div className="space-y-2 py-6">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Coupon Code</label>
          <div className="flex gap-2">
            <input
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
              placeholder="Enter code"
              className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm uppercase outline-none focus:border-primary"
            />
            <button onClick={applyCoupon} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white">
              Apply
            </button>
          </div>
          {couponError && <p className="text-xs font-medium text-red-600">{couponError}</p>}
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-6">
          <span className="text-lg font-bold">Total</span>
          <span className="text-2xl font-black text-primary">₹{total.toLocaleString()}</span>
        </div>

        {error && <p className="mt-4 text-sm font-medium text-red-600">{error}</p>}
        {success && <p className="mt-4 text-sm font-medium text-green-600">{success}</p>}

        <button
          onClick={handlePay}
          disabled={paying || !razorpayKeyId}
          className="mt-6 w-full rounded-2xl bg-primary py-4 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-primary/20 disabled:opacity-60"
        >
          {paying ? "Processing..." : `Pay ₹${total.toLocaleString()}`}
        </button>
        {!razorpayKeyId && (
          <p className="mt-2 text-center text-xs text-amber-600">Payment gateway is not configured. Please contact support.</p>
        )}
      </div>
    </>
  );
}
