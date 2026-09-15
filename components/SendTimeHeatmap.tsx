"use client";

import { useState } from "react";
import { HEATMAP_DAY_LABELS } from "@/lib/mockData";

interface SendTimeHeatmapProps {
  grid: number[][];
}

function colorForValue(value: number): string {
  // Interpolate from light brand tint to solid brand color.
  const t = Math.max(0, Math.min(1, value / 100));
  const start = { r: 238, g: 244, b: 255 };
  const end = { r: 40, g: 67, b: 234 };
  const r = Math.round(start.r + (end.r - start.r) * t);
  const g = Math.round(start.g + (end.g - start.g) * t);
  const b = Math.round(start.b + (end.b - start.b) * t);
  return `rgb(${r}, ${g}, ${b})`;
}

export function SendTimeHeatmap({ grid }: SendTimeHeatmapProps) {
  const [hovered, setHovered] = useState<{ day: number; hour: number } | null>(null);

  let best = { day: 0, hour: 0, value: -1 };
  grid.forEach((row, day) => {
    row.forEach((value, hour) => {
      if (value > best.value) best = { day, hour, value };
    });
  });

  const hourLabels = Array.from({ length: 24 }, (_, h) => h);

  return (
    <div>
      <div className="overflow-x-auto">
        <div className="min-w-[640px]">
          <div className="flex">
            <div className="w-10 shrink-0" />
            <div className="flex-1 grid grid-cols-[repeat(24,minmax(0,1fr))] gap-[2px]">
              {hourLabels.map((h) => (
                <div key={h} className="text-center text-[9px] text-gray-400">
                  {h % 3 === 0 ? h : ""}
                </div>
              ))}
            </div>
          </div>
          {grid.map((row, day) => (
            <div key={day} className="flex items-center mt-[2px]">
              <div className="w-10 shrink-0 text-xs font-medium text-gray-500">{HEATMAP_DAY_LABELS[day]}</div>
              <div className="flex-1 grid grid-cols-[repeat(24,minmax(0,1fr))] gap-[2px]">
                {row.map((value, hour) => {
                  const isBest = day === best.day && hour === best.hour;
                  return (
                    <div
                      key={hour}
                      onMouseEnter={() => setHovered({ day, hour })}
                      onMouseLeave={() => setHovered(null)}
                      className={`aspect-square rounded-[3px] cursor-pointer ${
                        isBest ? "ring-2 ring-amber-400" : ""
                      }`}
                      style={{ backgroundColor: colorForValue(value) }}
                      title={`${HEATMAP_DAY_LABELS[day]} ${hour}:00 — engagement ${value}`}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
        <span>
          {hovered
            ? `${HEATMAP_DAY_LABELS[hovered.day]} ${hovered.hour}:00 — engagement ${grid[hovered.day][hovered.hour]}`
            : `Best send time: ${HEATMAP_DAY_LABELS[best.day]} ${best.hour}:00`}
        </span>
        <div className="flex items-center gap-1.5">
          <span>Low</span>
          <div className="h-2 w-16 rounded-full bg-gradient-to-r from-brand-50 to-brand-700" />
          <span>High</span>
        </div>
      </div>
    </div>
  );
}
