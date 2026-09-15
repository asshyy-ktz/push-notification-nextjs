"use client";

import { useCampaignStore } from "@/store/campaignStore";

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const PLATFORM_ICON: Record<string, string> = { ios: "🍎", android: "🤖", web: "🌐" };

export function NotificationCenterPreview() {
  const notifications = useCampaignStore((s) => s.sentNotifications);

  return (
    <div className="card">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900 text-sm">Notification center</h3>
        <span className="badge bg-gray-100 text-gray-600">{notifications.length} recent</span>
      </div>
      <div className="max-h-[420px] overflow-y-auto divide-y divide-gray-50">
        {notifications.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-gray-400">Nothing sent yet. Notifications will appear here.</p>
        )}
        {notifications.map((n) => (
          <div key={n.id} className="px-4 py-3 flex items-start gap-3 hover:bg-gray-50/70">
            <div className="h-9 w-9 rounded-lg bg-brand-100 flex items-center justify-center text-lg shrink-0">
              {n.icon}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium text-gray-500 truncate">{n.campaignName}</p>
                <span className="text-[10px] text-gray-400 shrink-0 flex items-center gap-1">
                  {PLATFORM_ICON[n.platform]} {timeAgo(n.sentAt)}
                </span>
              </div>
              <p className="text-sm font-semibold text-gray-900 truncate">{n.title}</p>
              <p className="text-xs text-gray-600 line-clamp-2">{n.body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
