import Image from "next/image";
import type { ReactNode } from "react";

type AuthShellProps = {
  logoSrc?: string;
  heading: ReactNode;
  subheading: string;
  children: ReactNode;
};

/**
 * Shared visual chrome for the auth pages (login, register, forgot/reset
 * password) — ports the styling from the old Laravel `layouts/guest.blade.php`
 * shell: dotted background pattern, blurred orange decorative blobs, centered
 * card with logo/wordmark/tagline, and a legal-links footer. Pure presentation,
 * no auth logic lives here.
 */
export default function AuthShell({
  logoSrc = "/images/logo-alt.png",
  heading,
  subheading,
  children,
}: AuthShellProps) {
  return (
    <main
      className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden p-6"
      style={{
        backgroundColor: "var(--color-background-light)",
        backgroundImage:
          "radial-gradient(circle at 2px 2px, #FF660010 1px, transparent 0)",
        backgroundSize: "32px 32px",
      }}
    >
      <div className="w-full max-w-md">
        <div className="mb-10 flex flex-col items-center">
          <div className="mb-4">
            <Image
              src={logoSrc}
              alt="BuzzinBeats Logo"
              width={80}
              height={80}
              className="h-20 w-20 object-contain"
              priority
            />
          </div>
          <h1 className="text-center text-3xl font-extrabold tracking-tight text-slate-900">
            {heading}
          </h1>
          <p className="mt-2 text-center font-medium text-slate-500">{subheading}</p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          {children}
        </div>

        <div className="mt-8 flex justify-center gap-6">
          <a href="/privacy" className="text-xs font-medium text-slate-400 transition-colors hover:text-primary">
            Privacy
          </a>
          <a href="/terms" className="text-xs font-medium text-slate-400 transition-colors hover:text-primary">
            Terms
          </a>
          <a href="/support" className="text-xs font-medium text-slate-400 transition-colors hover:text-primary">
            Help Center
          </a>
        </div>
      </div>

      <div className="pointer-events-none fixed left-0 top-0 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[100px]" />
      <div className="pointer-events-none fixed bottom-0 right-0 h-[500px] w-[500px] translate-x-1/3 translate-y-1/3 rounded-full bg-orange-500/5 blur-[100px]" />
    </main>
  );
}
