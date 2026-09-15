"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCampaignStore } from "@/store/campaignStore";
import { FunnelChart } from "@/components/FunnelChart";
import { OptInTrendChart } from "@/components/OptInTrendChart";
import { SendTimeHeatmap } from "@/components/SendTimeHeatmap";
import { OPT_IN_TREND, SEND_TIME_HEATMAP } from "@/lib/mockData";

function AnalyticsContent() {
  const campaigns = useCampaignStore((s) => s.campaigns);
  const searchParams = useSearchParams();
  const sentCampaigns = useMemo(() => campaigns.filter((c) => c.status === "sent"), [campaigns]);

  const [selectedId, setSelectedId] = useState<string | null>(
    searchParams.get("campaignId") ?? sentCampaigns[0]?.id ?? null
  );

  const selected = sentCampaigns.find((c) => c.id === selectedId) ?? sentCampaigns[0] ?? null;

  return (
    <div className="p-5 sm:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">
          Delivery funnels, opt-in trends, and the best times to send.
        </p>
      </div>

      <div className="card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="font-semibold text-gray-900">Campaign funnel</h2>
          <select
            className="input max-w-xs"
            value={selected?.id ?? ""}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            {sentCampaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        {selected ? (
          <>
            <FunnelChart funnel={selected.funnel} />
            {selected.abTestEnabled && selected.variants.length > 1 && (
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selected.variants.map((variant) => {
                  const ctr = variant.delivered > 0 ? (variant.clicked / variant.delivered) * 100 : 0;
                  const isWinner = selected.winnerVariantId === variant.id;
                  return (
                    <div
                      key={variant.id}
                      className={`rounded-lg border p-3.5 ${
                        isWinner ? "border-emerald-400 bg-emerald-50" : "border-gray-200"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-900">{variant.label}</p>
                        {isWinner && (
                          <span className="badge bg-emerald-100 text-emerald-800">🏆 Winner</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">Traffic split: {variant.trafficSplit}%</p>
                      <dl className="grid grid-cols-3 gap-2 mt-3 text-center">
                        <div>
                          <dt className="text-[10px] text-gray-400 uppercase">Delivered</dt>
                          <dd className="font-semibold text-sm">{variant.delivered.toLocaleString()}</dd>
                        </div>
                        <div>
                          <dt className="text-[10px] text-gray-400 uppercase">Opened</dt>
                          <dd className="font-semibold text-sm">{variant.opened.toLocaleString()}</dd>
                        </div>
                        <div>
                          <dt className="text-[10px] text-gray-400 uppercase">CTR</dt>
                          <dd className="font-semibold text-sm">{ctr.toFixed(1)}%</dd>
                        </div>
                      </dl>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-gray-400 text-center py-10">No sent campaigns yet.</p>
        )}
      </div>

      <div className="card p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Aggregate opt-in rate trend</h2>
        <OptInTrendChart data={OPT_IN_TREND} />
      </div>

      <div className="card p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Best send-time heatmap</h2>
        <SendTimeHeatmap grid={SEND_TIME_HEATMAP} />
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-gray-400">Loading analytics…</div>}>
      <AnalyticsContent />
    </Suspense>
  );
}
