import { publicStorageUrl } from "@/lib/storage";
import { normalizeDescriptionToHtml } from "@/lib/richtext-core";

type RedirectLink = {
  id: number;
  title: string;
  description: string | null;
  image_path: string | null;
  button_text: string | null;
  open_in_new_tab: boolean | null;
};

/** Port of the old public.partials.sections.redirect_link blade partial. */
export default function RedirectLinkSection({
  items,
  renderActions,
}: {
  items: RedirectLink[];
  /** Optional per-card corner overlay (edit/delete) — the dashboard preview passes this; the public page never does. */
  renderActions?: (item: RedirectLink) => React.ReactNode;
}) {
  if (items.length === 0) return null;

  return (
    <div>
      <h2 className="mb-8 text-center text-2xl font-black tracking-tight text-slate-900">Useful Links</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((link) => {
          const imageUrl = publicStorageUrl(link.image_path);
          const descriptionHtml = normalizeDescriptionToHtml(link.description);
          return (
            <div
              key={link.id}
              className="relative flex flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
            >
              {renderActions && <div className="absolute right-3 top-3 z-10 flex items-center gap-1">{renderActions(link)}</div>}
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageUrl} alt={link.title} className="aspect-[16/10] w-full object-cover" />
              ) : (
                <div className="flex aspect-[16/10] w-full items-center justify-center bg-primary/10">
                  <span className="material-symbols-outlined text-4xl text-primary">open_in_new</span>
                </div>
              )}
              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-lg font-black text-slate-900">{link.title}</h3>
                {descriptionHtml && (
                  <div className="rt-content mt-2 text-sm text-slate-500" dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
                )}
                <a
                  href={`/redirect-link/track/${link.id}`}
                  target={link.open_in_new_tab ? "_blank" : undefined}
                  rel={link.open_in_new_tab ? "noopener noreferrer" : undefined}
                  className="mt-5 inline-flex w-fit items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white transition-all hover:brightness-110"
                >
                  {link.button_text || "Visit"}
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
