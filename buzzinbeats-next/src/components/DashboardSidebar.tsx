"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

type SidebarUser = {
  name: string;
  email: string;
  avatarUrl: string;
  bypass_subscription: boolean;
};

const NAV_ITEMS = [
  { href: "/dashboard", icon: "dashboard", label: "Dashboard" },
  { href: "/dashboard/pages/create", icon: "add_circle", label: "Create New Page" },
  { href: "/dashboard/pages", icon: "description", label: "My Content" },
  { href: "/dashboard/products", icon: "inventory_2", label: "Products" },
  { href: "/dashboard/analytics", icon: "analytics", label: "Analytics" },
  { href: "/dashboard/store", icon: "shopping_bag", label: "Store" },
  { href: "/dashboard/link-monitor", icon: "link_off", label: "Link Health" },
  { href: "/dashboard/landing-layouts", icon: "layers", label: "Landing Page" },
  { href: "/dashboard/settings", icon: "settings", label: "Settings" },
];

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(href + "/");
}

export default function DashboardSidebar({
  user,
  activeCount = 0,
  pageLimit = null,
  usagePct = 0,
  planName = null,
  brokenLinkCount = 0,
}: {
  user: SidebarUser;
  activeCount?: number;
  pageLimit?: number | null;
  usagePct?: number;
  planName?: string | null;
  brokenLinkCount?: number;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    setCollapsed(localStorage.getItem("sidebar-collapsed") === "true");
  }, []);

  function toggleCollapsed() {
    setCollapsed((c) => {
      localStorage.setItem("sidebar-collapsed", String(!c));
      return !c;
    });
  }

  const hasPlan = user.bypass_subscription || (pageLimit ?? 0) > 0;

  return (
    <aside
      className={`relative flex flex-col justify-between border-r border-orange-100 bg-white p-4 transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      <button
        onClick={toggleCollapsed}
        className="absolute -right-4 top-3 z-50 flex size-8 items-center justify-center rounded-full border border-orange-200 bg-white text-slate-400 shadow-md transition-all hover:bg-orange-50 hover:text-primary"
      >
        <span
          className="material-symbols-outlined text-[20px] transition-transform duration-300"
          style={{ transform: collapsed ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          chevron_left
        </span>
      </button>

      <div className="flex flex-col gap-6 pt-20">
        <Link href="/dashboard" className="flex h-10 items-center gap-3 overflow-hidden px-1 transition-transform hover:scale-105">
          <Image src="/images/logo.png" alt="BuzzinBeats Logo" width={40} height={40} className="size-10 shrink-0 object-contain" />
          {!collapsed && (
            <div className="whitespace-nowrap">
              <h1 className="text-lg font-bold uppercase leading-tight tracking-tighter">
                Buzzin<span className="text-primary">Beats</span>
              </h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">User Dashboard</p>
            </div>
          )}
        </Link>

        <nav className="mt-2 flex flex-col gap-1.5">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-3 rounded-xl px-3 py-3 transition-all ${
                  active ? "bg-primary/10 font-bold text-primary" : "text-gray-500 hover:bg-orange-50 hover:text-primary"
                } ${collapsed ? "justify-center" : ""}`}
              >
                <span className="material-symbols-outlined shrink-0">{item.icon}</span>
                {!collapsed && <span className="whitespace-nowrap text-sm font-bold">{item.label}</span>}
                {item.href === "/dashboard/link-monitor" && brokenLinkCount > 0 && (
                  <span
                    className={`rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-black text-white ${collapsed ? "absolute right-1 top-1" : "ml-auto"}`}
                  >
                    {brokenLinkCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex flex-col gap-4">
        {!collapsed && (
          <Link
            href="/profile/subscription"
            className="group mx-1 block rounded-2xl border border-orange-100 bg-orange-50/50 p-4 transition-all hover:border-orange-200 hover:bg-orange-100/50"
          >
            <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-gray-400 transition-colors group-hover:text-primary">
              Usage Plan
            </p>
            <p className="text-sm font-bold text-slate-900">
              {user.bypass_subscription ? "Promotional Access" : hasPlan ? `${planName} Plan` : "No Active Plan"}
            </p>
            {hasPlan ? (
              <>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-orange-100">
                  <div className="h-1.5 rounded-full bg-primary transition-all" style={{ width: `${user.bypass_subscription ? 100 : usagePct}%` }} />
                </div>
                <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-primary/70">
                  {activeCount}
                  {user.bypass_subscription ? " active pages • unlimited" : `/${pageLimit} active pages • ${usagePct}%`}
                </p>
              </>
            ) : (
              <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Tap to view plans</p>
            )}
          </Link>
        )}

        <div className="relative mt-auto -mx-1 border-t border-orange-100 px-1 pt-4">
          <button
            type="button"
            onClick={() => setProfileOpen((o) => !o)}
            className={`flex w-full items-center gap-3 rounded-2xl p-2.5 text-left transition-all hover:bg-orange-50 ${profileOpen ? "bg-orange-50" : ""}`}
          >
            <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-orange-200 bg-orange-100 shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
            </div>
            {!collapsed && (
              <>
                <div className="min-w-0 flex-1 whitespace-nowrap">
                  <p className="truncate text-sm font-bold tracking-tight text-slate-900">{user.name}</p>
                  <p className="mt-0.5 text-[10px] font-bold uppercase leading-none tracking-widest text-slate-400">
                    Settings
                  </p>
                </div>
                <span className="material-symbols-outlined shrink-0 text-sm text-slate-300">unfold_more</span>
              </>
            )}
          </button>

          {profileOpen && (
            <div className="absolute bottom-full left-0 z-[999] mb-3 w-64 overflow-hidden rounded-[1.75rem] border border-orange-100 bg-white py-3 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)]">
              <div className="mb-2 border-b border-orange-50 px-5 py-3">
                <p className="mb-0.5 text-[10px] font-black uppercase tracking-[0.2em] text-primary">Account Manager</p>
                <p className="truncate text-[11px] font-medium text-slate-400">{user.email}</p>
              </div>
              <div className="flex flex-col gap-0.5 px-2">
                {[
                  ["/profile/account", "account_circle", "Account Info"],
                  ["/profile/branding", "palette", "Public Branding"],
                  ["/profile/subscription", "credit_card", "Subscription & Billing"],
                  ["/profile/security", "shield", "Security"],
                  ["/support", "help", "Support"],
                ].map(([href, icon, label]) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-600 transition-all hover:bg-orange-50 hover:text-primary"
                  >
                    <span className="material-symbols-outlined text-xl">{icon}</span>
                    {label}
                  </Link>
                ))}
              </div>
              <div className="mt-2 border-t border-orange-50 px-2 pt-2">
                <form action="/logout" method="post">
                  <button
                    type="submit"
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-bold text-red-500 transition-all hover:bg-red-50"
                  >
                    <span className="material-symbols-outlined text-xl">logout</span>
                    Logout
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
