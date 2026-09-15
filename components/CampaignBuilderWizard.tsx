"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Platform, ScheduleMode } from "@/lib/types";
import { useSegmentStore } from "@/store/segmentStore";
import { useCampaignStore } from "@/store/campaignStore";
import { useTemplateStore } from "@/store/templateStore";
import { estimateReach } from "@/lib/mockData";
import { DeviceFramePreview } from "./DeviceFramePreview";
import { ABTestSplitSlider } from "./ABTestSplitSlider";

const STEPS = ["Audience", "Message", "A/B test", "Schedule", "Review"] as const;
type Step = (typeof STEPS)[number];

const PLATFORM_OPTIONS: { value: Platform; label: string; icon: string }[] = [
  { value: "ios", label: "iOS", icon: "🍎" },
  { value: "android", label: "Android", icon: "🤖" },
  { value: "web", label: "Web", icon: "🌐" },
];

interface VariantForm {
  label: string;
  title: string;
  body: string;
  icon: string;
  deepLink: string;
  trafficSplit: number;
}

function emptyVariant(label: string, split: number): VariantForm {
  return { label, title: "", body: "", icon: "🔔", deepLink: "app://", trafficSplit: split };
}

export function CampaignBuilderWizard() {
  const router = useRouter();
  const segments = useSegmentStore((s) => s.segments);
  const templates = useTemplateStore((s) => s.templates);
  const addCampaign = useCampaignStore((s) => s.addCampaign);

  const [stepIndex, setStepIndex] = useState(0);
  const [name, setName] = useState("");
  const [segmentId, setSegmentId] = useState(segments[0]?.id ?? "");
  const [platforms, setPlatforms] = useState<Platform[]>(["ios", "android"]);
  const [abTestEnabled, setAbTestEnabled] = useState(false);
  const [variantA, setVariantA] = useState<VariantForm>(emptyVariant("Variant A", 100));
  const [variantB, setVariantB] = useState<VariantForm>(emptyVariant("Variant B", 50));
  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>("now");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("09:00");
  const [submitted, setSubmitted] = useState(false);

  const step = STEPS[stepIndex];
  const selectedSegment = segments.find((s) => s.id === segmentId);
  const reach = useMemo(() => (selectedSegment ? estimateReach(selectedSegment.rules) : 0), [selectedSegment]);

  function togglePlatform(platform: Platform) {
    setPlatforms((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]
    );
  }

  function applyTemplate(templateId: string, target: "a" | "b") {
    const template = templates.find((t) => t.id === templateId);
    if (!template) return;
    const patch = { title: template.title, body: template.body, icon: template.icon };
    if (target === "a") setVariantA((prev) => ({ ...prev, ...patch }));
    else setVariantB((prev) => ({ ...prev, ...patch }));
  }

  function handleSplitChange(splitA: number) {
    setVariantA((prev) => ({ ...prev, trafficSplit: splitA }));
    setVariantB((prev) => ({ ...prev, trafficSplit: 100 - splitA }));
  }

  function canProceed(): boolean {
    if (step === "Audience") return name.trim().length > 0 && !!segmentId && platforms.length > 0;
    if (step === "Message") return variantA.title.trim().length > 0 && variantA.body.trim().length > 0;
    if (step === "A/B test") return !abTestEnabled || (variantB.title.trim().length > 0 && variantB.body.trim().length > 0);
    if (step === "Schedule") return scheduleMode === "now" || scheduledDate.length > 0;
    return true;
  }

  function goNext() {
    if (stepIndex < STEPS.length - 1) setStepIndex(stepIndex + 1);
  }
  function goBack() {
    if (stepIndex > 0) setStepIndex(stepIndex - 1);
  }

  function handleSubmit() {
    const scheduledAt =
      scheduleMode === "later" && scheduledDate ? new Date(`${scheduledDate}T${scheduledTime}`).toISOString() : null;

    const variants = abTestEnabled
      ? [
          { ...variantA, trafficSplit: variantA.trafficSplit },
          { ...variantB, trafficSplit: variantB.trafficSplit },
        ]
      : [{ ...variantA, trafficSplit: 100 }];

    addCampaign({
      name,
      segmentId,
      platforms,
      scheduleMode,
      scheduledAt,
      abTestEnabled,
      variants,
    });

    setSubmitted(true);
    setTimeout(() => router.push("/"), 1200);
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto text-center py-24">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-xl font-semibold text-gray-900">
          {scheduleMode === "now" ? "Campaign sent!" : "Campaign scheduled!"}
        </h2>
        <p className="text-sm text-gray-500 mt-1">Redirecting to your campaigns…</p>
      </div>
    );
  }

  return (
    <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-8 lg:items-start">
      <div>
        {/* Step indicator */}
        <ol className="flex flex-wrap items-center gap-2 mb-6">
          {STEPS.map((s, idx) => (
            <li key={s} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => idx < stepIndex && setStepIndex(idx)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  idx === stepIndex
                    ? "bg-brand-600 text-white"
                    : idx < stepIndex
                    ? "bg-brand-100 text-brand-700 cursor-pointer"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                <span>{idx + 1}</span>
                {s}
              </button>
              {idx < STEPS.length - 1 && <span className="text-gray-300">›</span>}
            </li>
          ))}
        </ol>

        <div className="card p-5 sm:p-6">
          {step === "Audience" && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold">Audience &amp; platforms</h2>
              <div>
                <label className="label">Campaign name</label>
                <input
                  className="input"
                  placeholder="e.g. Fall Sale Kickoff"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="label">Audience segment</label>
                <select className="input" value={segmentId} onChange={(e) => setSegmentId(e.target.value)}>
                  {segments.map((seg) => (
                    <option key={seg.id} value={seg.id}>
                      {seg.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1.5">
                  Estimated reach: <span className="font-semibold text-gray-700">{reach.toLocaleString()}</span> users
                </p>
              </div>
              <div>
                <label className="label">Target platforms</label>
                <div className="flex flex-wrap gap-2">
                  {PLATFORM_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => togglePlatform(opt.value)}
                      className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                        platforms.includes(opt.value)
                          ? "border-brand-500 bg-brand-50 text-brand-700"
                          : "border-gray-300 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <span aria-hidden>{opt.icon}</span>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === "Message" && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold">Message content</h2>
              {templates.length > 0 && (
                <div>
                  <label className="label">Start from a template (optional)</label>
                  <select className="input" onChange={(e) => e.target.value && applyTemplate(e.target.value, "a")}>
                    <option value="">Blank message</option>
                    {templates.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <VariantFields variant={variantA} onChange={setVariantA} />
            </div>
          )}

          {step === "A/B test" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">A/B test mode</h2>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={abTestEnabled}
                    onChange={(e) => setAbTestEnabled(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                  />
                  Enable A/B test
                </label>
              </div>
              {abTestEnabled ? (
                <>
                  <ABTestSplitSlider splitA={variantA.trafficSplit} onChange={handleSplitChange} />
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Variant B message</h3>
                    <VariantFields variant={variantB} onChange={setVariantB} />
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-500">
                  Enable A/B testing to split traffic between two message variants and automatically declare a winner
                  based on click-through rate after sending.
                </p>
              )}
            </div>
          )}

          {step === "Schedule" && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold">Schedule</h2>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setScheduleMode("now")}
                  className={`flex-1 rounded-lg border px-4 py-3 text-sm font-medium text-left ${
                    scheduleMode === "now" ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-300"
                  }`}
                >
                  <p className="font-semibold">Send now</p>
                  <p className="text-xs text-gray-500">Deliver immediately after submitting</p>
                </button>
                <button
                  type="button"
                  onClick={() => setScheduleMode("later")}
                  className={`flex-1 rounded-lg border px-4 py-3 text-sm font-medium text-left ${
                    scheduleMode === "later" ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-300"
                  }`}
                >
                  <p className="font-semibold">Schedule for later</p>
                  <p className="text-xs text-gray-500">Pick a date and time</p>
                </button>
              </div>
              {scheduleMode === "later" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Date</label>
                    <input
                      type="date"
                      className="input"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label">Time</label>
                    <input
                      type="time"
                      className="input"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {step === "Review" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Review &amp; send</h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <ReviewRow label="Name" value={name || "—"} />
                <ReviewRow label="Segment" value={selectedSegment?.name ?? "—"} />
                <ReviewRow label="Reach" value={`${reach.toLocaleString()} users`} />
                <ReviewRow label="Platforms" value={platforms.join(", ") || "—"} />
                <ReviewRow label="A/B test" value={abTestEnabled ? "Enabled" : "Disabled"} />
                <ReviewRow
                  label="Schedule"
                  value={scheduleMode === "now" ? "Immediately" : `${scheduledDate} ${scheduledTime}`}
                />
              </dl>
              <button type="button" onClick={handleSubmit} className="btn-primary w-full">
                {scheduleMode === "now" ? "Send campaign" : "Schedule campaign"}
              </button>
            </div>
          )}

          <div className="flex items-center justify-between mt-6 pt-5 border-t border-gray-100">
            <button type="button" onClick={goBack} disabled={stepIndex === 0} className="btn-secondary">
              Back
            </button>
            {step !== "Review" && (
              <button type="button" onClick={goNext} disabled={!canProceed()} className="btn-primary">
                Continue
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Live preview, docked on desktop */}
      <div className="mt-8 lg:mt-0 lg:sticky lg:top-6">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 text-center lg:text-left">
          Live preview
        </p>
        <DeviceFramePreview
          title={variantA.title}
          body={variantA.body}
          icon={variantA.icon}
          platform={platforms[0] ?? "ios"}
        />
        {abTestEnabled && (
          <div className="mt-6">
            <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-3 text-center lg:text-left">
              Variant B preview
            </p>
            <DeviceFramePreview
              title={variantB.title}
              body={variantB.body}
              icon={variantB.icon}
              platform={platforms[0] ?? "ios"}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function VariantFields({
  variant,
  onChange,
}: {
  variant: VariantForm;
  onChange: (v: VariantForm) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-[80px_1fr] gap-3">
        <div>
          <label className="label">Icon</label>
          <input
            className="input text-center text-lg"
            value={variant.icon}
            maxLength={2}
            onChange={(e) => onChange({ ...variant, icon: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Title</label>
          <input
            className="input"
            placeholder="Notification title"
            value={variant.title}
            onChange={(e) => onChange({ ...variant, title: e.target.value })}
          />
        </div>
      </div>
      <div>
        <label className="label">Body</label>
        <textarea
          className="input"
          rows={3}
          placeholder="Notification body text"
          value={variant.body}
          onChange={(e) => onChange({ ...variant, body: e.target.value })}
        />
      </div>
      <div>
        <label className="label">Deep link</label>
        <input
          className="input"
          placeholder="app://path/to/screen"
          value={variant.deepLink}
          onChange={(e) => onChange({ ...variant, deepLink: e.target.value })}
        />
      </div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-gray-50 px-3 py-2">
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className="font-medium text-gray-900">{value}</dd>
    </div>
  );
}
