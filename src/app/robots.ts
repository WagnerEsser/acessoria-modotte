import type { MetadataRoute } from "next";

import { absoluteSiteUrl, siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/api", "/api/"],
      },
    ],
    sitemap: absoluteSiteUrl("/sitemap.xml"),
    host: siteUrl,
  };
}
