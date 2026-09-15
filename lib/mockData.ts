import type {
  Campaign,
  MockUser,
  OptInTrendPoint,
  SampleUserData,
  SegmentRule,
  Segment,
  SentNotification,
  Template,
} from "./types";

// ---------------------------------------------------------------------------
// Mock user population used to estimate audience-segment reach.
// ---------------------------------------------------------------------------
const DEVICE_TYPES: MockUser["deviceType"][] = ["ios", "android", "web"];
const TAG_POOL = ["vip", "trial", "churn-risk", "power-user", "newsletter", "beta"];

function seededRandom(seed: number) {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

function generateMockUsers(count: number): MockUser[] {
  const rand = seededRandom(42);
  const users: MockUser[] = [];
  for (let i = 0; i < count; i++) {
    const deviceType = DEVICE_TYPES[Math.floor(rand() * DEVICE_TYPES.length)];
    const lastActiveDaysAgo = Math.floor(rand() * 120);
    const tagCount = Math.floor(rand() * 3);
    const tags: string[] = [];
    for (let t = 0; t < tagCount; t++) {
      const tag = TAG_POOL[Math.floor(rand() * TAG_POOL.length)];
      if (!tags.includes(tag)) tags.push(tag);
    }
    users.push({
      id: `user-${i + 1}`,
      deviceType,
      lastActiveDaysAgo,
      tags,
    });
  }
  return users;
}

export const MOCK_USERS: MockUser[] = generateMockUsers(12000);

export function lastActiveWindowToDays(window: SegmentRule["lastActive"]): number | null {
  switch (window) {
    case "24h":
      return 1;
    case "7d":
      return 7;
    case "30d":
      return 30;
    case "90d":
      return 90;
    case "any":
    default:
      return null;
  }
}

/**
 * Estimates reach for a set of segment rules against the mock user
 * population. Rules are combined as OR (a user matches the segment if they
 * satisfy at least one rule) which mirrors "any of these audiences" targeting
 * common in push campaign tools.
 */
export function estimateReach(rules: SegmentRule[]): number {
  if (rules.length === 0) return 0;
  const matched = new Set<string>();
  for (const user of MOCK_USERS) {
    for (const rule of rules) {
      const deviceOk = rule.deviceType === "any" || rule.deviceType === user.deviceType;
      const maxDays = lastActiveWindowToDays(rule.lastActive);
      const activeOk = maxDays === null || user.lastActiveDaysAgo <= maxDays;
      const tagOk = !rule.tag || user.tags.includes(rule.tag);
      if (deviceOk && activeOk && tagOk) {
        matched.add(user.id);
        break;
      }
    }
  }
  return matched.size;
}

// ---------------------------------------------------------------------------
// Segments
// ---------------------------------------------------------------------------
export const INITIAL_SEGMENTS: Segment[] = [
  {
    id: "seg-1",
    name: "Active iOS users (7d)",
    createdAt: "2026-08-01T10:00:00.000Z",
    rules: [{ id: "rule-1", deviceType: "ios", lastActive: "7d", tag: null }],
  },
  {
    id: "seg-2",
    name: "VIP customers, any device",
    createdAt: "2026-08-05T14:30:00.000Z",
    rules: [{ id: "rule-2", deviceType: "any", lastActive: "any", tag: "vip" }],
  },
  {
    id: "seg-3",
    name: "Churn risk, active 30d",
    createdAt: "2026-08-12T09:15:00.000Z",
    rules: [{ id: "rule-3", deviceType: "any", lastActive: "30d", tag: "churn-risk" }],
  },
];

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------
export const INITIAL_TEMPLATES: Template[] = [
  {
    id: "tpl-1",
    name: "Welcome message",
    title: "Welcome, {{firstName}}!",
    body: "Hey {{firstName}}, thanks for joining us in {{city}}. Your {{planName}} plan is now active.",
    icon: "👋",
    createdAt: "2026-07-20T08:00:00.000Z",
    updatedAt: "2026-07-20T08:00:00.000Z",
  },
  {
    id: "tpl-2",
    name: "Cart reminder",
    title: "{{firstName}}, you left something behind",
    body: "Your cart is waiting! Complete your order before it expires.",
    icon: "🛒",
    createdAt: "2026-07-25T11:20:00.000Z",
    updatedAt: "2026-08-02T09:10:00.000Z",
  },
  {
    id: "tpl-3",
    name: "Renewal notice",
    title: "Your {{planName}} plan renews soon",
    body: "Hi {{firstName}}, your subscription renews in 3 days. No action needed.",
    icon: "🔔",
    createdAt: "2026-08-10T16:45:00.000Z",
    updatedAt: "2026-08-10T16:45:00.000Z",
  },
];

export const SAMPLE_USER_DATA: SampleUserData = {
  firstName: "Jordan",
  lastName: "Reyes",
  city: "Austin",
  planName: "Pro",
};

export function renderTemplate(text: string, data: SampleUserData): string {
  return text.replace(/{{\s*(\w+)\s*}}/g, (match, key: string) => {
    const value = (data as unknown as Record<string, string>)[key];
    return value !== undefined ? value : match;
  });
}

// ---------------------------------------------------------------------------
// Campaigns
// ---------------------------------------------------------------------------
export const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: "camp-1",
    name: "Fall Sale Kickoff",
    status: "sent",
    segmentId: "seg-1",
    platforms: ["ios", "android"],
    scheduleMode: "now",
    scheduledAt: null,
    createdAt: "2026-09-01T09:00:00.000Z",
    sentAt: "2026-09-01T09:05:00.000Z",
    abTestEnabled: true,
    variants: [
      {
        id: "camp-1-a",
        label: "Variant A",
        title: "Fall Sale is live!",
        body: "Save up to 40% storewide, today only.",
        icon: "🍂",
        deepLink: "app://sale/fall",
        trafficSplit: 50,
        delivered: 4820,
        opened: 1620,
        clicked: 640,
      },
      {
        id: "camp-1-b",
        label: "Variant B",
        title: "40% off — ends tonight",
        body: "Don't miss the Fall Sale. Shop now before it's gone.",
        icon: "🍁",
        deepLink: "app://sale/fall",
        trafficSplit: 50,
        delivered: 4790,
        opened: 1810,
        clicked: 810,
      },
    ],
    winnerVariantId: "camp-1-b",
    funnel: { delivered: 9610, opened: 3430, clicked: 1450 },
  },
  {
    id: "camp-2",
    name: "VIP Early Access",
    status: "scheduled",
    segmentId: "seg-2",
    platforms: ["ios", "android", "web"],
    scheduleMode: "later",
    scheduledAt: "2026-09-20T15:00:00.000Z",
    createdAt: "2026-09-10T12:00:00.000Z",
    sentAt: null,
    abTestEnabled: false,
    variants: [
      {
        id: "camp-2-a",
        label: "Variant A",
        title: "Early access starts now",
        body: "As a VIP, you get 24-hour early access to our new drop.",
        icon: "⭐",
        deepLink: "app://vip/early-access",
        trafficSplit: 100,
        delivered: 0,
        opened: 0,
        clicked: 0,
      },
    ],
    winnerVariantId: null,
    funnel: { delivered: 0, opened: 0, clicked: 0 },
  },
  {
    id: "camp-3",
    name: "Win-back Churn Risk",
    status: "draft",
    segmentId: "seg-3",
    platforms: ["android"],
    scheduleMode: "later",
    scheduledAt: null,
    createdAt: "2026-09-12T08:30:00.000Z",
    sentAt: null,
    abTestEnabled: false,
    variants: [
      {
        id: "camp-3-a",
        label: "Variant A",
        title: "We miss you",
        body: "Come back and get 20% off your next order.",
        icon: "💌",
        deepLink: "app://offers/comeback",
        trafficSplit: 100,
        delivered: 0,
        opened: 0,
        clicked: 0,
      },
    ],
    winnerVariantId: null,
    funnel: { delivered: 0, opened: 0, clicked: 0 },
  },
  {
    id: "camp-4",
    name: "Weekly Digest #37",
    status: "sent",
    segmentId: "seg-1",
    platforms: ["ios", "android", "web"],
    scheduleMode: "now",
    scheduledAt: null,
    createdAt: "2026-09-05T07:00:00.000Z",
    sentAt: "2026-09-05T07:02:00.000Z",
    abTestEnabled: false,
    variants: [
      {
        id: "camp-4-a",
        label: "Variant A",
        title: "Your weekly digest is here",
        body: "Catch up on what happened this week.",
        icon: "📰",
        deepLink: "app://digest/37",
        trafficSplit: 100,
        delivered: 6200,
        opened: 2480,
        clicked: 860,
      },
    ],
    winnerVariantId: null,
    funnel: { delivered: 6200, opened: 2480, clicked: 860 },
  },
];

