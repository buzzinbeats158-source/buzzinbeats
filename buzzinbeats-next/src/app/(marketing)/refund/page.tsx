import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy | BuzzinBeats",
  description:
    "Clear information about subscriptions, cancellations, and billing for BuzzinBeats users.",
};

export default function RefundPage() {
  return (
    <div className="gradient-mesh min-h-screen">
      <main className="max-w-7xl mx-auto px-6 py-12 md:py-24">
        {/* Hero Section */}
        <section className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            <span className="text-xs font-bold tracking-wider uppercase">Legal Information</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 font-display tracking-tight mb-6">
            Refund &amp; Cancellation Policy
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Clear information about subscriptions, cancellations, and billing for BuzzinBeats users. We believe in
            transparency and fair service for our creator community.
          </p>
        </section>

        {/* Refund Policy Bento Grid */}
        <section className="mb-32">
          <div className="flex items-center gap-3 mb-10">
            <span className="material-symbols-outlined text-primary text-3xl">account_balance_wallet</span>
            <h2 className="text-3xl font-bold font-display text-slate-900">Refund Policy</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-lg border border-primary/5">
              <h3 className="text-xl font-bold mb-4 text-primary font-display">Service Access Model</h3>
              <p className="text-slate-500 leading-relaxed mb-6">
                BuzzinBeats operates on a subscription-based model. Your payment covers the immediate access to
                our link management tools, product landing page suite, and administrative infrastructure. By
                completing your purchase, you gain instant access to our premium digital services.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/50">
                  <span className="material-symbols-outlined text-primary mb-2 block">verified</span>
                  <p className="font-bold text-sm mb-1 text-slate-900">Standard Eligibility</p>
                  <p className="text-xs text-slate-500">
                    Refunds are typically processed for technical failures preventing core service use within the
                    first 7 days.
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/50">
                  <span className="material-symbols-outlined text-primary mb-2 block">psychology</span>
                  <p className="font-bold text-sm mb-1 text-slate-900">Case-by-Case Review</p>
                  <p className="text-xs text-slate-500">
                    Our billing team reviews specific hardship or accidental duplicate payment cases manually.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary to-primary-warm text-white p-8 rounded-[2.5rem] shadow-xl flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold mb-4">Refund Timelines</h3>
                <p className="text-white/80 text-sm leading-relaxed mb-6">
                  Once a refund is approved by our compliance team, it will be initiated immediately.
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4 border-b border-white/20 pb-4">
                  <span className="text-3xl font-bold tracking-tighter">5–7</span>
                  <span className="text-xs font-medium uppercase tracking-widest">Business Days for Processing</span>
                </div>
                <p className="text-xs opacity-70 italic">
                  *Actual time depends on your bank and payment method (Razorpay/Stripe).
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Cancellation Process */}
        <section className="mb-32">
          <div className="flex items-center gap-3 mb-10">
            <span className="material-symbols-outlined text-primary text-3xl">cancel</span>
            <h2 className="text-3xl font-bold font-display text-slate-900">Cancellation Process</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="group">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-primary mb-6 transition-transform group-hover:-translate-y-1">
                01
              </div>
              <h4 className="font-bold mb-2 text-slate-900">Access Your Dashboard</h4>
              <p className="text-sm text-slate-500">
                Log in to your BuzzinBeats account at <span className="font-semibold text-slate-700">buzzinbeats.com</span>{" "}
                and go to your <span className="font-semibold text-slate-700">Dashboard</span>.
              </p>
            </div>
            <div className="group">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-primary mb-6 transition-transform group-hover:-translate-y-1">
                02
              </div>
              <h4 className="font-bold mb-2 text-slate-900">Open Subscription Settings</h4>
              <p className="text-sm text-slate-500">
                Click your profile icon in the sidebar, then select{" "}
                <span className="font-semibold text-slate-700">Subscription &amp; Billing</span> from the profile
                menu.
              </p>
            </div>
            <div className="group">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-primary mb-6 transition-transform group-hover:-translate-y-1">
                03
              </div>
              <h4 className="font-bold mb-2 text-slate-900">Cancel Your Plan</h4>
              <p className="text-sm text-slate-500">
                On the Subscription page, locate your active plan card and click the{" "}
                <span className="font-semibold text-slate-700">&quot;Cancel Plan&quot;</span> button. Confirm the
                action when prompted.
              </p>
            </div>
            <div className="group">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-primary mb-6 transition-transform group-hover:-translate-y-1">
                04
              </div>
              <h4 className="font-bold mb-2 text-slate-900">Need Help?</h4>
              <p className="text-sm text-slate-500">
                If you encounter any issues,{" "}
                <Link href="/support" className="font-semibold text-primary hover:underline">
                  submit a support ticket
                </Link>{" "}
                and our team will process the cancellation for you.
              </p>
            </div>
          </div>
          <div className="mt-10 p-6 bg-orange-50 rounded-2xl border border-primary/10 flex items-start gap-4">
            <span className="material-symbols-outlined text-primary mt-0.5">info</span>
            <p className="text-sm text-slate-600 leading-relaxed">
              <span className="font-bold text-slate-900">Your access continues until the end of the billing period.</span>{" "}
              Cancelling your plan stops future renewals but you retain full access to all features until your
              current cycle expires.
            </p>
          </div>
        </section>

        {/* Billing Structure */}
        <section className="mb-32">
          <div className="flex flex-col md:flex-row gap-12">
            <div className="w-full md:w-1/3">
              <div className="md:sticky md:top-12">
                <span className="material-symbols-outlined text-primary text-3xl mb-4 block">receipt_long</span>
                <h2 className="text-3xl font-bold font-display text-slate-900 mb-6">Billing Structure</h2>
                <p className="text-slate-500 leading-relaxed">
                  We provide flexible billing cycles to accommodate independent creators and professional teams.
                </p>
              </div>
            </div>
            <div className="w-full md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-6 bg-white rounded-3xl border border-slate-200/50 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="w-10 h-10 bg-primary/5 rounded-lg flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-primary">calendar_month</span>
                </div>
                <h4 className="font-bold mb-2 text-slate-900">Monthly Cycles</h4>
                <p className="text-sm text-slate-500">Billed every 30 days from your initial subscription date automatically.</p>
              </div>
              <div className="p-6 bg-white rounded-3xl border border-slate-200/50 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="w-10 h-10 bg-primary/5 rounded-lg flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-primary">layers_clear</span>
                </div>
                <h4 className="font-bold mb-2 text-slate-900">Extra Resources</h4>
                <p className="text-sm text-slate-500">Additional landing pages or product features outside your plan are charged per-use.</p>
              </div>
              <div className="p-6 bg-white rounded-3xl border border-slate-200/50 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="w-10 h-10 bg-primary/5 rounded-lg flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-primary">price_check</span>
                </div>
                <h4 className="font-bold mb-2 text-slate-900">Transparent Pricing</h4>
                <p className="text-sm text-slate-500">No hidden fees. Taxes are calculated based on your geographic location at checkout.</p>
              </div>
              <div className="p-6 bg-white rounded-3xl border border-slate-200/50 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="w-10 h-10 bg-primary/5 rounded-lg flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-primary">history</span>
                </div>
                <h4 className="font-bold mb-2 text-slate-900">Billing History</h4>
                <p className="text-sm text-slate-500">Download PDF invoices for your records directly from your Subscription &amp; Billing page.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Plan Expiry & Data Retention */}
        <section className="mb-32 p-12 bg-slate-50 rounded-[3rem] border border-slate-200/50">
          <div className="max-w-3xl mx-auto text-center">
            <span className="material-symbols-outlined text-primary text-4xl mb-4 block">timer_off</span>
            <h2 className="text-3xl font-bold font-display text-slate-900 mb-6">Plan Expiry &amp; Data Retention</h2>
            <div className="space-y-6 text-slate-500 leading-relaxed text-left">
              <p>
                When your subscription expires and is not renewed, your account will transition to a{" "}
                <strong className="text-slate-900">Restricted Tier</strong>. Advanced features, analytics
                dashboards, and link management tools will be disabled.
              </p>
              <p>
                We value your content and data. Your metadata, page configurations, and basic account information
                are retained for <strong className="text-slate-900">90 days (3 months)</strong> after plan expiry.
                You can re-activate your subscription anytime within this window to restore full access to your
                historical data.
              </p>
              <div className="bg-white rounded-2xl border border-primary/10 p-5 flex items-start gap-4 mt-4">
                <span className="material-symbols-outlined text-orange-500 mt-0.5 shrink-0">warning</span>
                <div>
                  <p className="font-bold text-slate-900 mb-1">Important: Data retention is limited to 90 days</p>
                  <p className="text-sm text-slate-500">
                    Retention is <strong>not</strong> extended to 180 days. After 90 days of inactivity post-expiry,
                    your data may be permanently removed from our servers. We strongly recommend re-activating your
                    plan promptly to avoid data loss.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Billing Support Section */}
        <section className="mb-32 grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white p-8 md:p-16 rounded-[2.5rem] shadow-2xl overflow-hidden relative">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-3xl font-extrabold font-display text-slate-900 mb-6">Billing Support</h2>
            <p className="text-slate-500 mb-8 leading-relaxed">
              Have questions about a specific charge or need help managing your account? Our dedicated billing
              team is standing by to assist you.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white shrink-0">
                  <span className="material-symbols-outlined">mail</span>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-primary tracking-widest">Email Support</p>
                  <p className="font-bold text-lg text-slate-900">support@buzzinbeats.com</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <span className="material-symbols-outlined">schedule</span>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-slate-400 tracking-widest">Response Time</p>
                  <p className="font-bold text-slate-900">Typically within 24 hours</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <span className="material-symbols-outlined">confirmation_number</span>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-slate-400 tracking-widest">Track Your Request</p>
                  <Link href="/support" className="font-bold text-primary hover:underline">
                    Submit a support ticket
                  </Link>
                </div>
              </div>
            </div>
          </div>
          {/* Link management visual */}
          <div className="relative z-10 flex items-center justify-center">
            <div className="w-full max-w-sm bg-slate-50 rounded-[2rem] p-8 border border-slate-100 shadow-inner">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">link</span>
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">Link Management</p>
                  <p className="text-xs text-slate-400">BuzzinBeats Platform</p>
                </div>
                <span className="ml-auto w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 bg-white rounded-xl p-3 border border-slate-100 shadow-sm">
                  <span className="material-symbols-outlined text-primary text-lg">storefront</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">Product Landing Page</p>
                    <p className="text-[10px] text-slate-400 truncate">buzzinbeats.com/p/...</p>
                  </div>
                  <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Live</span>
                </div>
                <div className="flex items-center gap-3 bg-white rounded-xl p-3 border border-slate-100 shadow-sm">
                  <span className="material-symbols-outlined text-primary text-lg">qr_code</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">QR Code Generator</p>
                    <p className="text-[10px] text-slate-400 truncate">Scan → product page</p>
                  </div>
                  <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Active</span>
                </div>
                <div className="flex items-center gap-3 bg-white rounded-xl p-3 border border-slate-100 shadow-sm">
                  <span className="material-symbols-outlined text-primary text-lg">analytics</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">Click Analytics</p>
                    <p className="text-[10px] text-slate-400 truncate">1,284 clicks this month</p>
                  </div>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Tracking</span>
                </div>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <p className="text-xs text-slate-400">Your data is safe with us</p>
                <span className="material-symbols-outlined text-slate-300 text-lg">verified_user</span>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="text-center py-20 border-t border-slate-200/50">
          <h3 className="text-2xl font-bold font-display text-slate-900 mb-4">Need help with your subscription?</h3>
          <p className="text-slate-500 mb-10">Get in touch with us or explore our flexible pricing plans.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/support"
              className="px-8 py-4 bg-gradient-to-r from-primary to-primary-warm text-white rounded-xl font-bold shadow-lg shadow-primary/30 hover:-translate-y-1 transition-all active:scale-95"
            >
              Contact Support
            </Link>
            <Link
              href="/pricing"
              className="px-8 py-4 bg-slate-100 text-slate-900 rounded-xl font-bold hover:bg-slate-200 transition-all active:scale-95"
            >
              View Pricing
            </Link>
          </div>
        </section>
      </main>
      {/* Decorative bottom accent */}
      <div className="w-full h-1 bg-gradient-to-r from-primary to-primary-warm" />
    </div>
  );
}
