export type CampaignStatus = "draft" | "scheduled" | "sent";

export type Platform = "ios" | "android" | "web";

export type ScheduleMode = "now" | "later";

export interface CampaignVariant {
  id: string;
  label: string;
  title: string;
  body: string;
  icon: string;
  deepLink: string;
  trafficSplit: number; // 0-100
  delivered: number;
  opened: number;
  clicked: number;
}

export interface FunnelPoint {
  delivered: number;
  opened: number;
  clicked: number;
}

export interface Campaign {
  id: string;
  name: string;
  status: CampaignStatus;
  segmentId: string;
  platforms: Platform[];
  scheduleMode: ScheduleMode;
  scheduledAt: string | null;
  createdAt: string;
  sentAt: string | null;
  abTestEnabled: boolean;
  variants: CampaignVariant[];
  winnerVariantId: string | null;
  funnel: FunnelPoint;
}

export type DeviceType = "ios" | "android" | "web" | "any";

export type LastActiveWindow = "24h" | "7d" | "30d" | "90d" | "any";

export interface SegmentRule {
  id: string;
  deviceType: DeviceType;
  lastActive: LastActiveWindow;
  tag: string | null;
}

export interface Segment {
  id: string;
  name: string;
  createdAt: string;
  rules: SegmentRule[];
}

export interface MockUser {
  id: string;
  deviceType: Exclude<DeviceType, "any">;
  lastActiveDaysAgo: number;
  tags: string[];
}

export interface Template {
  id: string;
  name: string;
  title: string;
  body: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
}

export interface SentNotification {
  id: string;
  campaignId: string;
  campaignName: string;
  title: string;
  body: string;
  icon: string;
  sentAt: string;
  platform: Platform;
}

export interface OptInTrendPoint {
  date: string;
  optInRate: number;
}

export interface SampleUserData {
  firstName: string;
  lastName: string;
  city: string;
  planName: string;
}
