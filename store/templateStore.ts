import { create } from "zustand";
import type { Template } from "@/lib/types";
import { INITIAL_TEMPLATES } from "@/lib/mockData";

function randomId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

interface TemplateStoreState {
  templates: Template[];
  addTemplate: (data: Omit<Template, "id" | "createdAt" | "updatedAt">) => Template;
  updateTemplate: (id: string, data: Partial<Omit<Template, "id" | "createdAt">>) => void;
  removeTemplate: (id: string) => void;
}

export const useTemplateStore = create<TemplateStoreState>((set) => ({
  templates: INITIAL_TEMPLATES,

  addTemplate: (data) => {
    const now = new Date().toISOString();
    const template: Template = {
      ...data,
      id: randomId("tpl"),
      createdAt: now,
      updatedAt: now,
    };
    set((state) => ({ templates: [template, ...state.templates] }));
    return template;
  },

  updateTemplate: (id, data) => {
    set((state) => ({
      templates: state.templates.map((t) =>
        t.id === id ? { ...t, ...data, updatedAt: new Date().toISOString() } : t
      ),
    }));
  },

  removeTemplate: (id) => {
    set((state) => ({ templates: state.templates.filter((t) => t.id !== id) }));
  },
}));
