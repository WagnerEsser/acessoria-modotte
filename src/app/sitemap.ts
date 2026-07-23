import type { MetadataRoute } from "next";

import {
  getPublicBlogPosts,
  getPublicNeighborhoods,
  getPublicPageBySlug,
  getPublicPages,
  getPublicProperties,
} from "@/lib/public-content";
import { slugify } from "@/lib/form-utils";
import { absoluteSiteUrl } from "@/lib/site";

export const revalidate = 3600;

const publicPagePaths: Record<string, string> = {
  avaliacao: "/avaliacao",
  contato: "/contato",
  "quero-vender": "/quero-vender",
  servicos: "/servicos",
  sobre: "/sobre",
};

function validDate(value: string | null | undefined) {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? undefined : date;
}

function latestDate(values: Array<string | null | undefined>) {
  return values.reduce<Date | undefined>((latest, value) => {
    const date = validDate(value);

    return !date || (latest && latest >= date) ? latest : date;
  }, undefined);
}

function propertyFacetRoutes(
  properties: Array<{
    type?: string | null;
    city?: string | null;
    updatedAt: string;
  }>,
  field: "type" | "city",
  pathPrefix: "/imoveis/tipo" | "/imoveis/cidade"
): MetadataRoute.Sitemap {
  const facets = new Map<string, Date | undefined>();

  for (const property of properties) {
    const slug = slugify(property[field] ?? "");

    if (!slug) {
      continue;
    }

    const updatedAt = validDate(property.updatedAt);
    const currentDate = facets.get(slug);

    if (!facets.has(slug) || (updatedAt && (!currentDate || updatedAt > currentDate))) {
      facets.set(slug, updatedAt);
    }
  }

  return Array.from(facets, ([slug, lastModified]) => ({
    url: absoluteSiteUrl(`${pathPrefix}/${slug}`),
    lastModified,
    changeFrequency: "weekly",
    priority: 0.7,
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [properties, neighborhoods, blogPosts, pages, servicesPage] = await Promise.all([
    getPublicProperties(),
    getPublicNeighborhoods(),
    getPublicBlogPosts(),
    getPublicPages(),
    getPublicPageBySlug("servicos"),
  ]);

  const homePage = pages.find((page) => page.slug === "home");
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: absoluteSiteUrl("/"),
      lastModified: validDate(homePage?.updatedAt),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteSiteUrl("/imoveis"),
      lastModified: latestDate(properties.map((property) => property.updatedAt)),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: absoluteSiteUrl("/areas"),
      lastModified: latestDate(neighborhoods.map((neighborhood) => neighborhood.updatedAt)),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: absoluteSiteUrl("/blog"),
      lastModified: latestDate(blogPosts.map((post) => post.updatedAt)),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    ...pages
      .filter((page) => publicPagePaths[page.slug])
      .map((page) => ({
        url: absoluteSiteUrl(publicPagePaths[page.slug]),
        lastModified: validDate(page.updatedAt),
        changeFrequency: "monthly" as const,
        priority: 0.7,
      })),
  ];

  const propertyRoutes = properties.map((property) => ({
    url: absoluteSiteUrl(`/imoveis/${property.slug}`),
    lastModified: validDate(property.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));
  const propertyTypeRoutes = propertyFacetRoutes(properties, "type", "/imoveis/tipo");
  const propertyCityRoutes = propertyFacetRoutes(properties, "city", "/imoveis/cidade");

  const neighborhoodRoutes = neighborhoods.map((neighborhood) => ({
    url: absoluteSiteUrl(`/areas/${neighborhood.slug}`),
    lastModified: validDate(neighborhood.updatedAt),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const blogRoutes = blogPosts.map((post) => ({
    url: absoluteSiteUrl(`/blog/${post.slug}`),
    lastModified: validDate(post.updatedAt ?? post.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));
  const serviceRoutes: MetadataRoute.Sitemap = Array.from(
    new Set(
      (servicesPage?.blocks ?? [])
        .map((block) => block.blockKey.trim())
        .filter(Boolean)
    ),
    (blockKey) => ({
      url: absoluteSiteUrl(`/servicos/${blockKey}`),
      lastModified: validDate(servicesPage?.updatedAt),
      changeFrequency: "monthly",
      priority: 0.7,
    })
  );

  return [
    ...staticRoutes,
    ...serviceRoutes,
    ...propertyTypeRoutes,
    ...propertyCityRoutes,
    ...propertyRoutes,
    ...neighborhoodRoutes,
    ...blogRoutes,
  ];
}
