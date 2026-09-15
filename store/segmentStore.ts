import { create } from "zustand";
import type { Segment, SegmentRule } from "@/lib/types";
import { INITIAL_SEGMENTS } from "@/lib/mockData";

function randomId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

interface SegmentStoreState {
  segments: Segment[];
  addSegment: (name: string, rules: SegmentRule[]) => Segment;
  removeSegment: (id: string) => void;
}

export const useSegmentStore = create<SegmentStoreState>((set) => ({
  segments: INITIAL_SEGMENTS,

  addSegment: (name, rules) => {
    const segment: Segment = {
      id: randomId("seg"),
      name,
      createdAt: new Date().toISOString(),
      rules,
    };
    set((state) => ({ segments: [segment, ...state.segments] }));
    return segment;
  },

  removeSegment: (id) => {
    set((state) => ({ segments: state.segments.filter((s) => s.id !== id) }));
  },
}));

export function createEmptyRule(): SegmentRule {
  return {
    id: `rule-${Math.random().toString(36).slice(2, 9)}`,
    deviceType: "any",
    lastActive: "any",
    tag: null,
  };
}
