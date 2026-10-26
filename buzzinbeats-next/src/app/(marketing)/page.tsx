import Link from "next/link";
import HeroCarousel from "@/components/HeroCarousel";
import CreatorMarquee from "@/components/CreatorMarquee";

const OLD_WAY_ROWS = [
  { icon: "link_off", title: "Broken links silently", body: "Dead ends for your followers." },
  { icon: "timer_off", title: "Old videos stop earning", body: "Content shelf-life is expired." },
  { icon: "edit_document", title: "Manual updates everywhere", body: "Hours wasted editing descriptions." },
  { icon: "touch_app", title: "Link in bio friction", body: "70% bounce rate at checkout." },
  { icon: "storefront", title: "Amazon only", body: "Limited to a single ecosystem." },
  { icon: "bar_chart_4_bars", title: "No earning insights", body: "Flying blind without data." },
  { icon: "qr_code_2", title: "Old QR outdated", body: "Reprints cost time and money." },
];

const NEW_WAY_ROWS = [
  { icon: "notifications_active", title: "Instant alerts", body: "Real-time link health monitoring." },
  { icon: "trending_up", title: "Old videos keep earning", body: "Evergreen conversion automation." },
  { icon: "cloud_sync", title: "Update once globally", body: "One dashboard. Every link updated." },
  { icon: "bolt", title: "Scan and buy instantly", body: "Direct-to-cart QR technology." },
  { icon: "hub", title: "Any store supported", body: "Shopify, Etsy, Amazon & custom shops." },
  { icon: "monitoring", title: "Detailed analytics", body: "Know exactly where your money starts." },
  { icon: "all_inclusive", title: "One QR works forever", body: "Dynamic routing for lifetime utility." },
];

const BENTO_FEATURES = [
  {
    span: "md:col-span-2",
    className: "bg-background-light border border-primary/5 shadow-lg group",
    icon: "dynamic_feed",
    iconWrap: "bg-white shadow-md",
    iconColor: "text-primary",
    title: "Bulk ASIN input — paste and go",
    body: "Drop a list of ASINs separated by commas, spaces, or newlines. BuzzinBeats validates every one, removes duplicates automatically, and fetches the product title, image, and description in seconds. Add 20 products in the time it used to take to add one.",
    wide: true,
  },
  {
    className: "bg-primary text-white shadow-xl shadow-primary/20",
    icon: "insights",
    iconColor: "text-white",
    title: "Real-time analytics dashboard",
    body: "Total page views, unique visitors, click-through rate, top-performing products, store performance, and device breakdown — all updated live.",
    bodyClass: "text-white/80",
  },
  {
    className: "bg-white border border-primary/10 shadow-lg",
    icon: "grid_view",
    iconColor: "text-primary",
    title: "5 layout styles — one click to switch",
    body: "Grid Card, Horizontal List, Featured + Grid, Compact Grid, Single Column.",
  },
  {
    className: "bg-background-light border border-primary/5 group hover:bg-primary transition-colors",
    icon: "badge",
    iconColor: "text-primary group-hover:text-white transition-colors",
    title: "One store ID. Infinite affiliate links.",
    titleClass: "group-hover:text-white transition-colors",
    body: "Enter your Amazon affiliate Store ID once. Every product you add automatically gets your affiliate link baked in.",
    bodyClass: "text-slate-600 group-hover:text-white/80 transition-colors",
  },
  {
    className: "bg-white border border-primary/10 shadow-lg",
    icon: "shield",
    iconColor: "text-primary",
    title: "Your 24/7 affiliate link bodyguard",
    body: "BuzzinBeats monitors your product links around the clock. The moment a product goes out of stock or a link breaks, you get an instant alert.",
  },
];

const HOW_IT_WORKS = [
  { title: "Sign up and get your creator ID", body: "Create your free account. You'll get a unique ID (e.g., BB001) that identifies all your pages on the platform." },
  { title: "Enter your Amazon affiliate Store ID", body: "Add your Store ID once. Every affiliate link on every product page you ever create will use it automatically." },
  { title: "Create a page and choose your layout", body: "Name your page, pick one of 5 layouts, and you're ready to add products. Each page gets its own unique shareable link." },
  { title: "Add products by ASIN", body: "Paste one ASIN or a hundred. BuzzinBeats fetches the image, title, and description from Amazon and builds the product cards automatically." },
  { title: "Publish and share", body: "Hit publish. Share your page link in video descriptions, story swipe-ups, tweets, or emails — or embed the QR code directly in your video." },
  { title: "Watch analytics roll in", body: "Every view, every click, every conversion is tracked. Log in any time to see what's performing and optimise for more earnings." },
];

const QR_BRIDGE_STEPS = [
  { icon: "smart_display", text: "Viewer watches your video on any platform" },
  { icon: "qr_code_2", text: "They scan the QR code shown on screen" },
  { icon: "web", text: "They land on your product page instantly" },
  { icon: "shopping_cart_checkout", text: 'They click "Buy on Amazon" — you earn the commission' },
];

const TESTIMONIALS = [
  {
    quote:
      "I used to spend 30 minutes per video manually updating affiliate links. Now I just swap the ASIN in my BuzzinBeats dashboard and it updates everywhere instantly. It's saved me hours every single week.",
    initial: "A",
    name: "Amit K.",
    role: "Tech YouTuber · 180K subscribers",
  },
  {
    quote:
      "The QR code feature completely changed how I monetise my Reels. My click-through rate went from 1.2% to 6.8% because viewers don't have to leave Instagram to shop. This is the feature I didn't know I needed.",
    initial: "P",
    name: "Priya R.",
    role: "Lifestyle Influencer · 94K followers",
  },
  {
    quote:
      "I had three years of blog posts with broken Amazon links quietly killing my income. BuzzinBeats let me migrate everything in one afternoon and the old redirects just worked. I didn't lose a single visitor.",
    initial: "S",
    name: "Suresh M.",
    role: "Affiliate Blogger · 5 years experience",
  },
];

