import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Sidebar, MobileNav } from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Pulse — Push Notification Console",
  description: "Plan, target, and analyze push notification campaigns.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="lg:flex min-h-screen">
            <Sidebar />
            <main className="flex-1 pb-16 lg:pb-0">{children}</main>
          </div>
          <MobileNav />
        </Providers>
      </body>
    </html>
  );
}
