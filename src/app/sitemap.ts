import type { MetadataRoute } from "next";

import { publicNavigation } from "@/lib/navigation";
import {
  featuredProperties,
  neighborhoods,
  blogPosts,
} from "@/lib/site-data";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = publicNavigation.map((item) => ({
    url: new URL(item.href, siteUrl).toString(),
    lastModified: new Date(),
    changeFrequency: item.href === "/" ? ("weekly" as const) : ("monthly" as const),
    priority: item.href === "/" ? 1 : 0.8,
  }));

  const propertyRoutes = featuredProperties.map((property) => ({
    url: new URL(`/imoveis/${property.slug}`, siteUrl).toString(),
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const neighborhoodRoutes = neighborhoods.map((neighborhood) => ({
    url: new URL(`/areas/${neighborhood.slug}`, siteUrl).toString(),
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const blogRoutes = blogPosts.map((post) => ({
    url: new URL(`/blog/${post.slug}`, siteUrl).toString(),
    lastModified: new Date(post.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [...staticRoutes, ...propertyRoutes, ...neighborhoodRoutes, ...blogRoutes];
}
