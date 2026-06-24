import type { PublicPropertyCard } from "@/lib/public-content";

export const PROPERTY_PAGE_SIZE = 10;

export type PropertyCatalogFilters = {
  type?: string;
  neighborhoodSlug?: string;
  featuredOnly?: boolean;
};

export type PaginatedProperties = {
  items: PublicPropertyCard[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
};

export function getPropertyTypes(properties: PublicPropertyCard[]) {
  return Array.from(new Set(properties.map((property) => property.type))).sort((left, right) =>
    left.localeCompare(right, "pt-BR")
  );
}

export function filterProperties(
  properties: PublicPropertyCard[],
  filters: PropertyCatalogFilters = {}
) {
  return properties.filter((property) => {
    if (filters.featuredOnly && !property.featured) {
      return false;
    }

    if (filters.type && property.type !== filters.type) {
      return false;
    }

    if (filters.neighborhoodSlug && property.neighborhoodSlug !== filters.neighborhoodSlug) {
      return false;
    }

    return true;
  });
}

export function paginateProperties(
  properties: PublicPropertyCard[],
  currentPageInput = 1,
  pageSize = PROPERTY_PAGE_SIZE
): PaginatedProperties {
  const totalItems = properties.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(Math.max(currentPageInput, 1), totalPages);
  const startIndex = (currentPage - 1) * pageSize;

  return {
    items: properties.slice(startIndex, startIndex + pageSize),
    currentPage,
    totalPages,
    totalItems,
  };
}

export function parsePositiveInteger(value: string | string[] | undefined, fallback = 1) {
  const raw = Array.isArray(value) ? value[0] : value;

  if (!raw) {
    return fallback;
  }

  const parsed = Number.parseInt(raw, 10);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}