// ---------------------------------------------------------------------------
// Sent notifications (for the notification-center preview)
// ---------------------------------------------------------------------------
export const INITIAL_SENT_NOTIFICATIONS: SentNotification[] = [
  {
    id: "note-1",
    campaignId: "camp-1",
    campaignName: "Fall Sale Kickoff",
    title: "40% off — ends tonight",
    body: "Don't miss the Fall Sale. Shop now before it's gone.",
    icon: "🍁",
    sentAt: "2026-09-01T09:05:00.000Z",
    platform: "ios",
  },
  {
    id: "note-2",
    campaignId: "camp-4",
    campaignName: "Weekly Digest #37",
    title: "Your weekly digest is here",
    body: "Catch up on what happened this week.",
    icon: "📰",
    sentAt: "2026-09-05T07:02:00.000Z",
    platform: "android",
  },
];

// ---------------------------------------------------------------------------
// Opt-in rate trend (aggregate, last 14 days)
// ---------------------------------------------------------------------------
export const OPT_IN_TREND: OptInTrendPoint[] = [
  { date: "Sep 01", optInRate: 62.1 },
  { date: "Sep 02", optInRate: 63.0 },
  { date: "Sep 03", optInRate: 61.4 },
  { date: "Sep 04", optInRate: 64.2 },
  { date: "Sep 05", optInRate: 65.8 },
  { date: "Sep 06", optInRate: 66.5 },
  { date: "Sep 07", optInRate: 65.1 },
  { date: "Sep 08", optInRate: 67.0 },
  { date: "Sep 09", optInRate: 68.4 },
  { date: "Sep 10", optInRate: 67.9 },
  { date: "Sep 11", optInRate: 69.2 },
  { date: "Sep 12", optInRate: 70.5 },
  { date: "Sep 13", optInRate: 71.1 },
  { date: "Sep 14", optInRate: 72.0 },
];

// ---------------------------------------------------------------------------
// Best send-time heatmap (day x hour), values are relative engagement 0-100
// ---------------------------------------------------------------------------
export const SEND_TIME_HEATMAP: number[][] = (() => {
  const rand = seededRandom(7);
  const days = 7;
  const hours = 24;
  const grid: number[][] = [];
  for (let d = 0; d < days; d++) {
    const row: number[] = [];
    for (let h = 0; h < hours; h++) {
      // baseline curve peaking around lunchtime and evening
      const base =
        40 +
        30 * Math.exp(-Math.pow(h - 12, 2) / 18) +
        25 * Math.exp(-Math.pow(h - 19, 2) / 10);
      const weekendBoost = d === 5 || d === 6 ? 10 : 0;
      const noise = (rand() - 0.5) * 12;
      row.push(Math.max(0, Math.min(100, Math.round(base + weekendBoost + noise))));
    }
    grid.push(row);
  }
  return grid;
})();

export const HEATMAP_DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
