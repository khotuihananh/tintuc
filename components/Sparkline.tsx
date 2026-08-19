"use client";

import { useId } from "react";

export default function Sparkline({
  data,
  positive,
}: {
  data: number[];
  positive: boolean;
}) {
  const gradientId = useId();
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = Math.max(1e-9, max - min);

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 32 - ((v - min) / span) * 30 - 1;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });
  const linePath = `M${points.join(" L")}`;
  const areaPath = `${linePath} L100,34 L0,34 Z`;
  const color = positive ? "#34d399" : "#f87171";

  return (
    <svg
      viewBox="0 0 100 34"
      preserveAspectRatio="none"
      className="w-full h-28 md:h-40"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradientId})`} stroke="none" />
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth="1.2"
        vectorEffect="non-scaling-stroke"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
