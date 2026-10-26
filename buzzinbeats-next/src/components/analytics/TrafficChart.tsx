import type { BucketSeries } from "@/lib/analytics-periods";

/**
 * Dependency-free replacement for the old dashboard's Chart.js line chart.
 * Renders two smoothed area/line series (traffic + clicks) as plain inline
 * SVG, computed server-side — no client JS, no charting library.
 */
export default function TrafficChart({ series }: { series: BucketSeries }) {
  const { labels, traffic, clicks } = series;
  const width = 700;
  const height = 260;
  const padTop = 16;
  const padBottom = 28;
  const padLeft = 8;
  const padRight = 8;
  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const maxVal = Math.max(1, ...traffic, ...clicks);
  const n = labels.length;

  if (n === 0) {
    return (
      <div className="flex h-[260px] w-full items-center justify-center text-sm font-semibold text-slate-400">
        No traffic data for this period yet.
      </div>
    );
  }

  const x = (i: number) => (n === 1 ? padLeft + chartW / 2 : padLeft + (i / (n - 1)) * chartW);
  const y = (v: number) => padTop + chartH - (v / maxVal) * chartH;

  const toPath = (vals: number[]) =>
    vals.map((v, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(2)} ${y(v).toFixed(2)}`).join(" ");

  const toAreaPath = (vals: number[]) => {
    const line = vals.map((v, i) => `${x(i).toFixed(2)},${y(v).toFixed(2)}`).join(" L ");
    return `M ${x(0).toFixed(2)},${(padTop + chartH).toFixed(2)} L ${line} L ${x(n - 1).toFixed(2)},${(padTop + chartH).toFixed(2)} Z`;
  };

  // Show at most ~10 x-axis labels so long ranges stay legible.
  const labelStride = Math.max(1, Math.ceil(n / 10));

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height: 260 }} preserveAspectRatio="none">
        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
          <line
            key={f}
            x1={padLeft}
            x2={width - padRight}
            y1={padTop + chartH * f}
            y2={padTop + chartH * f}
            stroke="rgba(133,115,107,0.08)"
            strokeWidth={1}
          />
        ))}

        <path d={toAreaPath(traffic)} fill="rgba(224,100,25,0.08)" stroke="none" />
        <path d={toAreaPath(clicks)} fill="rgba(16,185,129,0.06)" stroke="none" />

        <path d={toPath(traffic)} fill="none" stroke="#e06419" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
        <path d={toPath(clicks)} fill="none" stroke="#10b981" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />

        {traffic.map((v, i) => (
          <circle key={`t${i}`} cx={x(i)} cy={y(v)} r={2.5} fill="#e06419" />
        ))}
        {clicks.map((v, i) => (
          <circle key={`c${i}`} cx={x(i)} cy={y(v)} r={2.5} fill="#10b981" />
        ))}
      </svg>
      <div className="mt-1 flex justify-between px-1 text-[10px] font-bold text-slate-400">
        {labels.map((label, i) =>
          i % labelStride === 0 || i === n - 1 ? <span key={i}>{label}</span> : <span key={i} />,
        )}
      </div>
    </div>
  );
}
