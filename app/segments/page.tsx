"use client";

import { useState } from "react";
import { SegmentRuleBuilder } from "@/components/SegmentRuleBuilder";
import { useSegmentStore, createEmptyRule } from "@/store/segmentStore";
import type { SegmentRule } from "@/lib/types";
import { estimateReach } from "@/lib/mockData";

export default function SegmentsPage() {
  const segments = useSegmentStore((s) => s.segments);
  const addSegment = useSegmentStore((s) => s.addSegment);
  const removeSegment = useSegmentStore((s) => s.removeSegment);

  const [name, setName] = useState("");
  const [rules, setRules] = useState<SegmentRule[]>([createEmptyRule()]);

  function handleAddRule() {
    setRules((prev) => [...prev, createEmptyRule()]);
  }
  function handleRemoveRule(id: string) {
    setRules((prev) => prev.filter((r) => r.id !== id));
  }
  function handleSave() {
    if (!name.trim() || rules.length === 0) return;
    addSegment(name, rules);
    setName("");
    setRules([createEmptyRule()]);
  }

  return (
    <div className="p-5 sm:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Audience segments</h1>
        <p className="text-sm text-gray-500 mt-1">
          Build reusable audience rules and see the estimated reach against your mock user base.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 mb-4">New segment</h2>
          <div className="mb-4">
            <label className="label">Segment name</label>
            <input
              className="input"
              placeholder="e.g. Power users on iOS"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <SegmentRuleBuilder
            rules={rules}
            onChange={setRules}
            onAddRule={handleAddRule}
            onRemoveRule={handleRemoveRule}
          />
          <button
            type="button"
            onClick={handleSave}
            disabled={!name.trim()}
            className="btn-primary w-full mt-4"
          >
            Save segment
          </button>
        </div>

        <div>
          <h2 className="font-semibold text-gray-900 mb-4">Saved segments</h2>
          <div className="space-y-3">
            {segments.map((segment) => (
              <div key={segment.id} className="card p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-gray-900">{segment.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {segment.rules.length} rule{segment.rules.length !== 1 ? "s" : ""} · created{" "}
                      {new Date(segment.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSegment(segment.id)}
                    className="text-xs text-red-600 hover:text-red-700 font-medium shrink-0"
                  >
                    Delete
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {segment.rules.map((rule) => (
                    <span key={rule.id} className="badge bg-gray-100 text-gray-600">
                      {rule.deviceType !== "any" ? rule.deviceType : "any device"} ·{" "}
                      {rule.lastActive !== "any" ? rule.lastActive : "any time"}
                      {rule.tag ? ` · #${rule.tag}` : ""}
                    </span>
                  ))}
                </div>
                <p className="text-sm font-semibold text-brand-700 mt-3">
                  {estimateReach(segment.rules).toLocaleString()} estimated users
                </p>
              </div>
            ))}
            {segments.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-10">No segments saved yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
