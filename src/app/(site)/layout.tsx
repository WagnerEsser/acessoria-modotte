import type { ReactNode } from "react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { WhatsAppBubble } from "@/components/layout/whatsapp-bubble";
import { JsonLd } from "@/components/seo/json-ld";
import { getPublicSiteSettings } from "@/lib/public-content";
import {
  buildOrganizationStructuredData,
  buildWebsiteStructuredData,
} from "@/lib/structured-data";

export default async function SiteLayout({
  children,
}: {
  children: ReactNode;
}) {
  const siteSettings = await getPublicSiteSettings();

  return (
    <div className="flex min-h-dvh flex-col">
      <JsonLd
        data={[
          buildOrganizationStructuredData(siteSettings),
          buildWebsiteStructuredData(siteSettings),
        ]}
      />
      <SiteHeader
        showBlogNavigation={siteSettings.showBlogNavigation}
        showAreasNavigation={siteSettings.showAreasNavigation}
      />
      <main className="flex-1">{children}</main>
      <SiteFooter siteSettings={siteSettings} />
      <WhatsAppBubble whatsappNumber={siteSettings.whatsappNumber} />
    </div>
  );
}
