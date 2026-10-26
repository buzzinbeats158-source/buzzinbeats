"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

const SLIDE_COUNT = 4;
const AUTO_ADVANCE_MS = 4000;

const INSTAGRAM_PATH =
  "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z";

const TIKTOK_PATH_1 =
  "M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.88-2.88 2.89 2.89 0 012.88-2.88c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.75a8.28 8.28 0 004.76 1.5v-3.4a4.85 4.85 0 01-1-.16z";

const YOUTUBE_PATH =
  "M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z";

const X_PATH =
  "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z";

const FACEBOOK_PATH =
  "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z";

const WHATSAPP_PATH =
  "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z";

function OrbitIcon({
  angle,
  delay,
  bg,
  children,
}: {
  angle: number;
  delay: number;
  bg: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="orbit-icon"
      style={{ ["--angle" as string]: `${angle}deg`, ["--delay" as string]: `${delay}s` }}
    >
      <div
        className="relative flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg md:h-16 md:w-16"
        style={{ background: bg }}
      >
        {children}
        <div className="lock-badge">
          <span className="material-symbols-outlined text-white" style={{ fontSize: "12px" }}>
            lock
          </span>
        </div>
      </div>
    </div>
  );
}

function SpokeIcon({
  x,
  y,
  delay,
  bg,
  children,
}: {
  x: number;
  y: number;
  delay: number;
  bg: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="spoke-icon"
      style={{
        ["--spoke-x" as string]: `${x}px`,
        ["--spoke-y" as string]: `${y}px`,
        ["--spoke-delay" as string]: `${delay}s`,
      }}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-xl shadow-lg" style={{ background: bg }}>
        {children}
      </div>
    </div>
  );
}

