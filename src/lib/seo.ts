import type { Metadata } from "next";

import { brand } from "@/lib/brand";
import { siteUrl } from "@/lib/site";

type BuildMetadataOptions = {
  title: string;
  description: string;
  path?: string;
  noIndex?: boolean;
};

export function buildMetadata({
  title,
  description,
  path = "/",
  noIndex = false,
}: BuildMetadataOptions): Metadata {
  const canonical = new URL(path, siteUrl).toString();

  return {
    title,
    description,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical,
    },
    openGraph: {
      title: `${title} | ${brand.name}`,
      description,
      url: canonical,
      siteName: brand.name,
      type: "website",
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
        },
  };
}
