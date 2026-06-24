import { describe, expect, it } from "vitest";

import {
  filterProperties,
  getPropertyTypes,
  paginateProperties,
  PROPERTY_PAGE_SIZE,
} from "@/lib/property-catalog";
import type { PublicPropertyCard } from "@/lib/public-content";

function createProperty(overrides: Partial<PublicPropertyCard>): PublicPropertyCard {
  return {
    slug: "imovel-base",
    title: "Imóvel base",
    type: "Casa",
    transactionType: "sale",
    location: "Centro",
    city: "Balneário Camboriú",
    neighborhoodSlug: "centro",
    price: "R$ 1.500.000",
    summary: "Resumo base.",
    size: "180 m²",
    bedrooms: 3,
    bathrooms: 2,
    garages: 2,
    featured: false,
    accent: "from-brand-navy via-brand-navy-deep to-brand-taupe/50",
    highlights: [],
    coverImageUrl: null,
    coverImageAlt: null,
    ...overrides,
  };
}

const sampleProperties = [
  createProperty({
    slug: "casa",
    type: "Casa",
    featured: true,
  }),
  createProperty({
    slug: "apartamento",
    type: "Apartamento",
    neighborhoodSlug: "barra-sul",
  }),
  createProperty({
    slug: "terreno",
    type: "Terreno",
    neighborhoodSlug: "nações",
  }),
  createProperty({
    slug: "townhouse",
    type: "Townhouse",
    neighborhoodSlug: "centro",
  }),
];

describe("property catalog helpers", () => {
  it("returns unique property types", () => {
    expect(getPropertyTypes(sampleProperties)).toEqual([
      "Apartamento",
      "Casa",
      "Terreno",
      "Townhouse",
    ]);
  });

  it("filters by type, neighborhood and featured flag", () => {
    const onlyHomes = filterProperties(sampleProperties, { type: "Casa" });
    expect(onlyHomes).toHaveLength(1);
    expect(onlyHomes[0].type).toBe("Casa");

    const onlyCentro = filterProperties(sampleProperties, { neighborhoodSlug: "centro" });
    expect(onlyCentro).toHaveLength(2);
    expect(onlyCentro.every((property) => property.neighborhoodSlug === "centro")).toBe(true);

    const onlyFeatured = filterProperties(sampleProperties, { featuredOnly: true });
    expect(onlyFeatured).toHaveLength(1);
    expect(onlyFeatured[0].featured).toBe(true);
  });

  it("paginates with the expected page size", () => {
    const paginated = paginateProperties(sampleProperties, 1, PROPERTY_PAGE_SIZE);

    expect(paginated.currentPage).toBe(1);
    expect(paginated.totalPages).toBe(1);
    expect(paginated.items).toHaveLength(sampleProperties.length);
  });
});
