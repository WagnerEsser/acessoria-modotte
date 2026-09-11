import { describe, expect, it } from "vitest";

import { getPropertyMapItems } from "@/lib/property-map";
import type { PublicPropertyCard } from "@/lib/public-content";

function createProperty(overrides: Partial<PublicPropertyCard>): PublicPropertyCard {
  return {
    slug: "imovel-base",
    title: "Imóvel base",
    type: "Apartamento",
    transactionType: "sale",
    location: "Centro",
    city: "Balneário Camboriú",
    state: "SC",
    address: null,
    zipCode: null,
    latitude: null,
    longitude: null,
    neighborhoodSlug: "centro",
    status: "published",
    price: "R$ 1.500.000",
    priceValue: 1500000,
    priceOnRequest: false,
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
    coverImageWidth: null,
    coverImageHeight: null,
    seoTitle: null,
    seoDescription: null,
    updatedAt: "2026-07-23T00:00:00.000Z",
    showFullAddress: false,
    showMap: true,
    ...overrides,
  };
}

describe("property map helpers", () => {
  it("keeps sale properties with coordinates", () => {
    const items = getPropertyMapItems([
      createProperty({
        latitude: -26.3044,
        longitude: -48.8487,
        address: "Rua Fernando Drefahl, 158",
        showFullAddress: true,
      }),
    ]);

    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      slug: "imovel-base",
      latitude: -26.3044,
      longitude: -48.8487,
      geocodeQuery: null,
    });
  });

  it("uses address geocoding for sale properties without coordinates", () => {
    const items = getPropertyMapItems([
      createProperty({
        address: "Rua 1500, 100",
        zipCode: "88330-000",
        showFullAddress: true,
      }),
    ]);

    expect(items[0].geocodeQuery).toBe(
      "Rua 1500, 100, Centro, Balneário Camboriú, SC, 88330-000, Brasil",
    );
  });

  it("ignores rentals and properties with map disabled", () => {
    const items = getPropertyMapItems([
      createProperty({ slug: "locacao", transactionType: "rent" }),
      createProperty({ slug: "sem-mapa", showMap: false }),
      createProperty({ slug: "venda-e-locacao", transactionType: "both" }),
    ]);

    expect(items.map((item) => item.slug)).toEqual(["venda-e-locacao"]);
  });
});
