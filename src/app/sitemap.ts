import type { MetadataRoute } from "next";

import { publicNavigation } from "@/lib/navigation";
import {
  getPublicBlogPosts,
  getPublicNeighborhoods,
  getPublicProperties,
} from "@/lib/public-content";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [properties, neighborhoods, blogPosts] = await Promise.all([
    getPublicProperties(),
    getPublicNeighborhoods(),
    getPublicBlogPosts(),
  ]);

  const staticRoutes = [
    ...publicNavigation,
    { href: "/blog", label: "Blog" },
    { href: "/avaliacao", label: "Avaliação" },
  ].map((item) => ({
    url: new URL(item.href, siteUrl).toString(),
    lastModified: new Date(),
    changeFrequency: item.href === "/" ? ("weekly" as const) : ("monthly" as const),
    priority: item.href === "/" ? 1 : 0.8,
  }));

  const propertyRoutes = properties.map((property) => ({
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
    lastModified: post.publishedAt ? new Date(post.publishedAt) : new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [...staticRoutes, ...propertyRoutes, ...neighborhoodRoutes, ...blogRoutes];
}
