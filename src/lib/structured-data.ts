import type {
  PublicBlogPost,
  PublicPropertyDetail,
  PublicSiteSettings,
} from "@/lib/public-content";
import { siteUrl } from "@/lib/site";

type BreadcrumbItem = {
  name: string;
  path: string;
};

function absoluteUrl(path: string) {
  return new URL(path, siteUrl).toString();
}

function getPropertySchemaType(propertyType: string) {
  const normalized = propertyType.toLocaleLowerCase("pt-BR");

  if (normalized.includes("apartamento")) {
    return "Apartment";
  }

  if (normalized.includes("casa")) {
    return "House";
  }

  return "Residence";
}

function parseArea(value: string | null) {
  if (!value) {
    return null;
  }

  const parsed = Number(value.replace(",", ".").replace(/[^\d.]/g, ""));

  return Number.isFinite(parsed) ? parsed : null;
}

export function buildOrganizationStructuredData(settings: PublicSiteSettings) {
  const address =
    settings.address || settings.city || settings.state
      ? {
          "@type": "PostalAddress",
          ...(settings.address ? { streetAddress: settings.address } : {}),
          ...(settings.city ? { addressLocality: settings.city } : {}),
          ...(settings.state ? { addressRegion: settings.state } : {}),
          addressCountry: "BR",
        }
      : undefined;
  const sameAs = Object.values(settings.socialLinks).filter((value) =>
    /^https?:\/\//i.test(value)
  );

  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "@id": absoluteUrl("/#organization"),
    name: settings.companyName,
    alternateName: settings.brandName,
    url: siteUrl,
    description: settings.defaultSeoDescription,
    ...(settings.logoUrl ? { logo: absoluteUrl(settings.logoUrl) } : {}),
    ...(settings.primaryPhone ? { telephone: settings.primaryPhone } : {}),
    ...(settings.email ? { email: settings.email } : {}),
    ...(address ? { address } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };
}

export function buildWebsiteStructuredData(settings: PublicSiteSettings) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": absoluteUrl("/#website"),
    url: siteUrl,
    name: settings.brandName,
    description: settings.defaultSeoDescription,
    inLanguage: "pt-BR",
    publisher: {
      "@id": absoluteUrl("/#organization"),
    },
  };
}

export function buildBreadcrumbStructuredData(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function buildPropertyStructuredData(property: PublicPropertyDetail) {
  const area = parseArea(property.areaUseful ?? property.areaTotal);
  const locality = property.neighborhoodCity ?? property.city;
  const region = property.neighborhoodState ?? property.state;
  const address =
    property.address || locality || region
      ? {
          "@type": "PostalAddress",
          ...(property.address ? { streetAddress: property.address } : {}),
          ...(property.neighborhoodName
            ? { addressLocality: property.neighborhoodName }
            : locality
              ? { addressLocality: locality }
              : {}),
          ...(region ? { addressRegion: region } : {}),
          ...(property.zipCode ? { postalCode: property.zipCode } : {}),
          addressCountry: "BR",
        }
      : undefined;
  const offer =
    !property.priceOnRequest && property.priceValue !== null
      ? {
          "@type": "Offer",
          url: absoluteUrl(`/imoveis/${property.slug}`),
          price: property.priceValue,
          priceCurrency: "BRL",
          availability:
            property.status === "sold"
              ? "https://schema.org/SoldOut"
              : "https://schema.org/InStock",
        }
      : undefined;

  return {
    "@context": "https://schema.org",
    "@type": getPropertySchemaType(property.type),
    "@id": absoluteUrl(`/imoveis/${property.slug}#property`),
    url: absoluteUrl(`/imoveis/${property.slug}`),
    name: property.title,
    description: property.seoDescription ?? property.summary ?? property.description,
    ...(property.images.length
      ? { image: property.images.map((image) => absoluteUrl(image.url)) }
      : property.coverImageUrl
        ? { image: [absoluteUrl(property.coverImageUrl)] }
        : {}),
    ...(address ? { address } : {}),
    ...(property.latitude !== null && property.longitude !== null
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: property.latitude,
            longitude: property.longitude,
          },
        }
      : {}),
    ...(area !== null
      ? {
          floorSize: {
            "@type": "QuantitativeValue",
            value: area,
            unitCode: "MTK",
          },
        }
      : {}),
    ...(property.bedrooms !== null ? { numberOfBedrooms: property.bedrooms } : {}),
    ...(property.bathrooms !== null
      ? { numberOfBathroomsTotal: property.bathrooms }
      : {}),
    ...(offer ? { offers: offer } : {}),
  };
}

export function buildArticleStructuredData(post: PublicBlogPost) {
  const image = post.ogImageUrl ?? post.coverImageUrl;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": absoluteUrl(`/blog/${post.slug}#article`),
    url: absoluteUrl(`/blog/${post.slug}`),
    headline: post.title,
    description: post.seoDescription ?? post.excerpt,
    inLanguage: "pt-BR",
    ...(image ? { image: [absoluteUrl(image)] } : {}),
    ...(post.publishedAt ? { datePublished: post.publishedAt } : {}),
    dateModified: post.updatedAt,
    author: {
      "@id": absoluteUrl("/#organization"),
    },
    publisher: {
      "@id": absoluteUrl("/#organization"),
    },
  };
}
