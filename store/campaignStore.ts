import { create } from "zustand";
import type { Campaign, CampaignVariant, Platform, ScheduleMode, SentNotification } from "@/lib/types";
import { INITIAL_CAMPAIGNS, INITIAL_SENT_NOTIFICATIONS } from "@/lib/mockData";

function randomId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export interface NewCampaignInput {
  name: string;
  segmentId: string;
  platforms: Platform[];
  scheduleMode: ScheduleMode;
  scheduledAt: string | null;
  abTestEnabled: boolean;
  variants: Omit<CampaignVariant, "id" | "delivered" | "opened" | "clicked">[];
}

interface CampaignStoreState {
  campaigns: Campaign[];
  sentNotifications: SentNotification[];
  addCampaign: (input: NewCampaignInput) => Campaign;
  duplicateCampaign: (id: string) => void;
  cancelCampaign: (id: string) => void;
  updateCampaign: (id: string, updates: Partial<Campaign>) => void;
  sendCampaignNow: (id: string) => void;
}

function fakeFunnelForVariant(splitWeight: number) {
  const delivered = Math.round(800 * (splitWeight / 100) + Math.random() * 400);
  const opened = Math.round(delivered * (0.3 + Math.random() * 0.25));
  const clicked = Math.round(opened * (0.25 + Math.random() * 0.3));
  return { delivered, opened, clicked };
}

export const useCampaignStore = create<CampaignStoreState>((set, get) => ({
  campaigns: INITIAL_CAMPAIGNS,
  sentNotifications: INITIAL_SENT_NOTIFICATIONS,

  addCampaign: (input) => {
    const variants: CampaignVariant[] = input.variants.map((v, idx) => ({
      ...v,
      id: randomId("var"),
      delivered: 0,
      opened: 0,
      clicked: 0,
    }));
    const isImmediate = input.scheduleMode === "now";
    const campaign: Campaign = {
      id: randomId("camp"),
      name: input.name,
      status: isImmediate ? "sent" : "scheduled",
      segmentId: input.segmentId,
      platforms: input.platforms,
      scheduleMode: input.scheduleMode,
      scheduledAt: input.scheduledAt,
      createdAt: new Date().toISOString(),
      sentAt: isImmediate ? new Date().toISOString() : null,
      abTestEnabled: input.abTestEnabled,
      variants,
      winnerVariantId: null,
      funnel: { delivered: 0, opened: 0, clicked: 0 },
    };

    set((state) => ({ campaigns: [campaign, ...state.campaigns] }));

    if (isImmediate) {
      get().sendCampaignNow(campaign.id);
    }

    return campaign;
  },

  duplicateCampaign: (id) => {
    const source = get().campaigns.find((c) => c.id === id);
    if (!source) return;
    const copy: Campaign = {
      ...source,
      id: randomId("camp"),
      name: `${source.name} (copy)`,
      status: "draft",
      createdAt: new Date().toISOString(),
      sentAt: null,
      scheduledAt: null,
      winnerVariantId: null,
      variants: source.variants.map((v) => ({
        ...v,
        id: randomId("var"),
        delivered: 0,
        opened: 0,
        clicked: 0,
      })),
      funnel: { delivered: 0, opened: 0, clicked: 0 },
    };
    set((state) => ({ campaigns: [copy, ...state.campaigns] }));
  },

  cancelCampaign: (id) => {
    set((state) => ({
      campaigns: state.campaigns.map((c) =>
        c.id === id && c.status === "scheduled" ? { ...c, status: "draft", scheduledAt: null } : c
      ),
    }));
  },

  updateCampaign: (id, updates) => {
    set((state) => ({
      campaigns: state.campaigns.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }));
  },

  sendCampaignNow: (id) => {
    set((state) => {
      const campaign = state.campaigns.find((c) => c.id === id);
      if (!campaign) return state;

      const variants = campaign.variants.map((v) => ({
        ...v,
        ...fakeFunnelForVariant(v.trafficSplit),
      }));

      const funnel = variants.reduce(
        (acc, v) => ({
          delivered: acc.delivered + v.delivered,
          opened: acc.opened + v.opened,
          clicked: acc.clicked + v.clicked,
        }),
        { delivered: 0, opened: 0, clicked: 0 }
      );

      let winnerVariantId: string | null = null;
      if (campaign.abTestEnabled && variants.length > 1) {
        winnerVariantId = variants.reduce((best, v) => {
          const bestCtr = best.delivered > 0 ? best.clicked / best.delivered : 0;
          const vCtr = v.delivered > 0 ? v.clicked / v.delivered : 0;
          return vCtr > bestCtr ? v : best;
        }).id;
      }

      const updatedCampaign: Campaign = {
        ...campaign,
        status: "sent",
        sentAt: new Date().toISOString(),
        variants,
        funnel,
        winnerVariantId,
      };

      const primaryVariant = winnerVariantId
        ? variants.find((v) => v.id === winnerVariantId)!
        : variants[0];

      const newNotification: SentNotification = {
        id: randomId("note"),
        campaignId: campaign.id,
        campaignName: campaign.name,
        title: primaryVariant.title,
        body: primaryVariant.body,
        icon: primaryVariant.icon,
        sentAt: updatedCampaign.sentAt!,
        platform: campaign.platforms[0] ?? "ios",
      };

      return {
        campaigns: state.campaigns.map((c) => (c.id === id ? updatedCampaign : c)),
        sentNotifications: [newNotification, ...state.sentNotifications],
      };
    });
  },
}));
