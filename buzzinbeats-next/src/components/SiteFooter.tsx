import Image from "next/image";
import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="border-t border-primary/10 bg-background-light pb-10 pt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 grid grid-cols-2 gap-12 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link
              href="/"
              className="mb-6 inline-flex items-center gap-2 transition-transform duration-300 hover:scale-105"
            >
              <Image src="/images/logo.png" alt="BuzzinBeats Logo" width={32} height={32} className="h-8 w-auto" />
              <span className="text-xl font-black uppercase tracking-tighter text-slate-900">
                Buzzin<span className="text-primary">Beats</span>
              </span>
            </Link>
            <p className="mb-6 leading-relaxed text-slate-500">
              Helping content creators connect their physical and digital worlds since 2024.
            </p>
          </div>
          <div>
            <h4 className="mb-6 font-bold text-slate-900">Product</h4>
            <ul className="space-y-4 text-slate-500">
              <li>
                <a className="transition-colors hover:text-primary" href="/#features">
                  Features
                </a>
              </li>
              <li>
                <Link className="transition-colors hover:text-primary" href="/pricing">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-6 font-bold text-slate-900">Company</h4>
            <ul className="space-y-4 text-slate-500">
              <li>
                <Link className="transition-colors hover:text-primary" href="/about">
                  About Us
                </Link>
              </li>
              <li>
                <Link className="transition-colors hover:text-primary" href="/support">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-6 font-bold text-slate-900">Legal</h4>
            <ul className="space-y-4 text-slate-500">
              <li>
                <Link className="transition-colors hover:text-primary" href="/privacy">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link className="transition-colors hover:text-primary" href="/terms">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link className="transition-colors hover:text-primary" href="/refund">
                  Refund &amp; Cancellation
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col items-center justify-between gap-4 border-t border-primary/10 pt-10 md:flex-row">
          <p className="text-sm text-slate-500">© {new Date().getFullYear()} BuzzinBeats Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2 text-sm text-slate-500">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              System Status: Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