export default function HomePage() {
  return (
    <>
      <style>{`
        /* Hero Carousel */
        .hero-carousel { position: relative; height: 780px; overflow: hidden; }
        @media(min-width:768px){ .hero-carousel { height: 700px; } }
        .hero-track { display: flex; height: 100%; }
        .hero-slide { min-width: 100%; position: relative; display: flex; align-items: center; justify-content: center; padding: 2rem; }
        @media(min-width:768px){ .hero-slide { padding: 4rem; } }
        .hero-slide::before {
            content: ''; position: absolute; inset: 0;
            background: radial-gradient(at 0% 0%, rgba(255,102,0,0.08) 0px, transparent 50%),
                        radial-gradient(at 100% 100%, rgba(255,133,51,0.08) 0px, transparent 50%);
        }

        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .marquee-strip { display: flex; gap: 1.5rem; animation: marquee 40s linear infinite; }
        .marquee-strip:hover { animation-play-state: paused; }
        .creator-card { width: 200px; max-width: 200px; min-width: 200px; min-height: 260px; white-space: normal; word-wrap: break-word; }

        .dot { width: 0.5rem; height: 0.5rem; border-radius: 9999px; background: rgba(255,102,0,0.2); cursor: pointer; transition: all 0.3s; }
        .dot.active { width: 3rem; background: #FF6600; }

        .hero-arrow {
            position: absolute; top: 50%; transform: translateY(-50%);
            width: 3rem; height: 3rem; border-radius: 9999px;
            background: rgba(255,255,255,0.8); backdrop-filter: blur(8px);
            display: flex; align-items: center; justify-content: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1); cursor: pointer; border: none;
            color: #211711; transition: all 0.3s; z-index: 20;
        }
        .hero-arrow:hover { background: #FF6600; color: #fff; }
        .hero-arrow.left { left: 1.5rem; }
        .hero-arrow.right { right: 1.5rem; }

        .mesh-bg {
            background-image: radial-gradient(at 0% 0%, rgba(255,102,0,0.08) 0px, transparent 50%),
                              radial-gradient(at 100% 100%, rgba(255,102,0,0.08) 0px, transparent 50%);
        }

        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        /* CARD 1 — Orbiting locked platforms around QR */
        .hero-anim-1 .qr-center { animation: qrPulse 3s ease-in-out infinite; }
        .hero-anim-1 .qr-glow { animation: glowPulse 3s ease-in-out infinite; }
        .hero-anim-1 .qr-check { animation: popIn 0.5s ease-out 1s both; }
        @keyframes qrPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.06); } }
        @keyframes glowPulse { 0%, 100% { opacity: 0.4; transform: scale(1); } 50% { opacity: 0.8; transform: scale(1.15); } }
        @keyframes popIn { 0% { transform: scale(0); opacity: 0; } 70% { transform: scale(1.2); } 100% { transform: scale(1); opacity: 1; } }

        .orbit-ring { animation: orbitSpin 20s linear infinite; }
        @keyframes orbitSpin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .orbit-icon {
            position: absolute; top: 50%; left: 50%; width: 56px; height: 56px; margin: -28px 0 0 -28px;
            transform: rotate(var(--angle)) translateX(140px) rotate(calc(-1 * var(--angle)));
            animation: orbitCounterSpin 20s linear infinite;
        }
        @media(min-width:768px) { .orbit-icon { transform: rotate(var(--angle)) translateX(190px) rotate(calc(-1 * var(--angle))); } }
        @keyframes orbitCounterSpin {
            0% { transform: rotate(var(--angle)) translateX(140px) rotate(calc(-1 * var(--angle) - 0deg)); }
            100% { transform: rotate(calc(var(--angle) + 360deg)) translateX(140px) rotate(calc(-1 * var(--angle) - 360deg)); }
        }
        @media(min-width:768px) {
            @keyframes orbitCounterSpin {
                0% { transform: rotate(var(--angle)) translateX(190px) rotate(calc(-1 * var(--angle) - 0deg)); }
                100% { transform: rotate(calc(var(--angle) + 360deg)) translateX(190px) rotate(calc(-1 * var(--angle) - 360deg)); }
            }
        }
        .lock-badge {
            position: absolute; top: -4px; right: -4px; width: 18px; height: 18px; background: #ef4444; border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            animation: lockPop 4s ease-in-out infinite; animation-delay: var(--delay, 0s);
        }
        @keyframes lockPop { 0%, 60%, 100% { transform: scale(1); opacity: 1; } 30% { transform: scale(1.3); opacity: 0.7; } }

        /* CARD 2 — Chain break & repair */
        .hero-anim-2 .chain-left { animation: chainBreakL 5s ease-in-out infinite; }
        .hero-anim-2 .chain-right { animation: chainBreakR 5s ease-in-out infinite; }
        .hero-anim-2 .chain-connector { animation: connectorBreak 5s ease-in-out infinite; }
        .hero-anim-2 .alert-bell { animation: bellShake 5s ease-in-out infinite; opacity: 0; }
        .hero-anim-2 .float-coin { animation: coinFloat 5s ease-in-out infinite; opacity: 0; }
        @keyframes chainBreakL { 0%, 15% { transform: translateX(0); } 25%, 55% { transform: translateX(-20px); } 65%, 100% { transform: translateX(0); } }
        @keyframes chainBreakR { 0%, 15% { transform: translateX(0); } 25%, 55% { transform: translateX(20px); } 65%, 100% { transform: translateX(0); } }
        @keyframes connectorBreak {
            0%, 15% { opacity: 1; background: #4ade80; transform: scaleX(1); }
            20%, 55% { opacity: 0; background: #ef4444; transform: scaleX(0); }
            65%, 100% { opacity: 1; background: #4ade80; transform: scaleX(1); }
        }
        @keyframes bellShake {
            0%, 20% { opacity: 0; transform: translateY(10px); }
            30%, 50% { opacity: 1; transform: translateY(0) rotate(0deg); }
            33% { transform: translateY(0) rotate(15deg); }
            36% { transform: translateY(0) rotate(-15deg); }
            39% { transform: translateY(0) rotate(10deg); }
            42% { transform: translateY(0) rotate(-10deg); }
            45% { transform: translateY(0) rotate(0deg); }
            60%, 100% { opacity: 0; transform: translateY(-10px); }
        }
        @keyframes coinFloat {
            0%, 60% { opacity: 0; transform: translateY(0); }
            70% { opacity: 1; transform: translateY(0); }
            90% { opacity: 1; transform: translateY(-30px); }
            100% { opacity: 0; transform: translateY(-50px); }
        }

        /* CARD 3 — Hub-and-spoke broadcast */
        .hero-anim-3 .store-center { animation: storePulse 4s ease-in-out infinite; }
        @keyframes storePulse {
            0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255,102,0,0.3); }
            50% { transform: scale(1.05); box-shadow: 0 0 20px 8px rgba(255,102,0,0.15); }
        }
        .ripple-ring { animation: rippleExpand 4s ease-out infinite; }
        .ripple-2 { animation-delay: 0.8s; }
        @keyframes rippleExpand { 0% { transform: scale(0.6); opacity: 0.8; } 100% { transform: scale(1.2); opacity: 0; } }
        .spoke-icon {
            position: absolute; top: 50%; left: 50%;
            transform: translate(calc(-50% + var(--spoke-x)), calc(-50% + var(--spoke-y)));
            animation: spokeAppear 4s ease-in-out infinite; animation-delay: var(--spoke-delay); opacity: 0;
        }
        @keyframes spokeAppear {
            0%, 15% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
            30%, 70% { opacity: 1; transform: translate(calc(-50% + var(--spoke-x)), calc(-50% + var(--spoke-y))) scale(1); }
            85%, 100% { opacity: 0; transform: translate(calc(-50% + var(--spoke-x)), calc(-50% + var(--spoke-y))) scale(0.8); }
        }

        /* CARD 4 — Split phone comparison */
        .hero-anim-4 .scroll-content { animation: scrollDown 3s linear infinite; }
        @keyframes scrollDown { 0% { transform: translateY(0); } 100% { transform: translateY(-40px); } }
        .hero-anim-4 .confused-mark { animation: confusedBounce 2s ease-in-out infinite; }
        @keyframes confusedBounce { 0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.8; } 50% { transform: translateY(-6px) rotate(10deg); opacity: 1; } }
        .hero-anim-4 .scan-success { animation: successPulse 2.5s ease-in-out infinite; }
        @keyframes successPulse {
            0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(34,197,94,0.4); }
            50% { transform: scale(1.05); box-shadow: 0 0 12px 4px rgba(34,197,94,0.2); }
        }
        .hero-anim-4 .success-mark { animation: popIn 1s ease-out infinite; animation-duration: 3s; }
        .hero-anim-4 .phone-left { animation: phoneShake 4s ease-in-out infinite; }
        @keyframes phoneShake {
            0%, 100% { transform: rotate(0deg); }
            20% { transform: rotate(-1deg); }
            40% { transform: rotate(1deg); }
            60% { transform: rotate(-0.5deg); }
            80% { transform: rotate(0.5deg); }
        }
        .hero-anim-4 .phone-right { animation: phoneGlow 3s ease-in-out infinite; }
        @keyframes phoneGlow { 0%, 100% { box-shadow: 0 4px 20px rgba(255,102,0,0.1); } 50% { box-shadow: 0 4px 30px rgba(255,102,0,0.25); } }

        /* SECTION — Split Battle Screen */
        .mesh-gradient-solar {
            background: radial-gradient(circle at 10% 20%, rgba(255,102,0,0.06) 0%, transparent 40%),
                        radial-gradient(circle at 90% 80%, rgba(255,99,71,0.06) 0%, transparent 40%);
        }
        .grainy-overlay {
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E");
            opacity: 0.04; pointer-events: none;
        }
        .battle-card-old { transition: all 0.3s ease; }
        .battle-card-new { transition: all 0.3s ease; }
        .battle-card-new:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(255,102,0,0.12); }
        @keyframes floatCard { 0%, 100% { transform: translateY(0px) rotate(3deg); } 50% { transform: translateY(-8px) rotate(3deg); } }
        @keyframes floatCardNeg { 0%, 100% { transform: translateY(0px) rotate(-6deg); } 50% { transform: translateY(-10px) rotate(-6deg); } }
        .float-analytics { animation: floatCard 4s ease-in-out infinite; }
        .float-error { animation: floatCardNeg 5s ease-in-out infinite; }

        .fall-bar { position: absolute; bottom: 40px; border-radius: 4px 4px 0 0; animation: barFall 8s ease-in-out infinite; }
        @keyframes barFall {
            0%, 10% { transform: scaleY(1); opacity: 0.7; }
            40%, 70% { transform: scaleY(0.15); opacity: 0.4; }
            85%, 100% { transform: scaleY(1); opacity: 0.7; }
        }
        .old-chain-link { position: absolute; width: 28px; height: 14px; border: 3px solid #a1a1aa; border-radius: 7px; animation: chainCrack 8s ease-in-out infinite; }
        @keyframes chainCrack {
            0%, 10% { transform: translateX(0) rotate(0deg); border-color: #a1a1aa; }
            30% { transform: translateX(var(--crack-x, -8px)) rotate(var(--crack-r, -15deg)); border-color: #ef4444; }
            50%, 65% { transform: translateX(var(--crack-x, -8px)) rotate(var(--crack-r, -15deg)); border-color: #ef4444; opacity: 0.5; }
            80%, 100% { transform: translateX(0) rotate(0deg); border-color: #a1a1aa; opacity: 0.7; }
        }
        .old-error-badge { position: absolute; animation: errorPop 8s ease-in-out infinite; opacity: 0; }
        @keyframes errorPop {
            0%, 15% { opacity: 0; transform: scale(0.5); }
            25%, 55% { opacity: 1; transform: scale(1); }
            35% { transform: scale(1.15); }
            65%, 100% { opacity: 0; transform: scale(0.8); }
        }
        .old-product-card { animation: cardDecay 8s ease-in-out infinite; }
        @keyframes cardDecay {
            0%, 10% { opacity: 0.8; transform: translateY(0) rotate(0deg); }
            25% { opacity: 0.6; transform: translateY(2px) rotate(-1deg); }
            40% { opacity: 0.3; transform: translateY(4px) rotate(1.5deg); }
            55% { opacity: 0.15; transform: translateY(8px) rotate(-2deg); filter: grayscale(0.5); }
            75%, 100% { opacity: 0.8; transform: translateY(0) rotate(0deg); filter: grayscale(0); }
        }
        .old-warning { animation: warningFlash 8s ease-in-out infinite; opacity: 0; }
        @keyframes warningFlash {
            0%, 18% { opacity: 0; }
            22%, 28% { opacity: 1; }
            30%, 34% { opacity: 0.3; }
            36%, 52% { opacity: 1; }
            60%, 100% { opacity: 0; }
        }
        .old-revenue { animation: revenueDrop 8s ease-in-out infinite; }
        @keyframes revenueDrop {
            0%, 10% { opacity: 0.8; }
            30% { color: #ef4444; }
            50% { color: #ef4444; opacity: 0.5; }
            75%, 100% { color: #a1a1aa; opacity: 0.8; }
        }

        .rise-bar { position: absolute; bottom: 40px; border-radius: 4px 4px 0 0; animation: barRise 8s ease-in-out infinite; }
        @keyframes barRise {
            0%, 10% { transform: scaleY(0.15); opacity: 0.3; }
            40%, 70% { transform: scaleY(1); opacity: 1; }
            85%, 100% { transform: scaleY(0.15); opacity: 0.3; }
        }
        .new-qr-build { animation: qrBuild 8s ease-in-out infinite; }
        @keyframes qrBuild {
            0%, 5% { opacity: 0; transform: scale(0.7); }
            20%, 70% { opacity: 1; transform: scale(1); }
            30% { transform: scale(1.08); }
            80%, 100% { opacity: 0; transform: scale(0.9); }
        }
        .new-qr-glow { animation: qrGlowRing 8s ease-in-out infinite; }
        @keyframes qrGlowRing {
            0%, 10% { opacity: 0; transform: scale(0.8); }
            25% { opacity: 0.6; transform: scale(1); }
            40% { opacity: 0; transform: scale(1.4); }
            100% { opacity: 0; }
        }
        .new-conn-line { position: absolute; height: 2px; transform-origin: left center; animation: lineExpand 8s ease-in-out infinite; opacity: 0; }
        @keyframes lineExpand {
            0%, 15% { opacity: 0; transform: scaleX(0); }
            30%, 60% { opacity: 1; transform: scaleX(1); }
            75%, 100% { opacity: 0; transform: scaleX(0.5); }
        }
        .new-success-badge { position: absolute; animation: successBadgePop 8s ease-in-out infinite; opacity: 0; }
        @keyframes successBadgePop {
            0%, 30% { opacity: 0; transform: scale(0); }
            40% { opacity: 1; transform: scale(1.15); }
            45%, 65% { opacity: 1; transform: scale(1); }
            75%, 100% { opacity: 0; transform: scale(0.8); }
        }
        .new-product-card { animation: cardBuild 8s ease-in-out infinite; }
        @keyframes cardBuild {
            0%, 8% { opacity: 0; transform: translateY(20px) scale(0.9); }
            20% { opacity: 0.5; transform: translateY(10px) scale(0.95); }
            35%, 65% { opacity: 1; transform: translateY(0) scale(1); }
            80%, 100% { opacity: 0; transform: translateY(-5px) scale(0.95); }
        }
        .new-counter { animation: counterUp 8s ease-in-out infinite; }
        @keyframes counterUp {
            0%, 10% { opacity: 0.3; }
            30%, 65% { opacity: 1; color: #16a34a; }
            80%, 100% { opacity: 0.3; color: inherit; }
        }
        .new-platform { position: absolute; animation: platformPop 8s ease-in-out infinite; opacity: 0; }
        @keyframes platformPop {
            0%, 20% { opacity: 0; transform: translate(-50%, -50%) scale(0); }
            35% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
            40%, 60% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            75%, 100% { opacity: 0; transform: translate(-50%, -50%) scale(0.7); }
        }
        .new-particle {
            position: absolute; width: 4px; height: 4px; border-radius: 50%; background: rgba(255,102,0,0.4);
            animation: particleFloat 8s ease-in-out infinite; opacity: 0;
        }
        @keyframes particleFloat {
            0%, 20% { opacity: 0; transform: translateY(0); }
            30%, 50% { opacity: 0.6; transform: translateY(var(--float-y, -20px)); }
            65%, 100% { opacity: 0; transform: translateY(var(--float-y, -40px)); }
        }
      `}</style>

      {/* SECTION 1 — HERO CAROUSEL */}
      <HeroCarousel />

      {/* SECTION 2 — SCROLLING CREATOR CARDS */}
      <section className="overflow-hidden bg-background-light py-16">
        <div className="mx-auto mb-10 max-w-7xl px-6 text-center">
          <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-primary">Made for creators like you</p>
          <h2 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">
            Every creator earns more with BuzzinBeats
          </h2>
        </div>
        <CreatorMarquee />
      </section>

      {/* SECTION 3 — OLD WAY vs BUZZINBEATS WAY */}
      <section className="bg-background-light py-16 pb-0 text-center" id="comparison">
        <div className="mx-auto max-w-4xl px-6">
          <span className="font-display mb-5 inline-block rounded-full bg-primary/10 px-5 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Why Switch?
          </span>
          <h2 className="font-display mb-5 text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl lg:text-6xl">
            Stop Losing Money.
            <br />
            <span className="text-primary">Start Earning Smarter.</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-slate-500 md:text-xl">
            See the difference between scattered, broken workflows and a single system built to convert every click
            into revenue.
          </p>
        </div>
      </section>

      <section className="mesh-gradient-solar relative flex w-full flex-col md:flex-row" style={{ overflow: "visible" }}>
        <div className="absolute left-1/2 top-1/2 z-40 hidden -translate-x-1/2 -translate-y-1/2 md:block">
          <div
            className="rounded-full border-4 border-white bg-white p-4 shadow-2xl"
            style={{ boxShadow: "0 0 0 4px rgba(255,102,0,0.15), 0 20px 60px rgba(255,102,0,0.2)" }}
          >
            <span
              className="material-symbols-outlined text-4xl text-primary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              bolt
            </span>
          </div>
        </div>

        {/* LEFT — THE OLD WAY */}
        <div className="relative w-full bg-zinc-100/60 p-8 md:w-1/2 md:p-16" style={{ overflow: "visible" }}>
          <div className="grainy-overlay absolute inset-0" />
          <div className="relative ml-auto w-full max-w-md">
            <div className="mb-10">
              <span className="font-display mb-4 inline-block rounded-full bg-zinc-200 px-4 py-1 text-xs font-bold tracking-widest text-zinc-600">
                THE STATUS QUO
              </span>
              <h3 className="font-display mb-3 text-3xl font-extrabold tracking-tight text-zinc-800 md:text-4xl">
                The Old Way
              </h3>
              <p className="text-zinc-500">Fragmented links, lost revenue, and manual chaos.</p>
            </div>

            <div className="relative space-y-4">
              <div className="float-error pointer-events-none absolute -top-2 -right-4 md:-right-16" style={{ zIndex: 1, opacity: 0.9 }}>
                <div className="w-44 rounded-2xl border border-red-200/60 bg-white/90 p-3 shadow-xl backdrop-blur">
                  <div className="mb-1 flex items-center gap-2">
                    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
                      <span className="material-symbols-outlined text-red-500" style={{ fontSize: "12px" }}>
                        warning
                      </span>
                    </div>
                    <p className="text-[10px] font-bold text-zinc-700">Link Error</p>
                  </div>
                  <p className="text-[9px] text-zinc-400">
                    Revenue Lost: <span className="font-bold text-red-500">$412</span>
                  </p>
                </div>
              </div>

              <div className="old-error-badge pointer-events-none absolute top-[20%] -right-2 md:-right-12" style={{ zIndex: 1, animationDelay: "0.5s" }}>
                <div className="flex items-center gap-1.5 rounded-full bg-red-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-red-500/30">
                  <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                    error
                  </span>{" "}
                  404
                </div>
              </div>

              <div className="old-warning pointer-events-none absolute top-[38%] -left-2 md:-left-14" style={{ zIndex: 1, animationDelay: "1s" }}>
                <span
                  className="material-symbols-outlined text-amber-400"
                  style={{ fontSize: "48px", fontVariationSettings: "'FILL' 1" }}
                >
                  warning
                </span>
              </div>

              <div className="pointer-events-none absolute top-[48%] -right-2 md:-right-16" style={{ zIndex: 1 }}>
                <div className="flex items-end gap-2">
                  <div className="fall-bar bg-zinc-400/80" style={{ position: "relative", width: "16px", height: "64px", borderRadius: "4px 4px 0 0", animationDelay: "0s" }} />
                  <div className="fall-bar bg-zinc-400/60" style={{ position: "relative", width: "16px", height: "48px", borderRadius: "4px 4px 0 0", animationDelay: "0.3s" }} />
                  <div className="fall-bar" style={{ position: "relative", width: "16px", height: "34px", borderRadius: "4px 4px 0 0", background: "rgba(239,68,68,0.6)", animationDelay: "0.6s" }} />
                  <div className="fall-bar" style={{ position: "relative", width: "16px", height: "18px", borderRadius: "4px 4px 0 0", background: "rgba(239,68,68,0.5)", animationDelay: "0.9s" }} />
                </div>
              </div>

              <div className="old-error-badge pointer-events-none absolute top-[60%] -left-2 md:-left-12" style={{ zIndex: 1, animationDelay: "1.8s" }}>
                <div className="flex items-center gap-1.5 rounded-full bg-red-400 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-red-400/30">
                  <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                    link_off
                  </span>{" "}
                  Dead
                </div>
              </div>

              <div className="old-warning pointer-events-none absolute top-[72%] -right-2 md:-right-10" style={{ zIndex: 1, animationDelay: "2s" }}>
                <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-red-300 bg-red-100 shadow-lg">
                  <span className="material-symbols-outlined text-red-500" style={{ fontSize: "24px" }}>
                    close
                  </span>
                </div>
              </div>

              <div className="old-error-badge pointer-events-none absolute top-[85%] -left-2 md:-left-12" style={{ zIndex: 1, animationDelay: "2.5s" }}>
                <div className="flex items-center gap-1.5 rounded-full bg-amber-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-amber-500/30">
                  <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                    timer_off
                  </span>{" "}
                  Expired
                </div>
              </div>

              <div className="old-product-card pointer-events-none absolute top-[65%] -left-4 md:-left-20" style={{ zIndex: 1, animationDelay: "0.5s" }}>
                <div className="w-32 rounded-xl border border-zinc-200/50 bg-white/60 p-3 shadow-md">
                  <div className="mb-2 h-12 w-full rounded-lg bg-zinc-200/60" />
                  <div className="mb-1 h-2 w-3/4 rounded bg-zinc-200/50" />
                  <div className="h-2 w-1/2 rounded bg-zinc-200/50" />
                  <div className="mt-2 text-[10px] font-bold text-red-400 line-through">$29.99</div>
                </div>
              </div>

              <div className="old-revenue font-display pointer-events-none absolute bottom-0 -right-4 text-lg font-bold text-zinc-400 md:-right-16" style={{ zIndex: 1 }}>
                <span className="mb-0.5 block text-xs text-zinc-400/70">Revenue</span>
                $0.00
              </div>

              {OLD_WAY_ROWS.map((row) => (
                <div
                  key={row.title}
                  className="battle-card-old relative flex items-center gap-4 rounded-2xl border border-zinc-200/60 bg-white/80 p-5 backdrop-blur-sm"
                  style={{ zIndex: 2 }}
                >
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-zinc-200">
                    <span className="material-symbols-outlined text-zinc-400" style={{ fontSize: "20px" }}>
                      {row.icon}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-display text-sm font-bold text-zinc-700">{row.title}</h4>
                    <p className="mt-0.5 text-xs italic text-zinc-400">{row.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT — THE BUZZINBEATS WAY */}
        <div className="relative w-full bg-white p-8 md:w-1/2 md:p-16" style={{ overflow: "visible" }}>
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(circle at 80% 20%, rgba(255,102,0,0.05) 0%, transparent 50%)" }}
          />
          <div className="relative mr-auto w-full max-w-md">
            <div className="mb-10">
              <span
                className="font-display mb-4 inline-block rounded-full px-4 py-1 text-xs font-bold tracking-widest"
                style={{ background: "rgba(255,102,0,0.1)", color: "#FF6600" }}
              >
                THE REVOLUTION
              </span>
              <h3 className="font-display mb-3 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
                The BuzzinBeats Way
              </h3>
              <p className="text-zinc-500">Hyper-efficient monetization for the creator economy.</p>
            </div>

            <div className="relative space-y-4">
              <div className="pointer-events-none absolute -top-2 -left-4 md:-left-16" style={{ zIndex: 1 }}>
                <div className="relative">
                  <div className="new-qr-glow absolute rounded-2xl" style={{ inset: "-8px", background: "rgba(255,102,0,0.12)" }} />
                  <div
                    className="new-qr-build flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-primary/25 bg-white shadow-lg"
                    style={{ boxShadow: "0 8px 20px rgba(255,102,0,0.15)" }}
                  >
                    <span
                      className="material-symbols-outlined text-primary"
                      style={{ fontSize: "26px", fontVariationSettings: "'FILL' 1" }}
                    >
                      qr_code_2
                    </span>
                  </div>
                </div>
              </div>

              <div className="new-success-badge pointer-events-none absolute top-[18%] -left-2 md:-left-14" style={{ zIndex: 1, animationDelay: "1s" }}>
                <div className="flex items-center gap-1.5 rounded-full bg-green-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-green-500/30">
                  <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                    check_circle
                  </span>{" "}
                  Live
                </div>
              </div>

              <div className="new-platform pointer-events-none absolute top-[30%] -right-2 md:-right-14" style={{ zIndex: 1, animationDelay: "0.5s" }}>
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/15 bg-white shadow-lg"
                  style={{ boxShadow: "0 6px 16px rgba(255,102,0,0.12)" }}
                >
                  <span
                    className="material-symbols-outlined text-primary"
                    style={{ fontSize: "24px", fontVariationSettings: "'FILL' 1" }}
                  >
                    shopping_bag
                  </span>
                </div>
              </div>

              <div className="pointer-events-none absolute top-[42%] -left-2 md:-left-16" style={{ zIndex: 1 }}>
                <div className="flex items-end gap-2">
                  <div className="rise-bar" style={{ position: "relative", width: "16px", height: "20px", borderRadius: "4px 4px 0 0", background: "rgba(255,102,0,0.25)", animationDelay: "0s" }} />
                  <div className="rise-bar" style={{ position: "relative", width: "16px", height: "34px", borderRadius: "4px 4px 0 0", background: "rgba(255,102,0,0.45)", animationDelay: "0.3s" }} />
                  <div className="rise-bar" style={{ position: "relative", width: "16px", height: "48px", borderRadius: "4px 4px 0 0", background: "rgba(255,102,0,0.65)", animationDelay: "0.6s" }} />
                  <div className="rise-bar" style={{ position: "relative", width: "16px", height: "64px", borderRadius: "4px 4px 0 0", background: "#FF6600", animationDelay: "0.9s" }} />
                </div>
              </div>

              <div className="new-success-badge pointer-events-none absolute top-[55%] -right-2 md:-right-12" style={{ zIndex: 1, animationDelay: "2s" }}>
                <div className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-white shadow-lg shadow-primary/30">
                  <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                    trending_up
                  </span>{" "}
                  +122%
                </div>
              </div>

              <div className="new-platform pointer-events-none absolute top-[65%] -left-2 md:-left-14" style={{ zIndex: 1, animationDelay: "1.5s" }}>
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/15 bg-white shadow-lg"
                  style={{ boxShadow: "0 6px 16px rgba(255,102,0,0.12)" }}
                >
                  <span
                    className="material-symbols-outlined text-primary"
                    style={{ fontSize: "24px", fontVariationSettings: "'FILL' 1" }}
                  >
                    storefront
                  </span>
                </div>
              </div>

              <div className="new-success-badge pointer-events-none absolute top-[78%] -right-2 md:-right-10" style={{ zIndex: 1, animationDelay: "2.8s" }}>
                <div className="flex items-center gap-1.5 rounded-full bg-emerald-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-500/30">
                  <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                    verified
                  </span>{" "}
                  Healthy
                </div>
              </div>

              <div className="new-product-card pointer-events-none absolute top-[60%] -left-4 md:-left-20" style={{ zIndex: 1, animationDelay: "0.8s" }}>
                <div className="w-32 rounded-xl border border-primary/15 bg-white p-3 shadow-lg" style={{ boxShadow: "0 8px 20px rgba(255,102,0,0.1)" }}>
                  <div className="mb-2 flex h-12 w-full items-center justify-center rounded-lg bg-gradient-to-br from-orange-100 to-orange-50">
                    <span className="material-symbols-outlined text-primary/40" style={{ fontSize: "18px" }}>
                      image
                    </span>
                  </div>
                  <div className="mb-1 h-2 w-3/4 rounded bg-primary/20" />
                  <div className="h-2 w-1/2 rounded bg-primary/10" />
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-primary">$29.99</span>
                    <span className="material-symbols-outlined text-green-500" style={{ fontSize: "12px" }}>
                      check_circle
                    </span>
                  </div>
                </div>
              </div>

              <div className="new-counter font-display pointer-events-none absolute bottom-0 -left-4 text-lg font-bold text-primary md:-left-16" style={{ zIndex: 1 }}>
                <span className="mb-0.5 block text-xs text-zinc-400">Revenue</span>
                $14,204
              </div>

              <div className="new-particle pointer-events-none absolute" style={{ zIndex: 1, top: "12%", right: "-8px", animationDelay: "0.5s", ["--float-y" as string]: "-25px" }} />
              <div className="new-particle pointer-events-none absolute" style={{ zIndex: 1, top: "35%", left: "-12px", animationDelay: "1.5s", ["--float-y" as string]: "-30px", width: "6px", height: "6px" }} />
              <div className="new-particle pointer-events-none absolute" style={{ zIndex: 1, top: "50%", right: "-6px", animationDelay: "2.5s", ["--float-y" as string]: "-20px", width: "7px", height: "7px", background: "rgba(16,185,129,0.5)" }} />
              <div className="new-particle pointer-events-none absolute" style={{ zIndex: 1, top: "75%", left: "-10px", animationDelay: "3s", ["--float-y" as string]: "-35px", background: "rgba(16,185,129,0.4)" }} />

              {NEW_WAY_ROWS.map((row) => (
                <div
                  key={row.title}
                  className="battle-card-new relative flex items-center gap-4 rounded-2xl border border-primary/10 bg-white p-5 shadow-lg"
                  style={{ zIndex: 2, boxShadow: "0 8px 24px rgba(255,102,0,0.06)" }}
                >
                  <div
                    className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-primary shadow-md"
                    style={{ boxShadow: "0 4px 12px rgba(255,102,0,0.3)" }}
                  >
                    <span
                      className="material-symbols-outlined text-white"
                      style={{ fontSize: "20px", fontVariationSettings: "'FILL' 1" }}
                    >
                      {row.icon}
                    </span>
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-display text-sm font-bold text-slate-900">{row.title}</h4>
                    <p className="mt-0.5 text-xs text-zinc-500">{row.body}</p>
                  </div>
                  <span className="material-symbols-outlined flex-shrink-0 text-primary" style={{ fontSize: "20px" }}>
                    check_circle
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-12 flex flex-wrap items-center gap-4">
              <Link
                href="/register"
                className="font-display inline-flex items-center gap-2 rounded-xl px-8 py-4 font-bold text-white shadow-xl transition-all hover:scale-105"
                style={{ background: "linear-gradient(135deg, #FF6600, #FF8533)", boxShadow: "0 12px 32px rgba(255,102,0,0.35)" }}
              >
                Start with BuzzinBeats
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                  arrow_forward
                </span>
              </Link>
              <Link
                href="/pricing"
                className="font-display inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl border-2 border-primary/30 px-8 py-4 font-bold text-primary transition-all hover:border-primary/50 hover:bg-primary/5"
              >
                View Pricing
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                  local_offer
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4 — FEATURES BENTO GRID */}
      <section className="bg-white px-6 py-24" id="features">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-primary">Platform Features</p>
            <h2 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">
              Built for Scale, <span className="text-primary">Designed for Speed</span>
            </h2>
            <p className="mt-4 text-lg text-slate-600">Everything you need. Nothing you don&apos;t.</p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            {BENTO_FEATURES.map((f) => (
              <div
                key={f.title}
                className={`${f.span ?? ""} flex flex-col justify-between rounded-[2.5rem] p-8 md:p-10 ${f.className}`}
              >
                <div className={f.wide ? "mb-8 flex items-start justify-between" : "contents"}>
                  <div>
                    {!f.wide && (
                      <span className={`material-symbols-outlined mb-4 text-4xl ${f.iconColor}`}>{f.icon}</span>
                    )}
                    <h3 className={`font-display text-xl font-bold leading-tight ${f.wide ? "mb-2 text-2xl" : ""} ${f.titleClass ?? ""}`}>
                      {f.title}
                    </h3>
                    <p className={`mt-3 text-sm ${f.bodyClass ?? "text-slate-600"} ${f.wide ? "mt-0" : ""}`}>{f.body}</p>
                  </div>
                  {f.wide && (
                    <div className={`ml-4 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl ${f.iconWrap}`}>
                      <span className={`material-symbols-outlined ${f.iconColor}`}>{f.icon}</span>
                    </div>
                  )}
                </div>
                {f.wide && (
                  <div className="mt-4 rounded-2xl border border-primary/10 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-2 font-mono text-xs text-primary/60">
                      <span>3 valid · 1 invalid (skipped) · Fetching products…</span>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Wide Card — Legacy QR */}
            <div className="relative flex items-center gap-8 overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary-warm to-primary p-10 text-white shadow-xl md:col-span-2">
              <div className="relative z-10">
                <h3 className="font-display mb-2 text-2xl font-bold">
                  Legacy QR redirect — migrate without losing traffic
                </h3>
                <p className="opacity-90">
                  Already have old QR codes or links from another tool? Point them to BuzzinBeats. They&apos;ll
                  redirect seamlessly to your new product pages. Zero broken links. Zero lost traffic.
                </p>
              </div>
              <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-8xl opacity-10">history</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5 — HOW IT WORKS */}
      <section className="bg-background-light px-6 py-24" id="how-it-works">
        <div className="mx-auto max-w-6xl">
          <div className="mb-20 text-center">
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-primary">The process</p>
            <h2 className="font-display mb-4 text-3xl font-extrabold md:text-4xl">
              Launch in <span className="text-primary">Under 5 Minutes</span>
            </h2>
            <p className="text-lg text-slate-600">From zero to live store in under 2 minutes</p>
          </div>
          <div className="grid grid-cols-1 gap-x-12 gap-y-14 md:grid-cols-3">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.title}>
                <span className="mb-4 block text-5xl font-black text-primary">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="font-display mb-3 text-xl font-bold">{step.title}</h3>
                <p className="text-slate-600">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6 — QR BRIDGE */}
      <section className="relative overflow-hidden bg-white py-24">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-12 px-6 md:flex-row">
          <div className="md:w-1/2">
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-primary">The QR bridge</p>
            <h2 className="font-display mb-4 text-4xl font-extrabold tracking-tight md:text-5xl">
              The Bridge to <span className="text-primary">Direct Sales</span>
            </h2>
            <p className="mb-8 text-lg text-slate-600">
              Scan-to-shop from any video, on any platform. Forget &quot;link in bio.&quot; Embed a high-resolution
              QR code directly in your video content. Viewers scan without leaving the app — no friction, no lost
              sales.
            </p>

            <div className="space-y-8">
              {QR_BRIDGE_STEPS.map((step, i) => (
                <div key={step.text}>
                  <div className="group flex items-center gap-6">
                    <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-primary transition-all group-hover:bg-primary group-hover:text-white">
                      <span className="material-symbols-outlined text-3xl">{step.icon}</span>
                    </div>
                    <p className="text-xl font-bold">{step.text}</p>
                  </div>
                  {i < QR_BRIDGE_STEPS.length - 1 && <div className="ml-8 h-12 w-px bg-primary/20" />}
                </div>
              ))}
            </div>
          </div>

          <div className="relative md:w-1/2">
            <div className="relative flex aspect-square w-full items-center justify-center rounded-full bg-gradient-to-tr from-primary/10 to-transparent p-12">
              <div className="relative w-full max-w-sm rounded-[3rem] border border-primary/10 bg-white p-8 shadow-2xl">
                <div className="mb-6 flex aspect-square items-center justify-center rounded-3xl border border-primary/5 bg-gradient-to-br from-slate-50 to-white p-6 shadow-lg">
                  <span className="material-symbols-outlined text-9xl text-primary drop-shadow-lg">qr_code_2</span>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-primary/10 bg-primary/5 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white">
                    <span className="material-symbols-outlined text-xl">check_circle</span>
                  </div>
                  <span className="text-sm font-bold text-primary">Conversion Captured</span>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center">
              <p className="text-sm font-medium italic text-slate-700">
                &quot;Every QR code you generate works forever. Even if you change the products on the page, the QR
                code link stays the same.&quot;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7 — TESTIMONIALS */}
      <section className="bg-background-light px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-primary">Early users love it</p>
              <h2 className="font-display text-3xl font-extrabold md:text-4xl">
                Loved by <span className="text-primary">10k+ Creators</span>
              </h2>
              <p className="mt-2 text-slate-600">Real creators. Real results.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="rounded-3xl border border-primary/5 bg-white p-8 shadow-sm">
                <div className="mb-4 flex gap-1 text-primary">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className="material-symbols-outlined"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      star
                    </span>
                  ))}
                </div>
                <p className="mb-8 italic leading-relaxed text-slate-800">&quot;{t.quote}&quot;</p>
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-warm text-lg font-bold text-white">
                    {t.initial}
                  </div>
                  <div>
                    <p className="font-bold">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 8 — FINAL CTA */}
      <section className="relative overflow-hidden px-6 py-24">
        <div className="mesh-bg absolute inset-0 opacity-30" />
        <div className="relative z-10 mx-auto max-w-5xl overflow-hidden rounded-[3rem] bg-slate-900 p-12 text-center text-white shadow-2xl md:p-20">
          <div className="absolute -right-32 -top-32 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
          <div className="relative z-10">
            <h2 className="font-display mb-6 text-4xl font-extrabold md:text-6xl">
              Your next video should
              <br />
              <span className="text-primary">pay you forever.</span>
            </h2>
            <p className="mx-auto mb-10 max-w-xl text-xl opacity-80">
              Start building product pages in minutes. No credit card. No design skills. No complicated setup. Just
              paste an ASIN and go.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/register"
                className="rounded-xl bg-primary px-12 py-5 text-center font-bold text-white shadow-lg transition-all hover:-translate-y-1 hover:shadow-primary/40"
              >
                Create my free store →
              </Link>
              <Link
                href="/register"
                className="rounded-xl border border-white/20 bg-white/10 px-12 py-5 text-center font-bold text-white backdrop-blur-md transition-all hover:bg-white/20"
              >
                View Demo Shop
              </Link>
            </div>
            <p className="mt-8 text-sm opacity-50">Free to start · No credit card required · Cancel anytime</p>
          </div>
        </div>
      </section>
    </>
  );
}
