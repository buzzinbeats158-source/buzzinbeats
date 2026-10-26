"use client";

import { useState } from "react";
import Script from "next/script";

type Product = {
  id: number;
  title: string;
  price: number;
  currency_symbol: string;
  delivery_note: string | null;
};

type Step = "closed" | "details" | "otp" | "paying" | "done";

export default function DigitalProductCheckout({ product }: { product: Product }) {
  const [step, setStep] = useState<Step>("closed");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [saleId, setSaleId] = useState<number | null>(null);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isFree = Number(product.price) <= 0;

  function openCheckout() {
    if (isFree) {
      window.location.href = `/digital-product/${product.id}/download`;
      return;
    }
    setStep("details");
    setError(null);
  }

  async function submitDetails(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/digital-products/${product.id}/checkout/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ buyer_name: name, buyer_email: email, buyer_phone: phone || null }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSaleId(data.sale_id);
      setStep("otp");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function submitOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const verifyRes = await fetch(`/api/digital-products/${product.id}/checkout/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sale_id: saleId, otp }),
      });
      const verifyData = await verifyRes.json();
      if (verifyData.error) throw new Error(verifyData.error);

      const orderRes = await fetch(`/api/digital-products/${product.id}/checkout/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sale_id: saleId }),
      });
      const order = await orderRes.json();
      if (order.error) throw new Error(order.error);

      setStep("paying");
      const rzp = new window.Razorpay({
        key: order.key,
        amount: order.amount,
        currency: order.currency,
        name: "BuzzinBeats",
        description: product.title,
        order_id: order.order_id,
        handler: async (response) => {
          const verifyPayRes = await fetch(`/api/digital-products/${product.id}/checkout/verify-payment`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...response, sale_id: saleId }),
          });
          const verifyPay = await verifyPayRes.json();
          if (!verifyPay.success) {
            setError(verifyPay.error || "Payment verification failed.");
            setStep("otp");
            return;
          }
          setDownloadUrl(verifyPay.download_url);
          setStep("done");
        },
        modal: { ondismiss: () => setStep("otp") },
      });
      rzp.open();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setStep("otp");
    } finally {
      setLoading(false);
    }
  }

  if (step === "closed") {
    return (
      <button
        onClick={openCheckout}
        className="flex w-full items-center justify-center gap-1 rounded-lg bg-primary px-2 py-1.5 text-[11px] font-bold text-white hover:bg-primary/90"
      >
        {isFree ? "Download Free" : `Buy ${product.currency_symbol}${Number(product.price).toFixed(2)}`}
      </button>
    );
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
          {step !== "done" && (
            <button onClick={() => setStep("closed")} className="mb-2 text-xs text-slate-400 hover:text-slate-600">
              Close
            </button>
          )}

          {step === "details" && (
            <form onSubmit={submitDetails} className="flex flex-col gap-3">
              <h3 className="text-lg font-bold">{product.title}</h3>
              <p className="text-sm text-slate-500">
                {product.currency_symbol}
                {Number(product.price).toFixed(2)}
              </p>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" required className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone (optional)" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              {error && <p className="text-xs font-medium text-red-600">{error}</p>}
              <button type="submit" disabled={loading} className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white disabled:opacity-60">
                {loading ? "Sending code..." : "Continue"}
              </button>
            </form>
          )}

          {(step === "otp" || step === "paying") && (
            <form onSubmit={submitOtp} className="flex flex-col gap-3">
              <h3 className="text-lg font-bold">Verify your email</h3>
              <p className="text-sm text-slate-500">Enter the 6-digit code sent to {email}</p>
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                required
                maxLength={6}
                className="rounded-lg border border-slate-300 px-3 py-2 text-center text-lg tracking-widest"
              />
              {error && <p className="text-xs font-medium text-red-600">{error}</p>}
              <button type="submit" disabled={loading || step === "paying"} className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white disabled:opacity-60">
                {step === "paying" ? "Processing payment..." : loading ? "Verifying..." : "Verify & Pay"}
              </button>
            </form>
          )}

          {step === "done" && (
            <div className="flex flex-col items-center gap-3 text-center">
              <span className="material-symbols-outlined text-4xl text-green-500">check_circle</span>
              <h3 className="text-lg font-bold">Purchase complete!</h3>
              <p className="text-sm text-slate-500">A confirmation email is on its way to {email}.</p>
              <a href={downloadUrl!} className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white">
                Download now
              </a>
              <button onClick={() => setStep("closed")} className="text-xs text-slate-400 hover:text-slate-600">
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
