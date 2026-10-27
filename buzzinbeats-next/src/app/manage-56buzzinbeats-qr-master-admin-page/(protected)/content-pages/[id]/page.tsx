import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/data/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { publicPagePath } from "@/lib/public-page-url";

const BASE = "/manage-56buzzinbeats-qr-master-admin-page/content-pages";

const TYPE_LABELS: Record<string, string> = {
  product: "Products",
  redirect_link: "Redirect Links",
  digital_product: "Digital Products",
};

export default async function AdminContentPageDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: page } = await supabase.from("pages").select("*, users(name, email, username)").eq("id", id).maybeSingle();
  if (!page) notFound();

  const [{ data: sections }, { count: productCount }, { count: redirectLinkCount }, { count: digitalProductCount }] = await Promise.all([
    supabase.from("content_page_sections").select("section_type, section_order, is_enabled").eq("content_page_id", id).order("section_order"),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("page_id", id),
    supabase.from("redirect_links").select("id", { count: "exact", head: true }).eq("page_id", id).is("deleted_at", null),
    supabase.from("digital_products").select("id", { count: "exact", head: true }).eq("page_id", id).is("deleted_at", null),
  ]);

  const owner = page.users as unknown as { name: string; email: string; username: string } | null;
  const previewHref = page.public_username ? publicPagePath(page) : null;

  return (
    <div>
      <div className="mb-6">
        <Link href={BASE} className="text-sm text-blue-600 hover:text-blue-900">
          ← Back to Content Pages
        </Link>
        <h2 className="mt-2 text-2xl font-bold text-slate-800">{page.title}</h2>
        <p className="text-sm text-slate-500">{page.page_id ?? `#${page.id}`}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-bold tracking-wide text-slate-500 uppercase">Page Information</h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Owner</dt>
              <dd className="font-medium text-slate-900">{owner?.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">URL</dt>
              <dd className="font-medium text-blue-600">
                {previewHref ? (
                  <a href={previewHref} target="_blank" rel="noreferrer" className="hover:underline">
                    {previewHref}
                  </a>
                ) : (
                  "—"
                )}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Status</dt>
              <dd className="font-medium text-slate-900">
                {page.status === "active" ? "Active" : "Inactive"} · {page.is_published ? "Published" : "Draft"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Created</dt>
              <dd className="font-medium text-slate-900">{new Date(page.created_at).toLocaleDateString()}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-bold tracking-wide text-slate-500 uppercase">Content Summary</h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Products</dt>
              <dd className="font-medium text-slate-900">{productCount ?? 0}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Redirect Links</dt>
              <dd className="font-medium text-slate-900">{redirectLinkCount ?? 0}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Digital Products</dt>
              <dd className="font-medium text-slate-900">{digitalProductCount ?? 0}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h3 className="mb-4 text-sm font-bold tracking-wide text-slate-500 uppercase">Page Section Order</h3>
          {!sections || sections.length === 0 ? (
            <p className="text-sm text-slate-400">No sections configured.</p>
          ) : (
            <ol className="space-y-2">
              {sections.map((s, i) => (
                <li key={i} className="flex items-center justify-between rounded-lg border border-slate-100 px-4 py-3">
                  <span className="text-sm font-medium text-slate-800">
                    {i + 1}. {TYPE_LABELS[s.section_type] ?? s.section_type}
                  </span>
                  <span className={`rounded-full px-2 py-1 text-xs font-bold ${s.is_enabled ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                    {s.is_enabled ? "Enabled" : "Disabled"}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}
