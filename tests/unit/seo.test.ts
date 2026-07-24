import { describe, expect, it } from "vitest";

import robots from "@/app/robots";
import { brand } from "@/lib/brand";
import { buildMetadata, formatMetadataTitle } from "@/lib/seo";
import { absoluteSiteUrl, normalizeSiteUrl, siteUrl } from "@/lib/site";

describe("site URL", () => {
  it("normalizes SITE_URL to a single origin", () => {
    expect(normalizeSiteUrl(" https://www.example.com/path/?ref=test ")).toBe(
      "https://www.example.com"
    );
  });

  it("rejects protocols that cannot be canonical website origins", () => {
    expect(() => normalizeSiteUrl("ftp://www.example.com")).toThrow(
      "SITE_URL deve usar o protocolo http ou https."
    );
  });

  it("requires SITE_URL instead of falling back to a duplicated domain", () => {
    expect(() => normalizeSiteUrl(" ")).toThrow("SITE_URL precisa estar configurada.");
  });

  it("builds absolute URLs from the centralized origin", () => {
    expect(absoluteSiteUrl("/imoveis/casa-teste")).toBe(
      `${siteUrl}/imoveis/casa-teste`
    );
  });
});

describe("SEO metadata", () => {
  it("adds the brand once and publishes canonical, Open Graph and Twitter metadata", () => {
    const metadata = buildMetadata({
      title: "Imóveis",
      description: "Imóveis selecionados pela assessoria.",
      path: "/imoveis",
    });

    expect(metadata.title).toEqual({ absolute: `Imóveis | ${brand.name}` });
    expect(metadata.alternates).toEqual({
      canonical: absoluteSiteUrl("/imoveis"),
    });
    expect(metadata.openGraph).toMatchObject({
      title: `Imóveis | ${brand.name}`,
      description: "Imóveis selecionados pela assessoria.",
      url: absoluteSiteUrl("/imoveis"),
      locale: "pt_BR",
      siteName: brand.name,
      type: "website",
      images: [
        {
          url: absoluteSiteUrl("/brand/lm-monogram-header.png"),
          alt: "Monograma LM da Luana Modotte Assessoria Imobiliária",
        },
      ],
    });
    expect(metadata.twitter).toMatchObject({
      card: "summary_large_image",
      title: `Imóveis | ${brand.name}`,
      images: [
        {
          url: absoluteSiteUrl("/brand/lm-monogram-header.png"),
          alt: "Monograma LM da Luana Modotte Assessoria Imobiliária",
        },
      ],
    });
  });

  it("does not duplicate the brand in titles that already include it", () => {
    const title = `${brand.name} | ${brand.subtitle}`;

    expect(formatMetadataTitle(title)).toBe(title);
    expect(buildMetadata({ title, description: brand.slogan }).title).toEqual({
      absolute: title,
    });
  });

  it("supports article dates, custom social images and noindex", () => {
    const metadata = buildMetadata({
      title: "Guia de compra",
      description: "Como comprar um imóvel com segurança.",
      path: "/blog/guia-de-compra",
      image: "https://cdn.example.com/guia.jpg",
      imageAlt: "Sala de estar iluminada",
      type: "article",
      publishedTime: "2026-07-01T10:00:00.000Z",
      modifiedTime: "2026-07-20T15:00:00.000Z",
      noIndex: true,
    });

    expect(metadata.openGraph).toMatchObject({
      type: "article",
      publishedTime: "2026-07-01T10:00:00.000Z",
      modifiedTime: "2026-07-20T15:00:00.000Z",
      images: [
        {
          url: "https://cdn.example.com/guia.jpg",
          alt: "Sala de estar iluminada",
        },
      ],
    });
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
});

describe("robots", () => {
  it("allows the public site and blocks administrative and API routes", () => {
    expect(robots()).toEqual({
      rules: [
        {
          userAgent: "*",
          allow: "/",
          disallow: ["/admin", "/admin/", "/api", "/api/"],
        },
      ],
      sitemap: absoluteSiteUrl("/sitemap.xml"),
      host: siteUrl,
    });
  });
});
