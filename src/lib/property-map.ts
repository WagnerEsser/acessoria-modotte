import type { PublicPropertyCard } from "@/lib/public-content";

export type PublicPropertyMapItem = {
  slug: string;
  title: string;
  type: string;
  price: string;
  location: string | null;
  city: string | null;
  state: string | null;
  address: string | null;
  href: string;
  coverImageUrl: string | null;
  coverImageAlt: string | null;
  latitude: number | null;
  longitude: number | null;
  geocodeQuery: string | null;
};

function normalizeMapText(value: string | null | undefined) {
  const text = value?.trim();

  return text && text.length ? text : null;
}

function isPropertyForSale(property: PublicPropertyCard) {
  return property.transactionType === "sale" || property.transactionType === "both";
}

function buildGeocodeQuery(property: PublicPropertyCard) {
  return [
    property.address,
    property.location,
    property.city,
    property.state,
    property.zipCode,
    "Brasil",
  ]
    .map(normalizeMapText)
    .filter(Boolean)
    .join(", ");
}

export function getPropertyMapItems(properties: PublicPropertyCard[]) {
  return properties
    .filter((property) => isPropertyForSale(property))
    .filter((property) => property.showMap !== false)
    .map((property): PublicPropertyMapItem | null => {
      const hasCoordinates =
        property.latitude !== null && property.longitude !== null;
      const geocodeQuery = hasCoordinates ? null : buildGeocodeQuery(property);

      if (!hasCoordinates && !geocodeQuery) {
        return null;
      }

      return {
        slug: property.slug,
        title: property.title,
        type: property.type,
        price: property.price,
        location: property.location,
        city: property.city,
        state: property.state,
        address: property.address,
        href: `/imoveis/${property.slug}`,
        coverImageUrl: property.coverImageUrl,
        coverImageAlt: property.coverImageAlt,
        latitude: property.latitude,
        longitude: property.longitude,
        geocodeQuery,
      };
    })
    .filter((property): property is PublicPropertyMapItem => Boolean(property));
}
