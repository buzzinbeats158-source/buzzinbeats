import { getCurrentUser } from "@/lib/data/current-user";
import { createClient } from "@/lib/supabase/server";
import PeriodSelector from "@/components/analytics/PeriodSelector";
import TrafficChart from "@/components/analytics/TrafficChart";
import { resolvePeriod, bucketEvents, percentChange, isClickEvent, type RawEvent } from "@/lib/analytics-periods";

type EventRow = {
  event_type: string;
  device_type: string | null;
  created_at: string;
  page_id: number | string | null;
};

function countByType(events: RawEvent[]) {
  let pageViews = 0;
  let clicks = 0;
  let downloads = 0;
  for (const e of events) {
    if (e.event_type === "page_view") pageViews += 1;
    else if (isClickEvent(e.event_type)) clicks += 1;
    else if (e.event_type === "digital_product_download") downloads += 1;
  }
  return { pageViews, clicks, downloads };
}

function conversionRate(pageViews: number, clicks: number): number {
  return pageViews > 0 ? Math.round((clicks / pageViews) * 1000) / 10 : 0;
}

function TrendBadge({ change, neutralLabel }: { change: number | null; neutralLabel?: string }) {
  if (change === null) {
    return (
      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-500">
        {neutralLabel ?? "No prior data"}
      </span>
    );
  }
  const isDown = change < 0;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold ${
        isDown ? "bg-red-50 text-red-500" : "bg-green-50 text-green-600"
      }`}
    >
      <span className="material-symbols-outlined text-[14px] leading-none">
        {isDown ? "trending_down" : "trending_up"}
      </span>
      {Math.abs(change)}%
    </span>
  );
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; start?: string; end?: string }>;
}) {
  const { period, start: startParam, end: endParam } = await searchParams;
  const user = await getCurrentUser();
  const supabase = await createClient();
  const userId = user!.id;

  const monthRange = resolvePeriod("this_month");
  const selectedRange = resolvePeriod(period, startParam, endParam);

  // Headline KPI row: fixed "this month vs last month" comparison, independent
  // of the period selector below (mirrors the old dashboard's static-looking
  // top row, but with genuinely computed numbers instead of hardcoded badges).
  let monthQuery = supabase
    .from("analytics_events")
    .select("event_type, created_at")
    .eq("user_id", userId)
    .lte("created_at", monthRange.end.toISOString());
  if (monthRange.start) monthQuery = monthQuery.gte("created_at", monthRange.start.toISOString());

  let prevMonthQuery = supabase
    .from("analytics_events")
    .select("event_type, created_at")
    .eq("user_id", userId);
  if (monthRange.prevStart) prevMonthQuery = prevMonthQuery.gte("created_at", monthRange.prevStart.toISOString());
  if (monthRange.prevEnd) prevMonthQuery = prevMonthQuery.lte("created_at", monthRange.prevEnd.toISOString());

  // Trend section: driven by the period selector.
  let selectedQuery = supabase
    .from("analytics_events")
    .select("event_type, device_type, created_at, page_id")
    .eq("user_id", userId)
    .lte("created_at", selectedRange.end.toISOString());
  if (selectedRange.start) selectedQuery = selectedQuery.gte("created_at", selectedRange.start.toISOString());

  let selectedPrevQuery = supabase
    .from("analytics_events")
    .select("event_type, created_at")
    .eq("user_id", userId);
  if (selectedRange.prevStart) selectedPrevQuery = selectedPrevQuery.gte("created_at", selectedRange.prevStart.toISOString());
  if (selectedRange.prevEnd) selectedPrevQuery = selectedPrevQuery.lte("created_at", selectedRange.prevEnd.toISOString());
  const hasSelectedPrev = Boolean(selectedRange.prevStart && selectedRange.prevEnd);

  const [{ data: monthEvents }, { data: prevMonthEvents }, { data: selectedEventsRaw }, selectedPrevResult] =
    await Promise.all([
      monthQuery,
      monthRange.prevStart ? prevMonthQuery : Promise.resolve({ data: [] as EventRow[] }),
      selectedQuery,
      hasSelectedPrev ? selectedPrevQuery : Promise.resolve({ data: [] as EventRow[] }),
    ]);

  const selectedEvents = (selectedEventsRaw ?? []) as EventRow[];
  const selectedPrevEvents = (selectedPrevResult.data ?? []) as EventRow[];

  // Headline KPIs
  const monthCounts = countByType((monthEvents ?? []) as RawEvent[]);
  const prevMonthCounts = countByType((prevMonthEvents ?? []) as RawEvent[]);
  const monthConversion = conversionRate(monthCounts.pageViews, monthCounts.clicks);
  const prevMonthConversion = conversionRate(prevMonthCounts.pageViews, prevMonthCounts.clicks);
  const hasPrevMonth = monthRange.prevStart !== null;

  const KPI_CARDS = [
    {
      key: "page_views",
      label: "Total Page Views",
      icon: "visibility",
      value: monthCounts.pageViews,
      change: hasPrevMonth ? percentChange(monthCounts.pageViews, prevMonthCounts.pageViews) : null,
    },
    {
      key: "clicks",
      label: "Total Clicks",
      icon: "ads_click",
      value: monthCounts.clicks,
      change: hasPrevMonth ? percentChange(monthCounts.clicks, prevMonthCounts.clicks) : null,
    },
    {
      key: "downloads",
      label: "Digital Downloads",
      icon: "download",
      value: monthCounts.downloads,
      change: hasPrevMonth ? percentChange(monthCounts.downloads, prevMonthCounts.downloads) : null,
    },
    {
      key: "conversion",
      label: "Conversion Rate",
      icon: "percent",
      value: `${monthConversion}%`,
      change: hasPrevMonth ? percentChange(monthConversion, prevMonthConversion) : null,
    },
  ];

  // Trend section (period-selector driven)
  const selCounts = countByType(selectedEvents);
  const selPrevCounts = countByType(selectedPrevEvents);
  const selConversion = conversionRate(selCounts.pageViews, selCounts.clicks);
  const selPrevConversion = conversionRate(selPrevCounts.pageViews, selPrevCounts.clicks);

  const trafficChange = hasSelectedPrev ? percentChange(selCounts.pageViews, selPrevCounts.pageViews) : null;
  const clicksChange = hasSelectedPrev ? percentChange(selCounts.clicks, selPrevCounts.clicks) : null;
  const clickPctChange = hasSelectedPrev ? percentChange(selConversion, selPrevConversion) : null;

  const chartSeries = bucketEvents(selectedEvents, selectedRange);

  // Device breakdown, scoped to the selected period.
  const deviceCounts = selectedEvents.reduce<Record<string, number>>((acc, e) => {
    const d = e.device_type ?? "unknown";
    acc[d] = (acc[d] ?? 0) + 1;
    return acc;
  }, {});
  const deviceTotal = Object.values(deviceCounts).reduce((a, b) => a + b, 0);
  const mobilePct = deviceTotal > 0 ? Math.round(((deviceCounts.mobile ?? 0) / deviceTotal) * 100) : 0;
  const CIRCUMFERENCE = 2 * Math.PI * 80;

  // Top pages, scoped to the selected period.
  const pageViewCounts = new Map<string, number>();
  for (const e of selectedEvents) {
    if (e.event_type !== "page_view" || e.page_id === null) continue;
    const key = String(e.page_id);
    pageViewCounts.set(key, (pageViewCounts.get(key) ?? 0) + 1);
  }
  const topPageIds = [...pageViewCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id]) => id);

  const { data: topPagesData } =
    topPageIds.length > 0
      ? await supabase.from("pages").select("id, slug, title").in("id", topPageIds)
      : { data: [] as { id: number | string; slug: string; title: string }[] };

  const topPages = (topPagesData ?? [])
    .map((p) => ({ ...p, views: pageViewCounts.get(String(p.id)) ?? 0 }))
    .sort((a, b) => b.views - a.views);

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-slate-900">Analytics</h1>
      <p className="mb-8 text-slate-500">Real-time performance tracking of your BuzzinBeats links and pages.</p>

      {/* KPI Summary */}
      <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {KPI_CARDS.map((card) => (
          <div key={card.key} className="rounded-2xl border border-orange-100 bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <TrendBadge change={card.change} neutralLabel="This month" />
              <span className="material-symbols-outlined text-primary/40">{card.icon}</span>
            </div>
            <p className="text-sm font-semibold text-slate-500">{card.label}</p>
            <h3 className="mt-1 text-2xl font-black text-slate-900">{card.value}</h3>
          </div>
        ))}
      </section>

      {/* Click & Traffic Trend */}
      <section className="mb-8 overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-sm">
        <div className="flex flex-col gap-4 px-6 pb-6 pt-6 sm:flex-row sm:items-center sm:justify-between md:px-8 md:pt-8">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Click &amp; Traffic Trend</h2>
            <p className="mt-1 text-sm text-slate-500">Page views vs. link/product clicks over time.</p>
          </div>
          <PeriodSelector current={selectedRange.key} />
        </div>

        <div className="grid grid-cols-1 gap-6 px-6 pb-8 md:grid-cols-3 md:px-8">
          <div className="group rounded-2xl border border-primary/5 bg-slate-50 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Traffic</p>
                <h3 className="text-3xl font-extrabold tracking-tight text-slate-900">{selCounts.pageViews.toLocaleString()}</h3>
              </div>
              <div className="rounded-xl p-3" style={{ backgroundColor: "rgba(224,100,25,0.1)", color: "#e06419" }}>
                <span className="material-symbols-outlined">group</span>
              </div>
            </div>
            <div className="mt-4">
              <TrendBadge change={trafficChange} neutralLabel="No prior data" />
            </div>
          </div>

          <div className="group rounded-2xl border border-primary/5 bg-slate-50 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Clicks</p>
                <h3 className="text-3xl font-extrabold tracking-tight text-slate-900">{selCounts.clicks.toLocaleString()}</h3>
              </div>
              <div className="rounded-xl p-3" style={{ backgroundColor: "rgba(16,185,129,0.1)", color: "#10b981" }}>
                <span className="material-symbols-outlined">ads_click</span>
              </div>
            </div>
            <div className="mt-4">
              <TrendBadge change={clicksChange} neutralLabel="No prior data" />
            </div>
          </div>

          <div className="group rounded-2xl border border-primary/5 bg-slate-50 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Click %</p>
                <h3 className="text-3xl font-extrabold tracking-tight text-slate-900">{selConversion}%</h3>
              </div>
              <div className="rounded-xl p-3" style={{ backgroundColor: "rgba(0,106,106,0.1)", color: "#006a6a" }}>
                <span className="material-symbols-outlined">percent</span>
              </div>
            </div>
            <div className="mt-4">
              <TrendBadge change={clickPctChange} neutralLabel="No prior data" />
            </div>
          </div>
        </div>

        <div className="px-6 pb-4 md:px-8">
          <TrafficChart series={chartSeries} />
        </div>

        <div className="flex flex-wrap items-center gap-8 border-t border-orange-50 bg-slate-50/50 px-6 py-6 md:px-8">
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: "#e06419", boxShadow: "0 0 0 4px rgba(224,100,25,0.12)" }} />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-800">Traffic</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Page Views</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: "#10b981", boxShadow: "0 0 0 4px rgba(16,185,129,0.12)" }} />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-800">Clicks</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Product / Link Clicks</span>
            </div>
          </div>
        </div>
      </section>

      {/* Device Breakdown + Top Pages */}
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
        <div className="rounded-3xl border border-orange-100 bg-white p-8 shadow-sm">
          <h2 className="mb-8 text-lg font-bold text-slate-800">Device Breakdown</h2>
          {deviceTotal === 0 ? (
            <p className="text-sm text-slate-400">No data for this period.</p>
          ) : (
            <div className="flex flex-col items-center">
              <div className="relative flex h-48 w-48 items-center justify-center">
                <svg className="h-full w-full -rotate-90 transform">
                  <circle cx="96" cy="96" fill="transparent" r="80" stroke="#f8f8f8" strokeWidth="16" />
                  <circle
                    cx="96"
                    cy="96"
                    fill="transparent"
                    r="80"
                    stroke="#e06419"
                    strokeDasharray={CIRCUMFERENCE}
                    strokeDashoffset={CIRCUMFERENCE - (CIRCUMFERENCE * mobilePct) / 100}
                    strokeWidth="16"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center text-center">
                  <span className="material-symbols-outlined mb-1 text-sm text-slate-400">smartphone</span>
                  <span className="text-3xl font-black text-slate-900">{mobilePct}%</span>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Mobile</p>
                </div>
              </div>

              <div className="mt-8 w-full space-y-3">
                {Object.entries(deviceCounts)
                  .sort((a, b) => b[1] - a[1])
                  .map(([device, count]) => (
                    <div key={device} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3">
                      <div className="flex items-center gap-3">
                        <span className={`h-3 w-3 rounded-full ${device === "mobile" ? "bg-primary" : "bg-slate-300"}`} />
                        <span className="text-sm font-semibold capitalize text-slate-700">{device}</span>
                      </div>
                      <span className="text-sm font-bold text-slate-700">{count}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-sm xl:col-span-2">
          <div className="border-b border-orange-50 p-6 pb-4">
            <h2 className="text-lg font-bold text-slate-800">Top Pages</h2>
            <p className="text-sm text-slate-500">Most-viewed pages for this period.</p>
          </div>
          <div className="divide-y divide-orange-50">
            {topPages.length === 0 && <div className="p-8 text-center text-sm text-slate-400">No page views yet for this period.</div>}
            {topPages.map((p) => (
              <a
                key={String(p.id)}
                href={`/dashboard/pages/${p.id}`}
                className="flex items-center justify-between p-5 transition-colors hover:bg-slate-50"
              >
                <div className="max-w-[240px]">
                  <p className="truncate text-sm font-bold italic text-primary group-hover:underline">/{p.slug}</p>
                  <p className="truncate text-xs text-slate-400">{p.title}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-slate-900">{p.views.toLocaleString()}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Views</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
