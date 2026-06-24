import type { ReactNode } from "react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { WhatsAppBubble } from "@/components/layout/whatsapp-bubble";
import { getPublicSiteSettings } from "@/lib/public-content";

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const siteSettings = await getPublicSiteSettings();

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter siteSettings={siteSettings} />
      <WhatsAppBubble whatsappNumber={siteSettings.whatsappNumber} />
    </div>
  );
}
