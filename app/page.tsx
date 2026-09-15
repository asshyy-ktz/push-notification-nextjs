import Link from "next/link";
import { CampaignTable } from "@/components/CampaignTable";
import { NotificationCenterPreview } from "@/components/NotificationCenterPreview";

export default function CampaignsPage() {
  return (
    <div className="p-5 sm:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
          <p className="text-sm text-gray-500 mt-1">Plan, send, and track your push notification campaigns.</p>
        </div>
        <Link href="/campaigns/new" className="btn-primary hidden sm:inline-flex">
          + New campaign
        </Link>
      </div>

      <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-6 lg:items-start">
        <CampaignTable />
        <div className="mt-6 lg:mt-0">
          <NotificationCenterPreview />
        </div>
      </div>
    </div>
  );
}
