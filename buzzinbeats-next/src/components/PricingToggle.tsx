"use client";

import Link from "next/link";
import { useState } from "react";

export type PricingFeature = { label: string; enabled: boolean };

export type PricingCardData = {
  slug: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  isPopular: boolean;
  badgeLabel?: string;
  features: PricingFeature[];
  ctaState: "current" | "upgrade" | "downgrade" | "default";
  monthlyHref: string;
  yearlyHref: string;
};

const CTA_LABEL: Record<PricingCardData["ctaState"], string> = {
  current: "Extend Plan",
  upgrade: "Upgrade Now",
  downgrade: "Downgrade",
  default: "Get Started",
};

function ctaClasses(state: PricingCardData["ctaState"], isPopular: boolean) {
  if (state === "current") {
    return "w-full py-3 rounded-2xl bg-slate-100 text-slate-900 font-bold text-center hover:bg-slate-200 transition-colors text-sm";
  }
  if (state === "upgrade") {
    return "w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-primary-warm text-white font-bold text-center shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] transition-all";
  }
  if (state === "downgrade") {
    return "w-full py-4 rounded-2xl bg-slate-100 text-slate-900 font-bold text-center hover:bg-slate-200 transition-colors";
  }
  return `w-full py-4 rounded-2xl font-bold text-center transition-all ${
    isPopular
      ? "bg-gradient-to-r from-primary to-primary-warm text-white shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02]"
      : "bg-slate-100 text-slate-900 hover:bg-slate-200"
  }`;
}

export default function PricingToggle({ plans }: { plans: PricingCardData[] }) {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  return (
    <>
      {/* Billing Toggle */}
      <div className="flex justify-center mb-12">
        <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 shadow-inner">
          <button
            type="button"
            onClick={() => setBilling("monthly")}
            className={`px-8 py-3 rounded-xl font-black text-sm transition-all duration-300 ${
              billing === "monthly" ? "bg-white text-slate-900 shadow-md" : "text-slate-500 hover:text-primary"
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setBilling("yearly")}
            className={`relative px-8 py-3 rounded-xl font-black text-sm transition-all duration-300 ${
              billing === "yearly" ? "bg-white text-slate-900 shadow-md" : "text-slate-500 hover:text-primary"
            }`}
          >
            Yearly
            <div className="absolute -top-3 -right-3 px-2 py-0.5 bg-green-500 text-white text-[9px] font-black rounded-full uppercase tracking-widest shadow-lg rotate-12">
              Save 20%
            </div>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div
        className="grid grid-cols-1 gap-8 mb-24"
        style={{ gridTemplateColumns: `repeat(${Math.min(plans.length || 1, 3)}, minmax(0, 1fr))` }}
      >
        {plans.map((plan) => {
          const price = billing === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
          const href = billing === "monthly" ? plan.monthlyHref : plan.yearlyHref;
          return (
            <div
              key={plan.slug}
              className={`relative flex flex-col gap-6 rounded-[2.5rem] p-8 pricing-card-hover transition-all duration-300 ${
                plan.isPopular
                  ? "border-2 border-primary bg-white shadow-2xl"
                  : "border border-slate-200 bg-white/50 backdrop-blur-sm"
              }`}
            >
              {plan.badgeLabel && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-black px-6 py-2 rounded-full uppercase tracking-[0.2em] shadow-lg shadow-primary/25">
                  {plan.badgeLabel}
                </div>
              )}

              <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-bold text-slate-900">{plan.name}</h2>
                <div className="flex items-baseline gap-1 mt-4">
                  <span className="text-5xl font-black tracking-tight text-slate-900">
                    &#8377;{price.toLocaleString("en-IN")}
                  </span>
                  <span className="text-slate-500 text-lg font-medium">
                    /{billing === "monthly" ? "month" : "year"}
                  </span>
                </div>
              </div>

              {plan.ctaState === "current" ? (
                <div className="flex flex-col gap-2">
                  <div className="w-full py-2 rounded-2xl bg-green-100 text-green-700 font-bold text-center border border-green-200 text-sm">
                    Current Plan
                  </div>
                  <Link href={href} className={ctaClasses("current", plan.isPopular)}>
                    {CTA_LABEL.current}
                  </Link>
                </div>
              ) : (
                <Link href={href} className={ctaClasses(plan.ctaState, plan.isPopular)}>
                  {CTA_LABEL[plan.ctaState]}
                </Link>
              )}

              <div className="flex flex-col gap-4 mt-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Features:</p>
                <ul className="flex flex-col gap-4">
                  {plan.features.map((feature) => (
                    <li
                      key={feature.label}
                      className={`flex items-center gap-3 text-sm font-medium ${
                        feature.enabled ? "text-slate-700" : "group relative cursor-help text-slate-400"
                      }`}
                    >
                      <span
                        className={`material-symbols-outlined text-[20px] ${
                          feature.enabled ? "text-primary" : ""
                        }`}
                      >
                        {feature.enabled ? "check_circle" : "lock"}
                      </span>
                      <span className={feature.enabled ? "" : "line-through opacity-70"}>{feature.label}</span>
                      {!feature.enabled && (
                        <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-48 p-2 bg-slate-800 text-white text-xs rounded-lg shadow-lg z-10">
                          Available in higher plans. Upgrade to unlock!
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
