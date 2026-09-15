"use client";

import type { DeviceType, LastActiveWindow, SegmentRule } from "@/lib/types";
import { estimateReach } from "@/lib/mockData";

const DEVICE_OPTIONS: { value: DeviceType; label: string }[] = [
  { value: "any", label: "Any device" },
  { value: "ios", label: "iOS" },
  { value: "android", label: "Android" },
  { value: "web", label: "Web" },
];

const ACTIVE_OPTIONS: { value: LastActiveWindow; label: string }[] = [
  { value: "any", label: "Any time" },
  { value: "24h", label: "Last 24 hours" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
];

const TAG_OPTIONS = ["vip", "trial", "churn-risk", "power-user", "newsletter", "beta"];

interface SegmentRuleBuilderProps {
  rules: SegmentRule[];
  onChange: (rules: SegmentRule[]) => void;
  onAddRule: () => void;
  onRemoveRule: (id: string) => void;
}

export function SegmentRuleBuilder({ rules, onChange, onAddRule, onRemoveRule }: SegmentRuleBuilderProps) {
  const reach = estimateReach(rules);

  function updateRule(id: string, patch: Partial<SegmentRule>) {
    onChange(rules.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {rules.map((rule, idx) => (
          <div key={rule.id} className="card p-3.5">
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {idx === 0 ? "Match users who..." : "OR match users who..."}
              </p>
              {rules.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemoveRule(rule.id)}
                  className="text-xs text-red-600 hover:text-red-700 font-medium"
                >
                  Remove
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="label">Device type</label>
                <select
                  className="input"
                  value={rule.deviceType}
                  onChange={(e) => updateRule(rule.id, { deviceType: e.target.value as DeviceType })}
                >
                  {DEVICE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Last active</label>
                <select
                  className="input"
                  value={rule.lastActive}
                  onChange={(e) =>
                    updateRule(rule.id, { lastActive: e.target.value as LastActiveWindow })
                  }
                >
                  {ACTIVE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Custom tag</label>
                <select
                  className="input"
                  value={rule.tag ?? ""}
                  onChange={(e) => updateRule(rule.id, { tag: e.target.value || null })}
                >
                  <option value="">Any tag</option>
                  {TAG_OPTIONS.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button type="button" onClick={onAddRule} className="btn-secondary text-sm">
        + Add OR condition
      </button>

      <div className="card p-4 bg-brand-50 border-brand-100 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-brand-700 uppercase tracking-wide">Estimated reach</p>
          <p className="text-2xl font-bold text-brand-900">{reach.toLocaleString()} users</p>
        </div>
        <div className="text-3xl" aria-hidden>
          🎯
        </div>
      </div>
    </div>
  );
}
