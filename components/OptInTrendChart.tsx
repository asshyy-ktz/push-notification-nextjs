"use client";

import type { OptInTrendPoint } from "@/lib/types";

interface OptInTrendChartProps {
  data: OptInTrendPoint[];
}

const WIDTH = 640;
const HEIGHT = 220;
const PADDING = { top: 16, right: 16, bottom: 28, left: 36 };

export function OptInTrendChart({ data }: OptInTrendChartProps) {
  if (data.length === 0) return null;

  const plotWidth = WIDTH - PADDING.left - PADDING.right;
  const plotHeight = HEIGHT - PADDING.top - PADDING.bottom;

  const values = data.map((d) => d.optInRate);
  const min = Math.floor(Math.min(...values) - 2);
  const max = Math.ceil(Math.max(...values) + 2);
  const range = Math.max(max - min, 1);

  function xFor(idx: number) {
    return PADDING.left + (idx / (data.length - 1 || 1)) * plotWidth;
  }
  function yFor(value: number) {
    return PADDING.top + plotHeight - ((value - min) / range) * plotHeight;
  }

  const linePath = data.map((d, idx) => `${idx === 0 ? "M" : "L"} ${xFor(idx)} ${yFor(d.optInRate)}`).join(" ");
  const areaPath = `${linePath} L ${xFor(data.length - 1)} ${PADDING.top + plotHeight} L ${xFor(0)} ${
    PADDING.top + plotHeight
  } Z`;

  const gridLines = 4;

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-auto" role="img" aria-label="Opt-in rate trend over time">
      <defs>
        <linearGradient id="optInFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3d63f5" stopOpacity={0.25} />
          <stop offset="100%" stopColor="#3d63f5" stopOpacity={0} />
        </linearGradient>
      </defs>

      {Array.from({ length: gridLines + 1 }).map((_, i) => {
        const value = min + (range / gridLines) * i;
        const y = yFor(value);
        return (
          <g key={i}>
            <line x1={PADDING.left} y1={y} x2={WIDTH - PADDING.right} y2={y} stroke="#eef1f6" strokeWidth={1} />
            <text x={4} y={y + 4} fontSize="10" className="fill-gray-400">
              {value.toFixed(0)}%
            </text>
          </g>
        );
      })}

      <path d={areaPath} fill="url(#optInFill)" />
      <path d={linePath} fill="none" stroke="#3d63f5" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

      {data.map((d, idx) => (
        <g key={d.date}>
          <circle cx={xFor(idx)} cy={yFor(d.optInRate)} r={3.5} fill="#3d63f5" stroke="white" strokeWidth={1.5} />
          {idx % 2 === 0 && (
            <text x={xFor(idx)} y={HEIGHT - 6} fontSize="10" textAnchor="middle" className="fill-gray-400">
              {d.date}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}
