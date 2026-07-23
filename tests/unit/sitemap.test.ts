import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/public-content", () => ({
  getPublicBlogPosts: vi.fn(),
  getPublicNeighborhoods: vi.fn(),
  getPublicPageBySlug: vi.fn(),
  getPublicPages: vi.fn(),
  getPublicProperties: vi.fn(),
}));

import sitemap from "@/app/sitemap";
import {
  getPublicBlogPosts,
  getPublicNeighborhoods,
  getPublicPageBySlug,
  getPublicPages,
  getPublicProperties,
} from "@/lib/public-content";
import { absoluteSiteUrl } from "@/lib/site";

const mockGetPublicBlogPosts = vi.mocked(getPublicBlogPosts);
const mockGetPublicNeighborhoods = vi.mocked(getPublicNeighborhoods);
const mockGetPublicPageBySlug = vi.mocked(getPublicPageBySlug);
const mockGetPublicPages = vi.mocked(getPublicPages);
const mockGetPublicProperties = vi.mocked(getPublicProperties);

describe("sitemap", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockGetPublicProperties.mockResolvedValue([]);
    mockGetPublicNeighborhoods.mockResolvedValue([]);
    mockGetPublicBlogPosts.mockResolvedValue([]);
    mockGetPublicPageBySlug.mockResolvedValue(null);
    mockGetPublicPages.mockResolvedValue([]);
  });

  it("includes only published content returned by the public repositories", async () => {
    mockGetPublicProperties.mockResolvedValue([
      {
        slug: "apartamento-centro",
        type: "Apartamento",
        city: "São Paulo",
        updatedAt: "2026-07-20T12:00:00.000Z",
      } as never,
    ]);
    mockGetPublicNeighborhoods.mockResolvedValue([
      {
        slug: "centro",
        updatedAt: "2026-07-18T12:00:00.000Z",
      } as never,
    ]);
    mockGetPublicBlogPosts.mockResolvedValue([
      {
        slug: "como-comprar",
        updatedAt: "2026-07-19T12:00:00.000Z",
        publishedAt: "2026-07-10T12:00:00.000Z",
      } as never,
    ]);
    mockGetPublicPages.mockResolvedValue([
      {
        slug: "home",
        updatedAt: "2026-07-17T12:00:00.000Z",
      } as never,
      {
        slug: "sobre",
        updatedAt: "2026-07-16T12:00:00.000Z",
      } as never,
      {
        slug: "pagina-sem-rota-publica",
        updatedAt: "2026-07-15T12:00:00.000Z",
      } as never,
    ]);
    mockGetPublicPageBySlug.mockResolvedValue({
      slug: "servicos",
      updatedAt: "2026-07-16T12:00:00.000Z",
      blocks: [
        {
          blockKey: "assessoria-de-compra",
        },
      ],
    } as never);

    const result = await sitemap();
    const urls = result.map((entry) => entry.url);

    expect(urls).toEqual([
      absoluteSiteUrl("/"),
      absoluteSiteUrl("/imoveis"),
      absoluteSiteUrl("/areas"),
      absoluteSiteUrl("/blog"),
      absoluteSiteUrl("/sobre"),
      absoluteSiteUrl("/servicos/assessoria-de-compra"),
      absoluteSiteUrl("/imoveis/tipo/apartamento"),
      absoluteSiteUrl("/imoveis/cidade/sao-paulo"),
      absoluteSiteUrl("/imoveis/apartamento-centro"),
      absoluteSiteUrl("/areas/centro"),
      absoluteSiteUrl("/blog/como-comprar"),
    ]);
    expect(urls).not.toContain(absoluteSiteUrl("/pagina-sem-rota-publica"));
  });

  it("uses real update dates and does not invent a current timestamp", async () => {
    mockGetPublicProperties.mockResolvedValue([
      { slug: "antigo", updatedAt: "2026-06-01T12:00:00.000Z" } as never,
      { slug: "novo", updatedAt: "2026-07-20T12:00:00.000Z" } as never,
    ]);

    const result = await sitemap();
    const propertyIndex = result.find((entry) => entry.url === absoluteSiteUrl("/imoveis"));
    const home = result.find((entry) => entry.url === absoluteSiteUrl("/"));

    expect(propertyIndex?.lastModified).toEqual(new Date("2026-07-20T12:00:00.000Z"));
    expect(home?.lastModified).toBeUndefined();
  });

  it("deduplicates property type and city landing pages", async () => {
    mockGetPublicProperties.mockResolvedValue([
      {
        slug: "apartamento-um",
        type: "Apartamento",
        city: "São Paulo",
        updatedAt: "2026-06-01T12:00:00.000Z",
      } as never,
      {
        slug: "apartamento-dois",
        type: "apartamento",
        city: "São Paulo",
        updatedAt: "2026-07-20T12:00:00.000Z",
      } as never,
    ]);

    const result = await sitemap();
    const typeRoutes = result.filter((entry) => entry.url.includes("/imoveis/tipo/"));
    const cityRoutes = result.filter((entry) => entry.url.includes("/imoveis/cidade/"));

    expect(typeRoutes).toHaveLength(1);
    expect(cityRoutes).toHaveLength(1);
    expect(typeRoutes[0]?.lastModified).toEqual(new Date("2026-07-20T12:00:00.000Z"));
    expect(cityRoutes[0]?.lastModified).toEqual(new Date("2026-07-20T12:00:00.000Z"));
  });

  it("omits invalid dates instead of emitting malformed sitemap values", async () => {
    mockGetPublicBlogPosts.mockResolvedValue([
      {
        slug: "sem-data-valida",
        updatedAt: "data-invalida",
        publishedAt: null,
      } as never,
    ]);

    const result = await sitemap();
    const post = result.find(
      (entry) => entry.url === absoluteSiteUrl("/blog/sem-data-valida")
    );

    expect(post?.lastModified).toBeUndefined();
  });
});
