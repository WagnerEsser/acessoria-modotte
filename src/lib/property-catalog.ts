import type { PropertyListing } from "@/lib/site-data";

export const PROPERTY_PAGE_SIZE = 10;

export type PropertyCatalogFilters = {
  type?: string;
  featuredOnly?: boolean;
};

export type PaginatedProperties = {
  items: PropertyListing[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
};

export function getPropertyTypes(properties: PropertyListing[]) {
  return Array.from(new Set(properties.map((property) => property.type)));
}

export function filterProperties(
  properties: PropertyListing[],
  filters: PropertyCatalogFilters = {}
) {
  return properties.filter((property) => {
    if (filters.featuredOnly && !property.featured) {
      return false;
    }

    if (filters.type && property.type !== filters.type) {
      return false;
    }

    return true;
  });
}

export function paginateProperties(
  properties: PropertyListing[],
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
