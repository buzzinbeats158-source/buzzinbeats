import Link from "next/link";
import { requireAdmin } from "@/lib/data/admin";
import AdminNavLinks from "./AdminNavLinks";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();

  return (
    <div className="flex min-h-screen bg-background-light">
      <aside className="group fixed top-0 left-0 z-50 h-full w-16 overflow-hidden border-r border-primary/10 bg-white transition-all duration-300 hover:w-64">
        <div className="flex items-center px-4 py-6">
          <Link href="/manage-56buzzinbeats-qr-master-admin-page/dashboard" className="flex items-center">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-black text-white">
              B
            </div>
            <h1 className="ml-0 hidden text-xl font-bold tracking-tight text-slate-800 uppercase transition-all group-hover:ml-3 group-hover:block">
              BuzzinBeats
            </h1>
          </Link>
        </div>
        <AdminNavLinks />
        <div className="absolute bottom-4 left-0 w-full px-2">
          <form action="/logout" method="post">
            <button
              type="submit"
              className="flex w-full items-center justify-center rounded-lg px-3 py-3 text-slate-500 transition-colors group-hover:justify-start hover:bg-red-50 hover:text-red-500"
            >
              <span className="material-symbols-outlined">logout</span>
              <span className="ml-3 hidden group-hover:inline">Logout</span>
            </button>
          </form>
        </div>
      </aside>
      <main className="ml-16 flex-1 overflow-y-auto p-8">
        <div className="mb-4 flex justify-end">
          <span className="text-xs font-semibold text-slate-400">{admin.email}</span>
        </div>
        {children}
      </main>
    </div>
  );
}
