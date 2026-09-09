import type { ReactNode } from "react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { WhatsAppBubble } from "@/components/layout/whatsapp-bubble";
import { JsonLd } from "@/components/seo/json-ld";
import { getPublicPages, getPublicSiteSettings } from "@/lib/public-content";
import {
  buildOrganizationStructuredData,
  buildWebsiteStructuredData,
} from "@/lib/structured-data";

export default async function SiteLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [siteSettings, publicPages] = await Promise.all([
    getPublicSiteSettings(),
    getPublicPages(),
  ]);
  const publishedSlugs = new Set(publicPages.map((page) => page.slug));
  const navigationVisibility = {
    showAreasNavigation: publishedSlugs.has("areas"),
    showServicesNavigation: publishedSlugs.has("servicos"),
    showSellNavigation: publishedSlugs.has("quero-vender"),
    showAboutNavigation: publishedSlugs.has("sobre"),
    showPropertiesNavigation: publishedSlugs.has("imoveis"),
    showContactNavigation: publishedSlugs.has("contato"),
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <JsonLd
        data={[
          buildOrganizationStructuredData(siteSettings),
          buildWebsiteStructuredData(siteSettings),
        ]}
      />
      <SiteHeader
        {...navigationVisibility}
      />
      <main className="flex-1">{children}</main>
      <SiteFooter siteSettings={siteSettings} navigationVisibility={navigationVisibility} />
      <WhatsAppBubble whatsappNumber={siteSettings.whatsappNumber} />
    </div>
  );
}
