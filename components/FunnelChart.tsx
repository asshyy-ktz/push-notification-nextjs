"use client";

import type { FunnelPoint } from "@/lib/types";

interface FunnelChartProps {
  funnel: FunnelPoint;
}

const STAGES: { key: keyof FunnelPoint; label: string; color: string }[] = [
  { key: "delivered", label: "Delivered", color: "#3d63f5" },
  { key: "opened", label: "Opened", color: "#608bfa" },
  { key: "clicked", label: "Clicked", color: "#93b4fd" },
];

const WIDTH = 560;
const BAR_HEIGHT = 44;
const GAP = 28;
const HEIGHT = STAGES.length * BAR_HEIGHT + (STAGES.length - 1) * GAP + 20;

export function FunnelChart({ funnel }: FunnelChartProps) {
  const max = Math.max(funnel.delivered, 1);

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-auto" role="img" aria-label="Delivery to click funnel">
      {STAGES.map((stage, idx) => {
        const value = funnel[stage.key];
        const pct = value / max;
        const barWidth = Math.max(pct * (WIDTH - 140), 2);
        const y = idx * (BAR_HEIGHT + GAP) + 10;
        const rate = idx === 0 ? 100 : (value / funnel.delivered) * 100 || 0;
        return (
          <g key={stage.key}>
            <text x={0} y={y - 6} className="fill-gray-500" fontSize="12" fontWeight={600}>
              {stage.label}
            </text>
            <rect x={0} y={y} width={WIDTH - 140} height={BAR_HEIGHT} rx={8} className="fill-gray-100" />
            <rect x={0} y={y} width={barWidth} height={BAR_HEIGHT} rx={8} fill={stage.color} />
            <text x={12} y={y + BAR_HEIGHT / 2 + 5} fill="white" fontSize="13" fontWeight={700}>
              {value.toLocaleString()}
            </text>
            <text x={WIDTH - 130} y={y + BAR_HEIGHT / 2 + 5} className="fill-gray-600" fontSize="12" fontWeight={600}>
              {rate.toFixed(1)}%
            </text>
          </g>
        );
      })}
    </svg>
  );
}
