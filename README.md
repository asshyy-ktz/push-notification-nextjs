# Pulse — Push Notification Console

A source-only Next.js 14 (App Router) console for planning, targeting, and analyzing
push notification campaigns. All data is local/mock — there is no real backend or
push delivery API involved.

## Tech stack

- **Next.js 14** (App Router, TypeScript, React 18)
- **Tailwind CSS** for styling
- **Zustand** for campaign / segment / template client state
- **TanStack Query** (`@tanstack/react-query`) — `QueryClientProvider` is wired up in
  `app/providers.tsx` so any future data-fetching hooks have a client ready to use

## Architecture

```
app/
  layout.tsx            Root layout: sidebar nav + providers
  page.tsx               Campaign list (default route)
  campaigns/new/page.tsx Campaign builder wizard
  segments/page.tsx      Segment rule builder + saved segments
  templates/page.tsx     Template editor + saved templates
  analytics/page.tsx     Funnel / opt-in trend / heatmap dashboards
components/               Shared, mostly presentational UI
store/                    Zustand stores (client-side state)
lib/                      Types + mock data + derived helpers (reach estimation,
                           template rendering)
```

Route segments under `app/` map 1:1 to the primary sections of the product
(campaigns, segments, templates, analytics). Shared UI lives in `components/`,
all mutable client state lives in three focused Zustand stores under `store/`,
and static types + generated mock data live under `lib/`.

### State flow

- `store/campaignStore.ts` — the list of campaigns, A/B variants, funnel numbers,
  and the "sent notifications" feed shown in the notification-center preview.
  Sending a campaign (immediately, or via the wizard's "send now" mode)
  synthesizes funnel numbers and, when A/B testing is enabled, declares a winner
  based on simulated click-through rate.
- `store/segmentStore.ts` — saved audience segments (each a list of OR'd rules).
- `store/templateStore.ts` — saved reusable message templates.

None of the stores persist to `localStorage` on purpose — this is a demo/prototype
data model, reset on reload — but they are structured so swapping in a real API
(via TanStack Query mutations) would only touch the store actions, not the
components that call them.

## Segment / reach estimation model

`lib/mockData.ts` generates a deterministic (seeded) population of 12,000 mock
users, each with:

- a `deviceType` (`ios` | `android` | `web`)
- a `lastActiveDaysAgo` value
- zero or more tags drawn from a small tag pool (`vip`, `trial`, `churn-risk`,
  `power-user`, `newsletter`, `beta`)

A **segment** is a list of **rules**. Each rule can filter by device type, a
"last active within" window (24h / 7d / 30d / 90d / any), and an optional tag.
`estimateReach()` combines rules with **OR** semantics: a user is counted if
they match *any* rule in the segment (this mirrors "target any of these
audiences" behavior common in real push tools). Within a single rule, the
device/last-active/tag conditions are combined with **AND**.

Because the user population and its randomness are seeded, reach numbers are
stable across reloads for the same rule set, which makes the builder feel like
it's querying a real audience while staying fully client-side.

## Notable features

- **Campaign builder wizard** (`components/CampaignBuilderWizard.tsx`) — a
  5-step flow (Audience → Message → A/B test → Schedule → Review) with a live
  device-frame preview docked beside the form on desktop and stacked above the
  steps on mobile.
- **A/B testing** — toggle a second message variant, set the traffic split with
  `ABTestSplitSlider`, and see a mock winner (highest simulated CTR) declared
  once the campaign is "sent."
- **Charts are hand-rolled SVG** — `FunnelChart`, `OptInTrendChart`, and
  `SendTimeHeatmap` render directly to `<svg>`/styled `<div>` grids with no
  charting library dependency.
- **Notification center preview** — `NotificationCenterPreview` shows a
  simulated device tray of recently "sent" notifications, updated whenever a
  campaign is sent from the builder or the campaign list.

## Running locally

This repository is checked in as **source only** — no `node_modules`,
`package-lock.json`, or `.next` build output are included.

```bash
npm install
npm run dev
```

Then open http://localhost:3000. Build for production with `npm run build`
followed by `npm run start`.
