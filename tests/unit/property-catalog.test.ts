import { describe, expect, it } from "vitest";

import {
  filterProperties,
  getPropertyTypes,
  paginateProperties,
  PROPERTY_PAGE_SIZE,
} from "@/lib/property-catalog";
import { featuredProperties } from "@/lib/site-data";

describe("property catalog helpers", () => {
  it("returns unique property types", () => {
    expect(getPropertyTypes(featuredProperties)).toEqual([
      "Casa",
      "Apartamento",
      "Terreno",
      "Townhouse",
    ]);
  });

  it("filters by type and featured flag", () => {
    const onlyHomes = filterProperties(featuredProperties, { type: "Casa" });
    expect(onlyHomes).toHaveLength(1);
    expect(onlyHomes[0].type).toBe("Casa");

    const onlyFeatured = filterProperties(featuredProperties, { featuredOnly: true });
    expect(onlyFeatured).toHaveLength(1);
    expect(onlyFeatured[0].featured).toBe(true);
  });

  it("paginates with the expected page size", () => {
    const paginated = paginateProperties(featuredProperties, 1, PROPERTY_PAGE_SIZE);

    expect(paginated.currentPage).toBe(1);
    expect(paginated.totalPages).toBe(1);
    expect(paginated.items).toHaveLength(featuredProperties.length);
  });
});
