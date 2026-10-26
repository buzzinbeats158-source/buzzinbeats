import "server-only";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/data/current-user";

/** Mirrors Laravel AdminMiddleware: Auth::check() && Auth::user()->role === 'admin'. */
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") redirect("/manage-56buzzinbeats-qr-master-admin-page/login");
  return user;
}
