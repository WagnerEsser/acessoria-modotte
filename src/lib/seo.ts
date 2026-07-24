import type { Metadata } from "next";

import { brand } from "@/lib/brand";
import { absoluteSiteUrl, siteUrl } from "@/lib/site";

type BuildMetadataOptions = {
  title: string;
  description: string;
  path?: string;
  noIndex?: boolean;
  image?: string | null;
  imageAlt?: string | null;
  type?: "website" | "article";
  publishedTime?: string | null;
  modifiedTime?: string | null;
};

const defaultSocialImage = "/brand/lm-monogram-header.png";
const defaultSocialImageAlt = "Monograma LM da Luana Modotte Assessoria Imobiliária";

export function formatMetadataTitle(title: string) {
  const normalizedTitle = title.trim();
  const includesBrand = normalizedTitle.toLocaleLowerCase("pt-BR").includes(
    brand.name.toLocaleLowerCase("pt-BR")
  );

  return includesBrand ? normalizedTitle : `${normalizedTitle} | ${brand.name}`;
}

export function buildMetadata({
  title,
  description,
  path = "/",
  noIndex = false,
  image,
  imageAlt,
  type = "website",
  publishedTime,
  modifiedTime,
}: BuildMetadataOptions): Metadata {
  const canonical = absoluteSiteUrl(path);
  const metadataTitle = formatMetadataTitle(title);
  const socialImage = absoluteSiteUrl(image || defaultSocialImage);
  const socialImageAlt =
    imageAlt?.trim() || (image ? metadataTitle : defaultSocialImageAlt);
  const openGraph: Metadata["openGraph"] =
    type === "article"
      ? {
          title: metadataTitle,
          description,
          url: canonical,
          siteName: brand.name,
          locale: "pt_BR",
          type: "article",
          publishedTime: publishedTime || undefined,
          modifiedTime: modifiedTime || undefined,
          images: [{ url: socialImage, alt: socialImageAlt }],
        }
      : {
          title: metadataTitle,
          description,
          url: canonical,
          siteName: brand.name,
          locale: "pt_BR",
          type: "website",
          images: [{ url: socialImage, alt: socialImageAlt }],
        };

  return {
    title: {
      absolute: metadataTitle,
    },
    description,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical,
    },
    openGraph,
    twitter: {
      card: "summary_large_image",
      title: metadataTitle,
      description,
      images: [{ url: socialImage, alt: socialImageAlt }],
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
  };
}
