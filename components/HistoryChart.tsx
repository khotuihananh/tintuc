"use client";

import { useId, useMemo, useState } from "react";

export interface HistoryPoint {
  date: string | number;
  value: number;
}

interface HistoryChartProps {
  points: HistoryPoint[];
  positive?: boolean;
  unit?: string;
  valueFormatter?: (value: number) => string;
  dateFormatter?: (date: string | number) => string;
  label?: string;
}

const RANGES = [
  { label: "7N", count: 7 },
  { label: "30N", count: 30 },
  { label: "90N", count: 90 },
  { label: "Tất cả", count: Infinity },
];
const defaultValue = (value: number) =>
  new Intl.NumberFormat("vi-VN").format(Math.round(value));
const defaultDate = (date: string | number) =>
  new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit" }).format(
    new Date(typeof date === "number" ? date * 1000 : date),
  );

export default function HistoryChart({
  points,
  positive = true,
  unit = "đ",
  valueFormatter = defaultValue,
  dateFormatter = defaultDate,
  label = "Lịch sử giá",
}: HistoryChartProps) {
  const gradientId = useId();
  const [range, setRange] = useState(Infinity);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const visible = useMemo(() => {
    if (range === Infinity || points.length <= range) return points;
    return points.slice(-range);
  }, [points, range]);

  if (visible.length < 2) return null;

  const values = visible.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(1, max - min);
  const top = max + span * 0.12;
  const bottom = min - span * 0.12;
  const chartSpan = Math.max(1, top - bottom);
  const yFor = (value: number) => 8 + ((top - value) / chartSpan) * 82;
  const xFor = (index: number) => (index / (visible.length - 1)) * 100;
  const pointsPath = visible
    .map(
      (point, index) =>
        `${xFor(index).toFixed(2)},${yFor(point.value).toFixed(2)}`,
    )
    .join(" L");
  const linePath = `M${pointsPath}`;
  const areaPath = `${linePath} L100,100 L0,100 Z`;
  const color = positive ? "#f6bd45" : "#f78c8c";
  const active = activeIndex === null ? visible.length - 1 : activeIndex;
  const activePoint = visible[active];
  const activeX = xFor(active);
  const activeY = yFor(activePoint.value);

  return (
    <section
      className="mt-7 rounded-[24px] border border-white/10 bg-[#111827]/45 p-4 shadow-inner shadow-black/10"
      aria-label={label}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white/90">{label}</p>
          <p className="mt-1 text-xs text-white/45">
            {dateFormatter(activePoint.date)}
          </p>
        </div>
        <div className="text-right">
          <p className="font-display text-lg font-semibold tabular-nums text-white">
            {valueFormatter(activePoint.value)}{" "}
            <span className="text-xs font-normal text-white/45">{unit}</span>
          </p>
          <p className="text-[11px] text-white/40">
            {visible.length} mốc dữ liệu
          </p>
        </div>
      </div>

      <div className="mb-3 grid grid-cols-4 overflow-hidden rounded-xl border border-white/10 bg-black/10">
        {RANGES.map((option) => (
          <button
            key={option.label}
            type="button"
            onClick={() => setRange(option.count)}
            className={`border-r border-white/10 px-2 py-2 text-[11px] transition-colors last:border-r-0 ${range === option.count ? "bg-white/10 font-semibold text-amber-300" : "text-white/45 hover:text-white/80"}`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="relative h-56 select-none touch-none">
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between py-2 text-[10px] text-white/25">
          <span>{valueFormatter(max)}</span>
          <span>{valueFormatter(min + span * 0.5)}</span>
          <span>{valueFormatter(min)}</span>
        </div>
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-y-2 left-10 right-0 h-[calc(100%-16px)] w-[calc(100%-40px)] overflow-visible"
          role="img"
          aria-label={`${label}: ${valueFormatter(activePoint.value)} ${unit} ngày ${dateFormatter(activePoint.date)}`}
          onMouseLeave={() => setActiveIndex(null)}
          onMouseMove={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            const ratio = Math.max(
              0,
              Math.min(1, (event.clientX - rect.left) / rect.width),
            );
            setActiveIndex(Math.round(ratio * (visible.length - 1)));
          }}
          onTouchMove={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            const ratio = Math.max(
              0,
              Math.min(1, (event.touches[0].clientX - rect.left) / rect.width),
            );
            setActiveIndex(Math.round(ratio * (visible.length - 1)));
          }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity=".3" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          {[25, 50, 75].map((y) => (
            <line
              key={y}
              x1="0"
              x2="100"
              y1={y}
              y2={y}
              stroke="white"
              strokeOpacity=".1"
              strokeWidth=".5"
              vectorEffect="non-scaling-stroke"
            />
          ))}
          <path d={areaPath} fill={`url(#${gradientId})`} />
          <path
            d={linePath}
            fill="none"
            stroke={color}
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <line
            x1={activeX}
            x2={activeX}
            y1="0"
            y2="100"
            stroke="white"
            strokeOpacity=".35"
            strokeDasharray="2 3"
            vectorEffect="non-scaling-stroke"
          />
          <circle
            cx={activeX}
            cy={activeY}
            r="3.3"
            fill={color}
            stroke="#fff4d0"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <div className="pointer-events-none absolute bottom-0 left-10 right-0 flex justify-between text-[10px] text-white/35">
          <span>{dateFormatter(visible[0].date)}</span>
          <span>
            {dateFormatter(visible[Math.floor((visible.length - 1) / 2)].date)}
          </span>
          <span>{dateFormatter(visible[visible.length - 1].date)}</span>
        </div>
      </div>
    </section>
  );
}
