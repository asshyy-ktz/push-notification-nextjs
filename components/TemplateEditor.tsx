"use client";

import { useState } from "react";
import type { Template } from "@/lib/types";
import { useTemplateStore } from "@/store/templateStore";
import { renderTemplate, SAMPLE_USER_DATA } from "@/lib/mockData";
import { DeviceFramePreview } from "./DeviceFramePreview";

const AVAILABLE_VARIABLES = ["firstName", "lastName", "city", "planName"];

interface TemplateEditorProps {
  template?: Template | null;
  onDone?: () => void;
}

export function TemplateEditor({ template, onDone }: TemplateEditorProps) {
  const addTemplate = useTemplateStore((s) => s.addTemplate);
  const updateTemplate = useTemplateStore((s) => s.updateTemplate);

  const [name, setName] = useState(template?.name ?? "");
  const [title, setTitle] = useState(template?.title ?? "");
  const [body, setBody] = useState(template?.body ?? "");
  const [icon, setIcon] = useState(template?.icon ?? "🔔");

  function insertVariable(field: "title" | "body", variable: string) {
    const token = `{{${variable}}}`;
    if (field === "title") setTitle((prev) => `${prev}${prev.endsWith(" ") || prev === "" ? "" : " "}${token}`);
    else setBody((prev) => `${prev}${prev.endsWith(" ") || prev === "" ? "" : " "}${token}`);
  }

  function handleSave() {
    if (!name.trim() || !title.trim() || !body.trim()) return;
    if (template) {
      updateTemplate(template.id, { name, title, body, icon });
    } else {
      addTemplate({ name, title, body, icon });
    }
    if (!template) {
      setName("");
      setTitle("");
      setBody("");
      setIcon("🔔");
    }
    onDone?.();
  }

  return (
    <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-6">
      <div className="card p-5 space-y-4">
        <h3 className="font-semibold text-gray-900">{template ? "Edit template" : "New template"}</h3>
        <div>
          <label className="label">Template name</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Welcome message" />
        </div>
        <div className="grid grid-cols-[80px_1fr] gap-3">
          <div>
            <label className="label">Icon</label>
            <input className="input text-center text-lg" maxLength={2} value={icon} onChange={(e) => setIcon(e.target.value)} />
          </div>
          <div>
            <label className="label">Title</label>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Hi {{firstName}}!" />
          </div>
        </div>
        <div>
          <label className="label">Body</label>
          <textarea className="input" rows={3} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Message body with {{variables}}" />
        </div>
        <div>
          <p className="label mb-1.5">Insert variable</p>
          <div className="flex flex-wrap gap-1.5">
            {AVAILABLE_VARIABLES.map((v) => (
              <div key={v} className="flex gap-1">
                <button type="button" onClick={() => insertVariable("title", v)} className="btn-secondary text-xs px-2 py-1">
                  {`{{${v}}}`} → title
                </button>
                <button type="button" onClick={() => insertVariable("body", v)} className="btn-secondary text-xs px-2 py-1">
                  → body
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <button type="button" onClick={handleSave} className="btn-primary">
            {template ? "Save changes" : "Create template"}
          </button>
          {template && onDone && (
            <button type="button" onClick={onDone} className="btn-secondary">
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 lg:mt-0">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 text-center lg:text-left">
          Preview with sample data
        </p>
        <DeviceFramePreview
          title={renderTemplate(title, SAMPLE_USER_DATA)}
          body={renderTemplate(body, SAMPLE_USER_DATA)}
          icon={icon}
        />
        <div className="card p-3 mt-4 text-xs text-gray-500">
          <p className="font-semibold text-gray-600 mb-1">Sample data used</p>
          <ul className="space-y-0.5">
            {Object.entries(SAMPLE_USER_DATA).map(([key, value]) => (
              <li key={key}>
                {"{{"}
                {key}
                {"}}"} → {value}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
