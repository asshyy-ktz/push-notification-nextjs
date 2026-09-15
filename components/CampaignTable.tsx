"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Campaign, CampaignStatus } from "@/lib/types";
import { useCampaignStore } from "@/store/campaignStore";
import { useSegmentStore } from "@/store/segmentStore";

type SortKey = "name" | "status" | "createdAt" | "reach";
type SortDir = "asc" | "desc";

const STATUS_LABEL: Record<CampaignStatus, string> = {
  draft: "Draft",
  scheduled: "Scheduled",
  sent: "Sent",
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function CampaignTable() {
  const campaigns = useCampaignStore((s) => s.campaigns);
  const duplicateCampaign = useCampaignStore((s) => s.duplicateCampaign);
  const cancelCampaign = useCampaignStore((s) => s.cancelCampaign);
  const segments = useSegmentStore((s) => s.segments);

  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | "all">("all");

  function segmentName(id: string) {
    return segments.find((s) => s.id === id)?.name ?? "Unknown segment";
  }

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const filtered = useMemo(
    () => (statusFilter === "all" ? campaigns : campaigns.filter((c) => c.status === statusFilter)),
    [campaigns, statusFilter]
  );

  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") cmp = a.name.localeCompare(b.name);
      else if (sortKey === "status") cmp = a.status.localeCompare(b.status);
      else if (sortKey === "createdAt") cmp = a.createdAt.localeCompare(b.createdAt);
      else if (sortKey === "reach") cmp = a.funnel.delivered - b.funnel.delivered;
      return sortDir === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [filtered, sortKey, sortDir]);

  function SortHeader({ label, sortKeyValue }: { label: string; sortKeyValue: SortKey }) {
    const active = sortKey === sortKeyValue;
    return (
      <button
        type="button"
        onClick={() => handleSort(sortKeyValue)}
        className={`flex items-center gap-1 text-xs font-semibold uppercase tracking-wide ${
          active ? "text-brand-700" : "text-gray-500"
        }`}
      >
        {label}
        <span className="text-[10px]">{active ? (sortDir === "asc" ? "▲" : "▼") : "↕"}</span>
      </button>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-gray-100">
        {(["all", "draft", "scheduled", "sent"] as const).map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setStatusFilter(status)}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              statusFilter === status ? "bg-brand-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {status === "all" ? "All" : STATUS_LABEL[status]}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-4 py-3">
                <SortHeader label="Campaign" sortKeyValue="name" />
              </th>
              <th className="text-left px-4 py-3">
                <SortHeader label="Status" sortKeyValue="status" />
              </th>
              <th className="text-left px-4 py-3 hidden md:table-cell">Segment</th>
              <th className="text-left px-4 py-3 hidden sm:table-cell">
                <SortHeader label="Created" sortKeyValue="createdAt" />
              </th>
              <th className="text-left px-4 py-3 hidden lg:table-cell">
                <SortHeader label="Delivered" sortKeyValue="reach" />
              </th>
              <th className="text-right px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((campaign) => (
              <CampaignRow
                key={campaign.id}
                campaign={campaign}
                segmentName={segmentName(campaign.segmentId)}
                onDuplicate={() => duplicateCampaign(campaign.id)}
                onCancel={() => cancelCampaign(campaign.id)}
              />
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-gray-400 text-sm">
                  No campaigns match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CampaignRow({
  campaign,
  segmentName,
  onDuplicate,
  onCancel,
}: {
  campaign: Campaign;
  segmentName: string;
  onDuplicate: () => void;
  onCancel: () => void;
}) {
  return (
    <tr className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60">
      <td className="px-4 py-3">
        <Link href={`/analytics?campaignId=${campaign.id}`} className="font-medium text-gray-900 hover:text-brand-700">
          {campaign.name}
        </Link>
        {campaign.abTestEnabled && (
          <span className="ml-2 badge bg-purple-100 text-purple-700">A/B</span>
        )}
      </td>
      <td className="px-4 py-3">
        <span className={`badge badge-${campaign.status}`}>{STATUS_LABEL[campaign.status]}</span>
      </td>
      <td className="px-4 py-3 hidden md:table-cell text-gray-600">{segmentName}</td>
      <td className="px-4 py-3 hidden sm:table-cell text-gray-600">{formatDate(campaign.createdAt)}</td>
      <td className="px-4 py-3 hidden lg:table-cell text-gray-600">
        {campaign.funnel.delivered.toLocaleString()}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1.5">
          <button type="button" onClick={onDuplicate} className="btn-ghost text-xs px-2 py-1">
            Duplicate
          </button>
          {campaign.status === "scheduled" && (
            <button type="button" onClick={onCancel} className="btn-ghost text-xs px-2 py-1 text-red-600">
              Cancel
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
