import { getCurrentUser } from "@/lib/data/current-user";
import { updateLandingLayoutAction } from "@/lib/data/profile";

const LAYOUTS = [
  { key: "classic_grid", label: "Classic Grid", icon: "grid_view", description: "A clean 4-column grid layout focusing equally on all products with premium square thumbnails." },
  { key: "comparison_table", label: "Comparison Table", icon: "table_rows", description: "A side-by-side comparison of products in a clean, vertical column layout for easy scanning." },
  { key: "hero_grid", label: "Hero Grid", icon: "dashboard", description: "Highlight one featured product in a hero style while showing others in a clean grid below." },
  { key: "side_by_side_rows", label: "Side-by-Side Rows", icon: "view_list", description: "Clear horizontal rows stacked vertically. Ideal for detailed descriptions and list viewing." },
  { key: "side_by_side_rows_refined", label: "Side-by-Side Rows Refined", icon: "view_agenda", description: "A refined version of rows with increased white space and improved typography." },
  { key: "tabbed_marketplace", label: "Tabbed Marketplace", icon: "apps", description: "Interactive marketplace-style cards with quick marketplace switching tabs." },
];

export default async function LandingLayoutsPage() {
  const user = await getCurrentUser();
  // Matches DashboardController::landingLayouts() fallback — an unrecognized
  // stored value (e.g. a legacy "card_deck") displays as classic_grid
  // selected, without overwriting the actual stored value.
  const selected = LAYOUTS.some((l) => l.key === user!.landing_layout) ? user!.landing_layout : "classic_grid";

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-slate-900">Landing Page Layout</h1>
      <p className="mb-8 text-slate-500">Choose how your public page displays your content.</p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {LAYOUTS.map((layout) => {
          const active = selected === layout.key;
          return (
            <form
              key={layout.key}
              action={async () => {
                "use server";
                await updateLandingLayoutAction(layout.key);
              }}
            >
              <button
                type="submit"
                className={`flex w-full flex-col items-start gap-2 rounded-2xl border-2 p-6 text-left transition-all ${
                  active ? "border-primary bg-primary/5" : "border-slate-200 bg-white hover:border-primary/30"
                }`}
              >
                <div className="flex w-full items-center gap-3">
                  <span className={`material-symbols-outlined text-2xl ${active ? "text-primary" : "text-slate-400"}`}>
                    {layout.icon}
                  </span>
                  <span className={`text-sm font-bold ${active ? "text-primary" : "text-slate-700"}`}>{layout.label}</span>
                  {active && (
                    <span className="ml-auto text-[10px] font-black uppercase tracking-widest text-primary">Active</span>
                  )}
                </div>
                <p className="text-xs text-slate-500">{layout.description}</p>
              </button>
            </form>
          );
        })}
      </div>
    </div>
  );
}
