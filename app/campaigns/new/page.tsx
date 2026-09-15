import { CampaignBuilderWizard } from "@/components/CampaignBuilderWizard";

export default function NewCampaignPage() {
  return (
    <div className="p-5 sm:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">New campaign</h1>
        <p className="text-sm text-gray-500 mt-1">
          Build a push notification campaign in a few steps, with a live preview as you go.
        </p>
      </div>
      <CampaignBuilderWizard />
    </div>
  );
}