const SLIDES = [
  {
    key: "platforms",
    eyebrow: "Unrestricted Sharing",
    heading: (
      <>
        Every Platform Has Rules.
        <br />
        <span className="text-primary">Your QR Code Doesn&apos;t.</span>
      </>
    ),
    body: "Instagram limits you to 2 links. TikTok blocks links entirely. YouTube buries them in descriptions. Your QR code works on all of them — without asking permission.",
    cta: "Get my free QR store",
    anim: (
      <div className="hero-anim-1 relative h-[340px] w-[340px] md:h-[460px] md:w-[460px]">
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <div className="qr-center flex h-28 w-28 items-center justify-center rounded-3xl bg-white shadow-2xl md:h-36 md:w-36">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: "72px" }}>
              qr_code_2
            </span>
          </div>
          <div className="qr-glow absolute h-40 w-40 rounded-full bg-primary/15 blur-xl md:h-48 md:w-48" />
          <div className="qr-check absolute -right-1 -top-1 flex h-9 w-9 items-center justify-center rounded-full bg-green-500 shadow-lg">
            <span className="material-symbols-outlined text-white" style={{ fontSize: "20px" }}>
              check
            </span>
          </div>
        </div>
        <div className="orbit-ring absolute inset-0">
          <OrbitIcon angle={0} delay={0} bg="linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)">
            <svg className="h-7 w-7 text-white md:h-8 md:w-8" fill="currentColor" viewBox="0 0 24 24">
              <path d={INSTAGRAM_PATH} />
            </svg>
          </OrbitIcon>
          <OrbitIcon angle={60} delay={0.2} bg="#000">
            <svg className="h-7 w-7 md:h-8 md:w-8" fill="none" viewBox="0 0 24 24">
              <path d={TIKTOK_PATH_1} fill="#25F4EE" />
              <path d={TIKTOK_PATH_1} fill="#FE2C55" style={{ transform: "translate(2px,2px)" }} />
            </svg>
          </OrbitIcon>
          <OrbitIcon angle={120} delay={0.4} bg="#FF0000">
            <svg className="h-7 w-7 text-white md:h-8 md:w-8" fill="currentColor" viewBox="0 0 24 24">
              <path d={YOUTUBE_PATH} />
            </svg>
          </OrbitIcon>
          <OrbitIcon angle={180} delay={0.6} bg="#000">
            <svg className="h-7 w-7 text-white md:h-8 md:w-8" fill="currentColor" viewBox="0 0 24 24">
              <path d={X_PATH} />
            </svg>
          </OrbitIcon>
          <OrbitIcon angle={240} delay={0.8} bg="#1877F2">
            <svg className="h-7 w-7 text-white md:h-8 md:w-8" fill="currentColor" viewBox="0 0 24 24">
              <path d={FACEBOOK_PATH} />
            </svg>
          </OrbitIcon>
          <OrbitIcon angle={300} delay={1} bg="#25D366">
            <svg className="h-7 w-7 text-white md:h-8 md:w-8" fill="currentColor" viewBox="0 0 24 24">
              <path d={WHATSAPP_PATH} />
            </svg>
          </OrbitIcon>
        </div>
      </div>
    ),
  },
  {
    key: "chain",
    eyebrow: "Link Protection",
    heading: (
      <>
        Serious Creators Don&apos;t Lose
        <br />
        <span className="text-primary">Commissions to Broken Links.</span>
      </>
    ),
    body: "Your 2-year-old viral video is still getting views. Is it still making you money? If your product links are broken, the answer is no.",
    cta: "Never lose a commission again",
    anim: (
      <div className="hero-anim-2 relative flex h-[320px] w-[340px] items-center justify-center md:h-[380px] md:w-[460px]">
        <div className="chain-left absolute left-[12%] md:left-[15%]">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-green-400 md:h-24 md:w-24">
            <span className="material-symbols-outlined text-green-400" style={{ fontSize: "40px" }}>
              link
            </span>
          </div>
        </div>
        <div className="chain-right absolute right-[12%] md:right-[15%]">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-green-400 md:h-24 md:w-24">
            <span className="material-symbols-outlined text-green-400" style={{ fontSize: "40px" }}>
              link
            </span>
          </div>
        </div>
        <div className="chain-connector absolute h-1.5 w-16 rounded-full bg-green-400 md:w-24" />
        <div className="alert-bell absolute top-4 md:top-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500 shadow-lg">
            <span className="material-symbols-outlined text-3xl text-white">notifications_active</span>
          </div>
        </div>
        <div className="float-coin absolute bottom-6 md:bottom-10">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-yellow-500 bg-yellow-400 shadow-lg">
            <span className="text-lg font-bold text-yellow-800">₹</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    key: "hub",
    eyebrow: "One Link Forever",
    heading: (
      <>
        Build Your Store Once.
        <br />
        Share It Everywhere.
        <br />
        <span className="text-primary">Forever.</span>
      </>
    ),
    body: "One landing page. One link. One QR code. Works on every platform, in every video, across every piece of content you have ever made.",
    cta: "Build my store now",
    anim: (
      <div className="hero-anim-3 relative h-[340px] w-[340px] md:h-[460px] md:w-[460px]">
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <div className="store-center flex h-28 w-28 items-center justify-center rounded-3xl border-2 border-primary/20 bg-white shadow-2xl md:h-36 md:w-36">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: "60px" }}>
              storefront
            </span>
          </div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="ripple-ring ripple-1 absolute h-48 w-48 rounded-full border-2 border-primary/20 md:h-60 md:w-60" />
          <div className="ripple-ring ripple-2 absolute h-64 w-64 rounded-full border-2 border-primary/10 md:h-80 md:w-80" />
        </div>
        <SpokeIcon x={-150} y={-140} delay={0} bg="#ef4444">
          <svg className="h-7 w-7 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d={YOUTUBE_PATH} />
          </svg>
        </SpokeIcon>
        <SpokeIcon x={150} y={-140} delay={0.2} bg="linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)">
          <svg className="h-7 w-7 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d={INSTAGRAM_PATH} />
          </svg>
        </SpokeIcon>
        <SpokeIcon x={210} y={-10} delay={0.4} bg="#22c55e">
          <svg className="h-7 w-7 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d={WHATSAPP_PATH} />
          </svg>
        </SpokeIcon>
        <SpokeIcon x={-210} y={-10} delay={0.6} bg="#EA4335">
          <span
            className="material-symbols-outlined text-2xl text-white"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            mail
          </span>
        </SpokeIcon>
        <SpokeIcon x={0} y={195} delay={0.8} bg="#000">
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24">
            <path d={TIKTOK_PATH_1} fill="#25F4EE" />
            <path d={TIKTOK_PATH_1} fill="#FE2C55" style={{ transform: "translate(2px,2px)" }} />
          </svg>
        </SpokeIcon>
        <SpokeIcon x={-160} y={130} delay={1} bg="#1877F2">
          <svg className="h-7 w-7 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d={FACEBOOK_PATH} />
          </svg>
        </SpokeIcon>
        <SpokeIcon x={160} y={130} delay={1.2} bg="#0f172a">
          <svg className="h-7 w-7 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d={X_PATH} />
          </svg>
        </SpokeIcon>
      </div>
    ),
  },
  {
    key: "split",
    eyebrow: "QR-First Strategy",
    heading: (
      <>
        Stop Saying &quot;Link in Bio.&quot;
        <br />
        <span className="text-primary">Start Showing a QR Code.</span>
      </>
    ),
    body: "The moment they're watching is the highest-intent moment they'll ever have. Don't send them on a 6-step journey to find your link. Put the store in the frame.",
    cta: "Show my QR code in every video",
    anim: (
      <div className="hero-anim-4 flex items-center gap-8 md:gap-12">
        <div className="relative flex flex-col items-center">
          <div className="mb-3 text-sm font-bold uppercase tracking-wider text-red-400 opacity-70">Old way</div>
          <div className="phone-left relative h-[260px] w-[140px] overflow-hidden rounded-3xl border-2 border-slate-600 bg-slate-800 shadow-2xl md:h-[300px] md:w-[160px]">
            <div className="absolute left-1/2 top-0 h-2 w-14 -translate-x-1/2 rounded-b-lg bg-slate-600" />
            <div className="scroll-content absolute inset-3 top-5 space-y-2.5 overflow-hidden">
              <div className="h-4 w-full rounded bg-slate-600" />
              <div className="h-4 w-3/4 rounded bg-slate-600" />
              <div className="h-4 w-full rounded bg-slate-600" />
              <div className="h-4 w-2/3 rounded bg-slate-600" />
              <div className="h-4 w-full rounded bg-red-500/40" />
              <div className="h-4 w-3/4 rounded bg-slate-600" />
              <div className="h-4 w-full rounded bg-slate-600" />
              <div className="h-4 w-1/2 rounded bg-slate-600" />
              <div className="h-4 w-full rounded bg-slate-600" />
              <div className="h-4 w-2/3 rounded bg-red-500/40" />
              <div className="h-4 w-full rounded bg-slate-600" />
              <div className="h-4 w-3/4 rounded bg-slate-600" />
            </div>
          </div>
          <div className="confused-mark absolute -right-3 -top-1 flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-xl shadow-lg">
            ❓
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="h-16 w-px bg-slate-300" />
          <span className="text-sm font-bold text-slate-400">VS</span>
          <div className="h-16 w-px bg-slate-300" />
        </div>

        <div className="relative flex flex-col items-center">
          <div className="mb-3 text-sm font-bold uppercase tracking-wider text-green-500 opacity-70">QR way</div>
          <div className="phone-right relative h-[260px] w-[140px] overflow-hidden rounded-3xl border-2 border-primary/20 bg-white shadow-2xl md:h-[300px] md:w-[160px]">
            <div className="absolute left-1/2 top-0 h-2 w-14 -translate-x-1/2 rounded-b-lg bg-slate-200" />
            <div className="absolute inset-4 top-6 flex flex-col items-center justify-center gap-3">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: "56px" }}>
                qr_code_2
              </span>
              <div className="h-3 w-full rounded bg-primary/20" />
              <div className="h-3 w-3/4 rounded bg-primary/20" />
              <div className="scan-success mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl bg-green-500 py-2.5">
                <span className="material-symbols-outlined text-white" style={{ fontSize: "16px" }}>
                  check_circle
                </span>
                <span className="text-xs font-bold text-white">BUY NOW</span>
              </div>
            </div>
          </div>
          <div className="success-mark absolute -right-3 -top-1 flex h-10 w-10 items-center justify-center rounded-full bg-green-100 shadow-lg">
            <span className="material-symbols-outlined text-green-500" style={{ fontSize: "22px" }}>
              check_circle
            </span>
          </div>
        </div>
      </div>
    ),
  },
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const pausedRef = useRef(false);

  const goTo = useCallback((index: number) => {
    setCurrent(((index % SLIDE_COUNT) + SLIDE_COUNT) % SLIDE_COUNT);
  }, []);

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!pausedRef.current) {
        setCurrent((c) => (c + 1) % SLIDE_COUNT);
      }
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <section
      className="hero-carousel"
      onMouseEnter={() => (pausedRef.current = true)}
      onMouseLeave={() => (pausedRef.current = false)}
      onMouseDown={() => (pausedRef.current = true)}
      onMouseUp={() => (pausedRef.current = false)}
      onTouchStart={() => (pausedRef.current = true)}
      onTouchEnd={() => (pausedRef.current = false)}
    >
      <div className="hero-track" style={{ transform: `translateX(-${current * 100}%)`, transition: "transform 0.7s ease-in-out" }}>
        {SLIDES.map((slide) => (
          <div className="hero-slide" key={slide.key}>
            <div className="relative z-10 flex w-full max-w-6xl flex-col items-center gap-8 md:flex-row md:gap-12">
              <div className="space-y-5 text-center md:w-1/2 md:text-left">
                <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-bold uppercase tracking-widest text-primary">
                  {slide.eyebrow}
                </span>
                <h1 className="font-display text-4xl font-extrabold leading-[1.1] tracking-tight md:text-6xl">
                  {slide.heading}
                </h1>
                <p className="text-lg leading-relaxed text-slate-600">{slide.body}</p>
                <div className="pt-2">
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-warm px-10 py-5 font-bold text-white shadow-lg shadow-primary/30 transition-all hover:-translate-y-0.5 hover:shadow-xl"
                  >
                    {slide.cta} <span className="material-symbols-outlined">arrow_forward</span>
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center md:w-1/2">{slide.anim}</div>
            </div>
          </div>
        ))}
      </div>

      <button className="hero-arrow left" onClick={prev} aria-label="Previous slide">
        <span className="material-symbols-outlined">chevron_left</span>
      </button>
      <button className="hero-arrow right" onClick={next} aria-label="Next slide">
        <span className="material-symbols-outlined">chevron_right</span>
      </button>

      <div className="absolute bottom-10 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3">
        {SLIDES.map((slide, i) => (
          <div
            key={slide.key}
            className={`dot ${i === current ? "active" : ""}`}
            onClick={() => goTo(i)}
            role="button"
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
