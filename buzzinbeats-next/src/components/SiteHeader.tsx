import Image from "next/image";
import Link from "next/link";
import { getCurrentUser } from "@/lib/data/current-user";

export default async function SiteHeader({ minimal = false }: { minimal?: boolean } = {}) {
  const user = minimal ? null : await getCurrentUser();

  return (
    <nav className="sticky top-0 z-50 border-b border-primary/10 bg-background-light/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 transition-transform duration-300 hover:scale-105"
          >
            <Image src="/images/logo.png" alt="BuzzinBeats Logo" width={40} height={40} className="h-10 w-auto" />
            <span className="text-2xl font-black uppercase tracking-tighter text-slate-900">
              Buzzin<span className="text-primary">Beats</span>
            </span>
          </Link>
          <div className="hidden items-center space-x-8 md:flex">
            <a className="font-medium transition-colors hover:text-primary" href="/#features">
              Features
            </a>
            <a className="font-medium transition-colors hover:text-primary" href="/#how-it-works">
              How it Works
            </a>
            {!minimal && (
              <Link className="font-medium transition-colors hover:text-primary" href="/pricing">
                Pricing
              </Link>
            )}
            {!minimal && (
              <div className="flex items-center space-x-4 border-l border-primary/20 pl-4">
                {user ? (
                  <Link
                    href="/dashboard"
                    className="rounded-lg px-6 py-2.5 font-semibold text-primary transition-all hover:bg-primary/5"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="rounded-lg px-6 py-2.5 font-semibold text-primary transition-all hover:bg-primary/5"
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className="rounded-lg bg-gradient-to-r from-primary to-primary-warm px-6 py-2.5 font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5 hover:shadow-primary/40"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
          <div className="md:hidden">
            <button className="p-2 text-primary" aria-label="Menu">
              <span className="material-symbols-outlined">menu</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
