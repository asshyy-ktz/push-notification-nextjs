"use client";

import { useState } from "react";
import type { Template } from "@/lib/types";
import { useTemplateStore } from "@/store/templateStore";
import { TemplateEditor } from "@/components/TemplateEditor";
import { renderTemplate, SAMPLE_USER_DATA } from "@/lib/mockData";

export default function TemplatesPage() {
  const templates = useTemplateStore((s) => s.templates);
  const removeTemplate = useTemplateStore((s) => s.removeTemplate);
  const [editing, setEditing] = useState<Template | null>(null);

  return (
    <div className="p-5 sm:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Templates</h1>
        <p className="text-sm text-gray-500 mt-1">
          Reusable message templates with variable placeholders like <code>{"{{firstName}}"}</code>.
        </p>
      </div>

      <div className="mb-8">
        <TemplateEditor template={editing} onDone={() => setEditing(null)} key={editing?.id ?? "new"} />
      </div>

      <h2 className="font-semibold text-gray-900 mb-4">Saved templates</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <div key={template.id} className="card p-4 flex flex-col">
            <div className="flex items-start gap-2.5">
              <div className="h-9 w-9 rounded-lg bg-brand-100 flex items-center justify-center text-lg shrink-0">
                {template.icon}
              </div>
              <div className="min-w-0">
                <p className="font-medium text-gray-900 truncate">{template.name}</p>
                <p className="text-xs text-gray-500">
                  Updated {new Date(template.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="mt-3 rounded-lg bg-gray-50 p-3 text-xs flex-1">
              <p className="font-semibold text-gray-700 truncate">{renderTemplate(template.title, SAMPLE_USER_DATA)}</p>
              <p className="text-gray-500 mt-1 line-clamp-3">{renderTemplate(template.body, SAMPLE_USER_DATA)}</p>
            </div>
            <div className="flex gap-2 mt-3">
              <button type="button" onClick={() => setEditing(template)} className="btn-secondary text-xs flex-1">
                Edit
              </button>
              <button
                type="button"
                onClick={() => removeTemplate(template.id)}
                className="btn-ghost text-xs text-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {templates.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-10 col-span-full">No templates yet.</p>
        )}
      </div>
    </div>
  );
}
