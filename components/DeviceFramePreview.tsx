"use client";

interface DeviceFramePreviewProps {
  title: string;
  body: string;
  icon: string;
  appName?: string;
  platform?: "ios" | "android" | "web";
}

export function DeviceFramePreview({
  title,
  body,
  icon,
  appName = "Pulse",
  platform = "ios",
}: DeviceFramePreviewProps) {
  return (
    <div className="mx-auto w-[280px]">
      <div className="relative rounded-[2.25rem] border-8 border-gray-900 bg-gray-900 shadow-xl overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-6 flex items-center justify-center z-10">
          <div className="h-4 w-24 rounded-full bg-gray-900" />
        </div>
        <div className="bg-gradient-to-b from-brand-500 to-brand-700 h-[520px] pt-9 px-2.5">
          <div className="text-center text-white/80 text-[11px] font-medium mb-2">
            {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
          <div className="rounded-2xl bg-white/95 backdrop-blur px-3 py-2.5 shadow-lg animate-in">
            <div className="flex items-start gap-2.5">
              <div className="h-9 w-9 rounded-lg bg-brand-100 flex items-center justify-center text-lg shrink-0">
                {icon || "🔔"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide truncate">
                    {appName}
                  </p>
                  <p className="text-[10px] text-gray-400 shrink-0">now</p>
                </div>
                <p className="text-sm font-semibold text-gray-900 leading-snug truncate">
                  {title || "Notification title"}
                </p>
                <p className="text-xs text-gray-600 leading-snug line-clamp-2">
                  {body || "Notification body text will appear here."}
                </p>
              </div>
            </div>
          </div>
          <p className="text-center text-[10px] text-white/60 mt-3 uppercase tracking-wide">
            {platform} preview
          </p>
        </div>
      </div>
    </div>
  );
}
