import Link from "next/link";
import { getCurrentUser } from "@/lib/data/current-user";
import { createClient } from "@/lib/supabase/server";
import { activateAllPagesAction, deactivateAllPagesAction, getPlanUsage, togglePageStatusAction } from "@/lib/data/pages";
import PagesTable from "@/components/PagesTable";

export default async function PagesPage() {
  const user = await getCurrentUser();
  const supabase = await createClient();

  const { data: pages } = await supabase
    .from("pages")
    .select("*")
    .eq("user_id", user!.id)
    .is("deleted_at", null)
    .order("serial_number");

  const pageIds = (pages ?? []).map((p) => p.id);

  const [{ data: products }, { data: redirectLinks }, { data: digitalProducts }, { activeCount, limit }] = await Promise.all([
    pageIds.length
      ? supabase.from("products").select("page_id").in("page_id", pageIds)
      : Promise.resolve({ data: [] as { page_id: number }[] }),
    pageIds.length
      ? supabase.from("redirect_links").select("page_id").in("page_id", pageIds).is("deleted_at", null)
      : Promise.resolve({ data: [] as { page_id: number }[] }),
    pageIds.length
      ? supabase.from("digital_products").select("page_id").in("page_id", pageIds).is("deleted_at", null)
      : Promise.resolve({ data: [] as { page_id: number }[] }),
    getPlanUsage(user!.id, user!.bypass_subscription ?? false),
  ]);

  const countBy = (rows: { page_id: number }[]) =>
    rows.reduce<Record<number, number>>((acc, r) => {
      acc[r.page_id] = (acc[r.page_id] ?? 0) + 1;
      return acc;
    }, {});

  const productsCountByPage = countBy(products ?? []);
  const redirectLinksCountByPage = countBy(redirectLinks ?? []);
  const digitalProductsCountByPage = countBy(digitalProducts ?? []);

  const rows = (pages ?? []).map((p) => ({
    id: p.id,
    page_id: p.page_id,
    serial_number: p.serial_number,
    title: p.title,
    description: p.description,
    slug: p.slug,
    status: p.status,
    is_published: p.is_published,
    productsCount: productsCountByPage[p.id] ?? 0,
    redirectLinksCount: redirectLinksCountByPage[p.id] ?? 0,
    digitalProductsCount: digitalProductsCountByPage[p.id] ?? 0,
    qrVersion: p.updated_at ? String(new Date(p.updated_at).getTime()) : String(p.id),
  }));

  async function togglePageStatus(pageId: number, status: "active" | "inactive") {
    "use server";
    return togglePageStatusAction(pageId, status);
  }
  async function activateAll() {
    "use server";
    await activateAllPagesAction();
  }
  async function deactivateAll() {
    "use server";
    await deactivateAllPagesAction();
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-10 flex flex-wrap items-center justify-between gap-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-4xl font-black tracking-tight text-slate-900">My Pages</h2>
          <p className="max-w-md text-gray-500">
            Manage your high-performance landing pages and BuzzinBeats QR codes from one central hub.
          </p>
        </div>
        <Link
          href="/dashboard/pages/create"
          className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-bold text-white shadow-sm transition-all hover:scale-[1.02] hover:bg-primary/90 active:scale-[0.98]"
        >
          <span className="material-symbols-outlined">add_circle</span>
          <span>Create New Page</span>
        </Link>
      </div>

      <PagesTable
        pages={rows}
        username={user!.name}
        planLimit={limit}
        initialActiveCount={activeCount}
        togglePageStatus={togglePageStatus}
        activateAll={activateAll}
        deactivateAll={deactivateAll}
      />
    </div>
  );
}
