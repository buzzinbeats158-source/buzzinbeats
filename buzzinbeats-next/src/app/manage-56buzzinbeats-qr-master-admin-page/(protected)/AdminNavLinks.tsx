"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const BASE = "/manage-56buzzinbeats-qr-master-admin-page";

/**
 * Matches the old Laravel admin panel's sidebar exactly (order, labels,
 * icons). `/pages` and `/payment-gateway` still exist as routes (folded
 * into Content Pages / Payment respectively) but — same as in the old
 * panel, where `/pages` existed unlinked — aren't top-level nav items.
 * Analytics is `href="#"` because it was an inert placeholder link in the
 * old panel too.
 */
export const ADMIN_NAV = [
  { href: `${BASE}/dashboard`, label: "Dashboard", icon: "dashboard" },
  { href: `${BASE}/users`, label: "Users", icon: "people_alt" },
  { href: `${BASE}/content-pages`, label: "Content Pages", icon: "article" },
  { href: `${BASE}/products`, label: "Products", icon: "shopping_bag" },
  { href: `${BASE}/redirect-links`, label: "Redirect Links", icon: "open_in_new" },
  { href: `${BASE}/digital-products`, label: "Digital Products", icon: "cloud_download" },
  { href: `${BASE}/payments`, label: "Payment", icon: "payments" },
  { href: `${BASE}/coupons`, label: "Coupons", icon: "confirmation_number" },
  { href: `${BASE}/subscription-settings`, label: "Subscription Settings", icon: "workspace_premium" },
  { href: `${BASE}/redirect`, label: "Redirect", icon: "alt_route" },
  { href: "#", label: "Analytics", icon: "query_stats" },
  { href: `${BASE}/system-update`, label: "System Update", icon: "system_update" },
  { href: `${BASE}/error-logs`, label: "Error Logs", icon: "bug_report" },
  { href: `${BASE}/backup-restore`, label: "Backup & Restore", icon: "settings_backup_restore" },
  { href: `${BASE}/system-settings`, label: "Settings", icon: "settings" },
];

export default function AdminNavLinks() {
  const pathname = usePathname();

  return (
    <nav className="mt-2 space-y-1.5 px-2">
      {ADMIN_NAV.map((item) => {
        const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center justify-center rounded-lg px-3 py-3 font-semibold transition-colors group-hover:justify-start ${
              isActive ? "bg-primary/10 text-primary" : "text-slate-500 hover:bg-slate-50 hover:text-primary"
            }`}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="ml-3 hidden group-hover:inline">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
