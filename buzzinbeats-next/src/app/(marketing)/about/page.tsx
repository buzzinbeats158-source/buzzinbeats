import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About BuzzinBeats | Premium Creator Tools",
  description:
    "Helping creators turn product links into clean, high-converting landing pages that build trust and drive more sales.",
};

export default function AboutPage() {
  return (
    <div className="gradient-mesh">
      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 py-24 text-center">
        <span className="inline-block px-4 py-1.5 mb-6 text-sm font-bold tracking-wider text-primary bg-primary/10 rounded-full uppercase">
          Our Mission
        </span>
        <h1 className="text-5xl md:text-7xl font-extrabold font-display tracking-tighter text-slate-900 mb-8">
          About <span className="text-primary">BuzzinBeats</span>
        </h1>
        <p className="text-xl md:text-2xl text-slate-500 max-w-3xl mx-auto leading-relaxed mb-12">
          Helping creators turn product links into clean, high-converting landing pages that build trust and drive
          more sales.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/register"
            className="bg-gradient-to-r from-primary to-primary-warm text-white px-10 py-5 rounded-xl font-bold text-lg shadow-xl shadow-primary/30 hover:-translate-y-1 transition-all duration-300 active:scale-95"
          >
            Get Started
          </Link>
          <Link
            href="/pricing"
            className="bg-slate-50 text-slate-900 px-10 py-5 rounded-xl font-bold text-lg border border-slate-200 hover:bg-slate-100 transition-all duration-300 active:scale-95"
          >
            View Pricing
          </Link>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center bg-white p-12 md:p-20 rounded-[2.5rem] shadow-lg border border-primary/5">
          <div className="space-y-6">
            <h2 className="text-4xl font-bold font-display tracking-tight text-slate-900">
              The Messy Link Problem
            </h2>
            <p className="text-lg text-slate-500 leading-relaxed">
              For years, creators have struggled with ugly, raw affiliate links that look suspicious to followers.
              These long strings of characters break trust and result in thousands of lost clicks every day.
            </p>
            <div className="p-6 bg-red-50 border-l-4 border-red-500 rounded-r-xl">
              <p className="text-red-600 font-semibold italic">
                &quot;I was losing 40% of my potential sales just because the links looked like spam.&quot;
              </p>
            </div>
          </div>
          <div className="space-y-6">
            <h2 className="text-4xl font-bold font-display tracking-tight text-primary">
              The BuzzinBeats Solution
            </h2>
            <p className="text-lg text-slate-500 leading-relaxed">
              We built BuzzinBeats to bridge the gap between discovery and purchase. Our platform transforms any
              product link into a stunning, branded experience that looks professional and converts effortlessly.
            </p>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">check_circle</span>
                <span className="font-medium text-slate-900">Instant conversion from raw link to landing page</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">check_circle</span>
                <span className="font-medium text-slate-900">SEO-optimized product descriptions</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* What We Do: Bento Grid */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold font-display text-slate-900 mb-4">What We Do</h2>
          <p className="text-slate-500">The engine behind your creator commerce</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white p-8 rounded-3xl shadow-lg border border-primary/5 hover:-translate-y-2 transition-all duration-300">
            <span className="material-symbols-outlined text-4xl text-primary mb-4 block">web</span>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">Product Landing Pages</h3>
            <p className="text-slate-500">
              Beautifully designed, high-converting pages generated in seconds for every product you promote.
            </p>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-lg border border-primary/5 hover:-translate-y-2 transition-all duration-300">
            <span className="material-symbols-outlined text-4xl text-primary mb-4 block">build</span>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Smart Product Tools</h3>
            <p className="text-slate-500">Automated metadata fetching and image optimization.</p>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-lg border border-primary/5 hover:-translate-y-2 transition-all duration-300">
            <span className="material-symbols-outlined text-4xl text-primary mb-4 block">analytics</span>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Analytics</h3>
            <p className="text-slate-500">Deep insights into click rates and conversion triggers.</p>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-lg border border-primary/5 hover:-translate-y-2 transition-all duration-300">
            <span className="material-symbols-outlined text-4xl text-primary mb-4 block">health_and_safety</span>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Link Health Monitoring</h3>
            <p className="text-slate-500">Get notified the second a link breaks or product goes out of stock.</p>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-lg border border-primary/5 hover:-translate-y-2 transition-all duration-300">
            <span className="material-symbols-outlined text-4xl text-primary mb-4 block">rocket_launch</span>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Creator Growth Tools</h3>
            <p className="text-slate-500">Built-in marketing features to scale your audience.</p>
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="bg-slate-50 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-4xl font-bold font-display text-slate-900 mb-4">Who It&apos;s For</h2>
              <p className="text-slate-500 text-lg">Designed for the modern digital entrepreneur.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/50 text-center flex flex-col items-center group hover:bg-primary hover:text-white transition-all duration-300 cursor-default">
              <span className="material-symbols-outlined text-3xl mb-3 text-slate-700 group-hover:text-white group-hover:scale-110 transition-all">
                video_library
              </span>
              <p className="font-bold text-slate-900 group-hover:text-white transition-colors">YouTubers</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/50 text-center flex flex-col items-center group hover:bg-primary hover:text-white transition-all duration-300 cursor-default">
              <span className="material-symbols-outlined text-3xl mb-3 text-slate-700 group-hover:text-white group-hover:scale-110 transition-all">
                person
              </span>
              <p className="font-bold text-slate-900 group-hover:text-white transition-colors">Influencers</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/50 text-center flex flex-col items-center group hover:bg-primary hover:text-white transition-all duration-300 cursor-default">
              <span className="material-symbols-outlined text-3xl mb-3 text-slate-700 group-hover:text-white group-hover:scale-110 transition-all">
                sell
              </span>
              <p className="font-bold text-slate-900 group-hover:text-white transition-colors">Affiliate Marketers</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/50 text-center flex flex-col items-center group hover:bg-primary hover:text-white transition-all duration-300 cursor-default">
              <span className="material-symbols-outlined text-3xl mb-3 text-slate-700 group-hover:text-white group-hover:scale-110 transition-all">
                draw
              </span>
              <p className="font-bold text-slate-900 group-hover:text-white transition-colors">Content Creators</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/50 text-center flex flex-col items-center group hover:bg-primary hover:text-white transition-all duration-300 cursor-default">
              <span className="material-symbols-outlined text-3xl mb-3 text-slate-700 group-hover:text-white group-hover:scale-110 transition-all">
                store
              </span>
              <p className="font-bold text-slate-900 group-hover:text-white transition-colors">Small Businesses</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose BuzzinBeats */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <h2 className="text-4xl font-bold font-display text-center text-slate-900 mb-16">Why Choose BuzzinBeats</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 bg-white rounded-3xl border border-primary/10 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-primary">touch_app</span>
            </div>
            <h4 className="text-xl font-bold text-slate-900 mb-3">Easy to Use</h4>
            <p className="text-slate-500">Intuitive dashboard designed for creators, not developers. No coding required.</p>
          </div>
          <div className="p-8 bg-white rounded-3xl border border-primary/10 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-primary">speed</span>
            </div>
            <h4 className="text-xl font-bold text-slate-900 mb-3">Fast Setup</h4>
            <p className="text-slate-500">Go from a raw link to a live, beautiful landing page in under 60 seconds.</p>
          </div>
          <div className="p-8 bg-white rounded-3xl border border-primary/10 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-primary">smartphone</span>
            </div>
            <h4 className="text-xl font-bold text-slate-900 mb-3">Mobile Friendly</h4>
            <p className="text-slate-500">Pages look stunning on every device, optimized for mobile-first scrolling.</p>
          </div>
          <div className="p-8 bg-white rounded-3xl border border-primary/10 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-primary">trending_up</span>
            </div>
            <h4 className="text-xl font-bold text-slate-900 mb-3">Conversion Focused</h4>
            <p className="text-slate-500">Every pixel is engineered to reduce friction and increase buyer confidence.</p>
          </div>
          <div className="p-8 bg-white rounded-3xl border border-primary/10 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-primary">support_agent</span>
            </div>
            <h4 className="text-xl font-bold text-slate-900 mb-3">Reliable Support</h4>
            <p className="text-slate-500">
              Our team is here to help you scale, from technical setups to marketing strategy.
            </p>
          </div>
          <div className="p-8 bg-white rounded-3xl border border-primary/10 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-primary">payments</span>
            </div>
            <h4 className="text-xl font-bold text-slate-900 mb-3">Affordable Pricing</h4>
            <p className="text-slate-500">Scalable plans that grow with you, from hobbyist to full-time entrepreneur.</p>
          </div>
        </div>
      </section>

      {/* Our Mission Banner */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="relative overflow-hidden bg-gradient-to-r from-primary to-primary-warm p-12 md:p-24 rounded-[3rem] text-center text-white shadow-2xl shadow-primary/40">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 100 100">
              <defs>
                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold font-display mb-8 relative z-10">Our Mission</h2>
          <p className="text-2xl md:text-4xl font-medium max-w-4xl mx-auto leading-tight relative z-10">
            &quot;To make product promotion simple, professional, and accessible for every creator.&quot;
          </p>
        </div>
      </section>

      {/* Trust Section */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-slate-500">verified_user</span>
            </div>
            <h5 className="font-bold text-slate-900">Secure Payment</h5>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-slate-500">visibility</span>
            </div>
            <h5 className="font-bold text-slate-900">Transparent Pricing</h5>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-slate-500">mail</span>
            </div>
            <h5 className="font-bold text-slate-900">Email Support</h5>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-slate-500">update</span>
            </div>
            <h5 className="font-bold text-slate-900">Continuous Improvements</h5>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-7xl mx-auto px-6 py-32">
        <div className="bg-white border border-primary/20 rounded-[2.5rem] p-12 md:p-20 text-center relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary-warm/5 rounded-full blur-3xl" />
          <h2 className="text-4xl md:text-5xl font-bold font-display text-slate-900 mb-6">
            Ready to grow with BuzzinBeats?
          </h2>
          <p className="text-xl text-slate-500 mb-12 max-w-2xl mx-auto">
            Start building your first product landing page today and see the conversion difference for yourself.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link
              href="/register"
              className="bg-gradient-to-r from-primary to-primary-warm text-white px-12 py-5 rounded-xl font-bold text-lg shadow-xl shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1 transition-all duration-300"
            >
              Create Your First Page
            </Link>
            <Link href="/support" className="text-primary font-bold text-lg px-8 py-5 flex items-center gap-2 group">
              Contact Support
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
