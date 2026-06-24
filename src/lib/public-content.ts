import { brand } from "@/lib/brand";
import { formatCurrencyBRL } from "@/lib/formatters";
import { getWhatsAppDisplayNumber, getWhatsAppHref } from "@/lib/contact";
import { createSupabasePublicClient } from "@/lib/supabase/public";

type JsonRecord = Record<string, unknown>;

type SiteSettingsRow = {
  company_name: string;
  brand_name: string;
  legal_name: string | null;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  accent_color: string | null;
  primary_phone: string | null;
  whatsapp_number: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  social_links: JsonRecord | null;
  opening_hours: unknown[] | null;
  impact_phrase: string | null;
  default_seo_title: string | null;
  default_seo_description: string | null;
};

type NeighborhoodRow = {
  id: string;
  slug: string;
  name: string;
  city: string;
  state: string;
  intro_text: string | null;
  seo_title: string | null;
  seo_description: string | null;
  is_published: boolean;
  sort_order: number;
};

type PropertyImageRow = {
  url: string;
  alt_text: string | null;
  sort_order: number;
  is_cover: boolean;
};

type PropertyFeatureRow = {
  label: string;
  value: string | null;
  sort_order: number;
};

type PropertyNeighborhoodRow = {
  id: string;
  slug: string;
  name: string;
  city: string;
  state: string;
};

type PropertyRow = {
  id: string;
  slug: string;
  title: string;
  transaction_type: string;
  property_type: string;
  status: string;
  is_published: boolean;
  featured: boolean;
  price: number | string | null;
  price_on_request: boolean;
  description: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  latitude: number | string | null;
  longitude: number | string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  garages: number | null;
  area_total: number | string | null;
  area_useful: number | string | null;
  condominium_fee: number | string | null;
  iptu_value: number | string | null;
  built_year: number | null;
  furnished: boolean;
  contact_phone: string | null;
  contact_whatsapp: string | null;
  published_at: string | null;
  updated_at: string;
  neighborhood: PropertyNeighborhoodRow | PropertyNeighborhoodRow[] | null;
  property_images: PropertyImageRow[] | null;
  property_features: PropertyFeatureRow[] | null;
};

type BlogCategoryRow = {
  slug: string;
  name: string;
};

type BlogPostRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body: string | null;
  cover_image_url: string | null;
  is_published: boolean;
  seo_title: string | null;
  seo_description: string | null;
  og_image_url: string | null;
  published_at: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  category: BlogCategoryRow | BlogCategoryRow[] | null;
};

type PageBlockRow = {
  id: string;
  block_key: string;
  title: string | null;
  content: string | null;
  media_url: string | null;
  sort_order: number;
  is_active: boolean;
};

type PageRow = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  body: string | null;
  page_type: string;
  hero_image_url: string | null;
  is_published: boolean;
  seo_title: string | null;
  seo_description: string | null;
  og_image_url: string | null;
  sort_order: number;
};

export type PublicSiteSettings = {
  companyName: string;
  brandName: string;
  legalName: string | null;
  logoUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  accentColor: string | null;
  primaryPhone: string | null;
  whatsappNumber: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  socialLinks: Record<string, string>;
  openingHours: string[];
  impactPhrase: string;
  defaultSeoTitle: string;
  defaultSeoDescription: string;
};

export type PublicPropertyImage = {
  url: string;
  altText: string | null;
  sortOrder: number;
  isCover: boolean;
};

export type PublicPropertyFeature = {
  label: string;
  value: string | null;
  sortOrder: number;
};

export type PublicPropertyCard = {
  slug: string;
  title: string;
  type: string;
  transactionType: string;
  location: string | null;
  city: string | null;
  neighborhoodSlug: string | null;
  price: string;
  summary: string | null;
  size: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  garages: number | null;
  featured: boolean;
  accent: string;
  highlights: string[];
  coverImageUrl: string | null;
  coverImageAlt: string | null;
};

export type PublicPropertyDetail = PublicPropertyCard & {
  description: string | null;
  address: string | null;
  state: string | null;
  zipCode: string | null;
  latitude: number | null;
  longitude: number | null;
  areaTotal: string | null;
  areaUseful: string | null;
  condominiumFee: string | null;
  iptuValue: string | null;
  builtYear: number | null;
  furnished: boolean;
  contactPhone: string | null;
  contactWhatsapp: string | null;
  publishedAt: string | null;
  neighborhoodSlug: string | null;
  neighborhoodName: string | null;
  neighborhoodCity: string | null;
  neighborhoodState: string | null;
  images: PublicPropertyImage[];
  features: PublicPropertyFeature[];
};

export type PublicBlogCard = {
  slug: string;
  title: string;
  excerpt: string | null;
  category: string | null;
  readingTime: string;
  publishedAt: string | null;
  summary: string[];
  coverImageUrl: string | null;
};

export type PublicBlogPost = PublicBlogCard & {
  body: string | null;
};

export type PublicNeighborhood = {
  slug: string;
  name: string;
  city: string;
  state: string;
  description: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  propertyCount: number;
};

export type PublicPageBlock = {
  id: string;
  blockKey: string;
  title: string | null;
  content: string | null;
  mediaUrl: string | null;
  sortOrder: number;
};

export type PublicPageContent = {
  slug: string;
  title: string;
  subtitle: string | null;
  body: string | null;
  pageType: string;
  heroImageUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  ogImageUrl: string | null;
  isPublished: boolean;
  blocks: PublicPageBlock[];
};

export type PublicContactChannel = {
  label: string;
  value: string;
  note: string;
  href: string;
};

const PROPERTY_ACCENTS = [
  "from-brand-gold/70 via-brand-beige/20 to-brand-navy-deep",
  "from-brand-navy via-brand-navy-deep to-brand-taupe/50",
  "from-brand-taupe via-brand-beige/30 to-brand-navy",
  "from-brand-gold/55 via-brand-navy-deep to-brand-ink",
];

function normalizeText(value: string | null | undefined) {
  const text = value?.trim();

  return text && text.length ? text : null;
}

function normalizeNumericText(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numericValue = typeof value === "number" ? value : Number(value);

  if (Number.isNaN(numericValue)) {
    return null;
  }

  return String(numericValue);
}

function formatArea(value: number | string | null | undefined) {
  const numericValue = normalizeNumericText(value);

  return numericValue ? `${numericValue} m²` : null;
}

function splitParagraphs(value: string | null | undefined): string[] {
  const text = normalizeText(value);

  if (!text) {
    return [];
  }

  return text
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function estimateReadingTime(value: string | null | undefined) {
  const text = normalizeText(value);

  if (!text) {
    return "1 min";
  }

  const words = text.split(/\s+/).filter(Boolean).length;

  return `${Math.max(1, Math.ceil(words / 180))} min`;
}

function hashText(value: string) {
  return Array.from(value).reduce((accumulator, character) => {
    return (accumulator * 31 + character.charCodeAt(0)) >>> 0;
  }, 0);
}

function getPropertyAccent(slug: string, featured: boolean) {
  if (featured) {
    return PROPERTY_ACCENTS[0];
  }

  return PROPERTY_ACCENTS[hashText(slug) % PROPERTY_ACCENTS.length];
}

function toArrayValue(value: unknown) {
  return Array.isArray(value) ? value : [];
}

function mapPropertyHighlights(features: PublicPropertyFeature[], property: PublicPropertyCard) {
  const highlights = features
    .map((feature) => {
      const label = normalizeText(feature.label);
      const value = normalizeText(feature.value);

      if (!label) {
        return null;
      }

      return value ? `${label}: ${value}` : label;
    })
    .filter((item): item is string => Boolean(item));

  if (highlights.length) {
    return highlights;
  }

  const fallbackHighlights: string[] = [];

  if (property.bedrooms && property.bedrooms > 0) {
    fallbackHighlights.push(`${property.bedrooms} dormitórios`);
  }

  if (property.bathrooms && property.bathrooms > 0) {
    fallbackHighlights.push(`${property.bathrooms} banheiros`);
  }

  if (property.garages && property.garages > 0) {
    fallbackHighlights.push(`${property.garages} vagas`);
  }

  return fallbackHighlights;
}

function mapPropertyImage(row: PropertyImageRow): PublicPropertyImage {
  return {
    url: row.url,
    altText: normalizeText(row.alt_text),
    sortOrder: row.sort_order,
    isCover: row.is_cover,
  };
}

function mapPropertyFeature(row: PropertyFeatureRow): PublicPropertyFeature {
  return {
    label: row.label,
    value: normalizeText(row.value),
    sortOrder: row.sort_order,
  };
}

function mapPropertyCard(row: PropertyRow, index = 0): PublicPropertyCard {
  const neighborhood = Array.isArray(row.neighborhood) ? row.neighborhood[0] ?? null : row.neighborhood;
  const images = toArrayValue(row.property_images).map(mapPropertyImage).sort((left, right) => {
    return left.sortOrder - right.sortOrder;
  });
  const features = toArrayValue(row.property_features).map(mapPropertyFeature).sort((left, right) => {
    return left.sortOrder - right.sortOrder;
  });
  const coverImage = images.find((image) => image.isCover) ?? images[0] ?? null;
  const price = row.price_on_request ? "Sob consulta" : formatCurrencyBRL(row.price);
  const card: PublicPropertyCard = {
    slug: row.slug,
    title: row.title,
    type: row.property_type,
    transactionType: row.transaction_type,
    location: normalizeText(neighborhood?.name) ?? normalizeText(row.address),
    city: normalizeText(row.city) ?? normalizeText(neighborhood?.city),
    neighborhoodSlug: normalizeText(neighborhood?.slug),
    price,
    summary: normalizeText(row.description),
    size: formatArea(row.area_useful ?? row.area_total),
    bedrooms: row.bedrooms ?? null,
    bathrooms: row.bathrooms ?? null,
    garages: row.garages ?? null,
    featured: row.featured,
    accent: getPropertyAccent(row.slug, row.featured || index === 0),
    highlights: mapPropertyHighlights(features, {
      slug: row.slug,
      title: row.title,
      type: row.property_type,
      transactionType: row.transaction_type,
      location: normalizeText(neighborhood?.name) ?? normalizeText(row.address),
      city: normalizeText(row.city) ?? normalizeText(neighborhood?.city),
      neighborhoodSlug: normalizeText(neighborhood?.slug),
      price,
      summary: normalizeText(row.description),
      size: formatArea(row.area_useful ?? row.area_total),
      bedrooms: row.bedrooms ?? null,
      bathrooms: row.bathrooms ?? null,
      garages: row.garages ?? null,
      featured: row.featured,
      accent: getPropertyAccent(row.slug, row.featured || index === 0),
      highlights: [],
      coverImageUrl: coverImage?.url ?? null,
      coverImageAlt: coverImage?.altText ?? null,
    }),
    coverImageUrl: coverImage?.url ?? null,
    coverImageAlt: coverImage?.altText ?? null,
  };

  return card;
}

function mapPropertyDetail(row: PropertyRow): PublicPropertyDetail {
  const neighborhood = Array.isArray(row.neighborhood) ? row.neighborhood[0] ?? null : row.neighborhood;
  const images = toArrayValue(row.property_images).map(mapPropertyImage).sort((left, right) => {
    if (left.isCover && !right.isCover) {
      return -1;
    }

    if (!left.isCover && right.isCover) {
      return 1;
    }

    return left.sortOrder - right.sortOrder;
  });
  const features = toArrayValue(row.property_features).map(mapPropertyFeature).sort((left, right) => {
    return left.sortOrder - right.sortOrder;
  });
  const baseCard = mapPropertyCard(row);
  const latitudeValue =
    row.latitude === null || row.latitude === undefined || row.latitude === ""
      ? null
      : Number(row.latitude);
  const longitudeValue =
    row.longitude === null || row.longitude === undefined || row.longitude === ""
      ? null
      : Number(row.longitude);

  return {
    ...baseCard,
    description: normalizeText(row.description),
    address: normalizeText(row.address),
    state: normalizeText(row.state),
    zipCode: normalizeText(row.zip_code),
    latitude: Number.isNaN(latitudeValue ?? NaN) ? null : latitudeValue,
    longitude: Number.isNaN(longitudeValue ?? NaN) ? null : longitudeValue,
    areaTotal: formatArea(row.area_total),
    areaUseful: formatArea(row.area_useful),
    condominiumFee: row.condominium_fee ? formatCurrencyBRL(row.condominium_fee) : null,
    iptuValue: row.iptu_value ? formatCurrencyBRL(row.iptu_value) : null,
    builtYear: row.built_year,
    furnished: row.furnished,
    contactPhone: normalizeText(row.contact_phone),
    contactWhatsapp: normalizeText(row.contact_whatsapp),
    publishedAt: row.published_at,
    neighborhoodSlug: normalizeText(neighborhood?.slug),
    neighborhoodName: normalizeText(neighborhood?.name),
    neighborhoodCity: normalizeText(neighborhood?.city),
    neighborhoodState: normalizeText(neighborhood?.state),
    images,
    features,
  };
}

function mapBlogSummary(value: string | null | undefined, excerpt: string | null | undefined) {
  const paragraphs = splitParagraphs(value);

  if (paragraphs.length) {
    return paragraphs.slice(0, 3);
  }

  const normalizedExcerpt = normalizeText(excerpt);

  return normalizedExcerpt ? [normalizedExcerpt] : [];
}

function mapBlogPost(row: BlogPostRow): PublicBlogPost {
  const category = Array.isArray(row.category) ? row.category[0] ?? null : row.category;
  const excerpt = normalizeText(row.excerpt) ?? normalizeText(row.body)?.slice(0, 180) ?? null;

  return {
    slug: row.slug,
    title: row.title,
    excerpt,
    category: normalizeText(category?.name) ?? null,
    readingTime: estimateReadingTime(row.body ?? row.excerpt),
    publishedAt: row.published_at ?? row.created_at,
    summary: mapBlogSummary(row.body, row.excerpt),
    coverImageUrl: normalizeText(row.cover_image_url),
    body: normalizeText(row.body),
  };
}

function mapNeighborhoodRecord(row: NeighborhoodRow, propertyCount: number): PublicNeighborhood {
  return {
    slug: row.slug,
    name: row.name,
    city: row.city,
    state: row.state,
    description: normalizeText(row.intro_text),
    seoTitle: normalizeText(row.seo_title),
    seoDescription: normalizeText(row.seo_description),
    propertyCount,
  };
}

function mapPageBlock(row: PageBlockRow): PublicPageBlock {
  return {
    id: row.id,
    blockKey: row.block_key,
    title: normalizeText(row.title),
    content: normalizeText(row.content),
    mediaUrl: normalizeText(row.media_url),
    sortOrder: row.sort_order,
  };
}

function mapPageRecord(row: PageRow, blocks: PageBlockRow[] = []): PublicPageContent {
  return {
    slug: row.slug,
    title: row.title,
    subtitle: normalizeText(row.subtitle),
    body: normalizeText(row.body),
    pageType: row.page_type,
    heroImageUrl: normalizeText(row.hero_image_url),
    seoTitle: normalizeText(row.seo_title),
    seoDescription: normalizeText(row.seo_description),
    ogImageUrl: normalizeText(row.og_image_url),
    isPublished: row.is_published,
    blocks: blocks
      .filter((block) => block.is_active)
      .sort((left, right) => left.sort_order - right.sort_order)
      .map(mapPageBlock),
  };
}

function mapSiteSettings(row: SiteSettingsRow | null): PublicSiteSettings {
  const socialLinks = row?.social_links && typeof row.social_links === "object"
    ? (row.social_links as Record<string, string>)
    : {};
  const openingHours = Array.isArray(row?.opening_hours)
    ? row.opening_hours.map((item) => String(item))
    : [];

  return {
    companyName: normalizeText(row?.company_name) ?? brand.name,
    brandName: normalizeText(row?.brand_name) ?? brand.name,
    legalName: normalizeText(row?.legal_name),
    logoUrl: normalizeText(row?.logo_url),
    primaryColor: normalizeText(row?.primary_color),
    secondaryColor: normalizeText(row?.secondary_color),
    accentColor: normalizeText(row?.accent_color),
    primaryPhone: normalizeText(row?.primary_phone),
    whatsappNumber: normalizeText(row?.whatsapp_number),
    email: normalizeText(row?.email),
    address: normalizeText(row?.address),
    city: normalizeText(row?.city),
    state: normalizeText(row?.state),
    socialLinks,
    openingHours,
    impactPhrase: normalizeText(row?.impact_phrase) ?? brand.slogan,
    defaultSeoTitle: normalizeText(row?.default_seo_title) ?? `${brand.name} | ${brand.subtitle}`,
    defaultSeoDescription: normalizeText(row?.default_seo_description) ?? brand.slogan,
  };
}

export async function getPublicSiteSettings() {
  const supabase = createSupabasePublicClient();
  const { data } = await supabase
    .from("site_settings")
    .select(
      "company_name, brand_name, legal_name, logo_url, primary_color, secondary_color, accent_color, primary_phone, whatsapp_number, email, address, city, state, social_links, opening_hours, impact_phrase, default_seo_title, default_seo_description"
    )
    .eq("singleton_key", "main")
    .maybeSingle();

  return mapSiteSettings((data as SiteSettingsRow | null) ?? null);
}

export async function getPublicProperties() {
  const supabase = createSupabasePublicClient();
  const { data } = await supabase
    .from("properties")
    .select(
      "id, slug, title, transaction_type, property_type, status, is_published, featured, price, price_on_request, description, address, city, state, bedrooms, bathrooms, garages, area_total, area_useful, neighborhood:neighborhoods(id, slug, name, city, state), property_images(url, alt_text, sort_order, is_cover), property_features(label, value, sort_order)"
    )
    .eq("is_published", true)
    .order("featured", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("updated_at", { ascending: false });

  return ((data ?? []) as PropertyRow[]).map((row, index) => mapPropertyCard(row, index));
}

export async function getPublicFeaturedProperties(limit = 2) {
  const properties = await getPublicProperties();

  return properties.filter((property) => property.featured).slice(0, limit);
}

export async function getPublicPropertyBySlug(slug: string) {
  const supabase = createSupabasePublicClient();
  const { data } = await supabase
    .from("properties")
    .select(
      "id, slug, title, transaction_type, property_type, status, is_published, featured, price, price_on_request, description, address, city, state, zip_code, latitude, longitude, bedrooms, bathrooms, garages, area_total, area_useful, condominium_fee, iptu_value, built_year, furnished, contact_phone, contact_whatsapp, published_at, neighborhood:neighborhoods(id, slug, name, city, state), property_images(url, alt_text, sort_order, is_cover), property_features(label, value, sort_order)"
    )
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  return data ? mapPropertyDetail(data as PropertyRow) : null;
}

export async function getPublicBlogPosts() {
  const supabase = createSupabasePublicClient();
  const { data } = await supabase
    .from("blog_posts")
    .select(
      "id, slug, title, excerpt, body, cover_image_url, is_published, seo_title, seo_description, og_image_url, published_at, sort_order, created_at, updated_at, category:blog_categories(slug, name)"
    )
    .eq("is_published", true)
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("sort_order", { ascending: true });

  return ((data ?? []) as BlogPostRow[]).map((row) => mapBlogPost(row));
}

export async function getPublicBlogPostBySlug(slug: string) {
  const supabase = createSupabasePublicClient();
  const { data } = await supabase
    .from("blog_posts")
    .select(
      "id, slug, title, excerpt, body, cover_image_url, is_published, seo_title, seo_description, og_image_url, published_at, sort_order, created_at, updated_at, category:blog_categories(slug, name)"
    )
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  return data ? mapBlogPost(data as BlogPostRow) : null;
}

export async function getPublicNeighborhoods() {
  const supabase = createSupabasePublicClient();

  const [{ data: neighborhoods }, { data: properties }] = await Promise.all([
    supabase
      .from("neighborhoods")
      .select("id, slug, name, city, state, intro_text, seo_title, seo_description, is_published, sort_order")
      .eq("is_published", true)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),
    supabase.from("properties").select("neighborhood_id").eq("is_published", true),
  ]);

  const counts = new Map<string, number>();

  for (const property of (properties ?? []) as Array<{ neighborhood_id: string | null }>) {
    if (!property.neighborhood_id) {
      continue;
    }

    counts.set(property.neighborhood_id, (counts.get(property.neighborhood_id) ?? 0) + 1);
  }

  return ((neighborhoods ?? []) as NeighborhoodRow[]).map((neighborhood) =>
    mapNeighborhoodRecord(neighborhood, counts.get(neighborhood.id) ?? 0)
  );
}

export async function getPublicNeighborhoodBySlug(slug: string) {
  const supabase = createSupabasePublicClient();
  const { data: neighborhood } = await supabase
    .from("neighborhoods")
    .select("id, slug, name, city, state, intro_text, seo_title, seo_description, is_published, sort_order")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (!neighborhood) {
    return null;
  }

  const { count } = await supabase
    .from("properties")
    .select("id", { count: "exact", head: true })
    .eq("is_published", true)
    .eq("neighborhood_id", (neighborhood as NeighborhoodRow).id);

  return mapNeighborhoodRecord(neighborhood as NeighborhoodRow, count ?? 0);
}

export async function getPublicNeighborhoodProperties(slug: string) {
  const properties = await getPublicProperties();

  return properties.filter((property) => property.neighborhoodSlug === slug);
}

export async function getPublicPageBySlug(slug: string) {
  const supabase = createSupabasePublicClient();
  const { data: page } = await supabase
    .from("pages")
    .select("id, slug, title, subtitle, body, page_type, hero_image_url, is_published, seo_title, seo_description, og_image_url, sort_order")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (!page) {
    return null;
  }

  const { data: blocks } = await supabase
    .from("page_blocks")
    .select("id, block_key, title, content, media_url, sort_order, is_active")
    .eq("page_id", (page as PageRow).id)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  return mapPageRecord(page as PageRow, (blocks ?? []) as PageBlockRow[]);
}

function getInstagramHref(value: string | null | undefined) {
  const text = normalizeText(value);

  if (!text) {
    return null;
  }

  if (/^https?:\/\//i.test(text)) {
    return text;
  }

  const handle = text.replace(/^@/, "").replace(/^instagram\.com\//i, "").trim();

  return handle ? `https://instagram.com/${handle}` : null;
}

function getInstagramDisplayValue(value: string | null | undefined) {
  const href = getInstagramHref(value);

  if (!href) {
    return null;
  }

  const match = href.match(/instagram\.com\/([^/?#]+)/i);
  const handle = match?.[1]?.trim();

  return handle ? `@${handle.replace(/^@/, "")}` : href;
}

export function getPublicContactChannels(settings: PublicSiteSettings) {
  const channels: PublicContactChannel[] = [];

  if (settings.whatsappNumber) {
    channels.push({
      label: "WhatsApp comercial",
      value: getWhatsAppDisplayNumber(settings.whatsappNumber),
      note: "Canal principal para atendimento rápido.",
      href: getWhatsAppHref("Olá, gostaria de falar com a assessoria.", settings.whatsappNumber),
    });
  }

  if (settings.primaryPhone && settings.primaryPhone !== settings.whatsappNumber) {
    channels.push({
      label: "Telefone",
      value: settings.primaryPhone,
      note: "Contato direto com a equipe.",
      href: `tel:${settings.primaryPhone.replace(/\D/g, "")}`,
    });
  }

  if (settings.email) {
    channels.push({
      label: "E-mail institucional",
      value: settings.email,
      note: "Recebe leads e encaminhamentos internos.",
      href: `mailto:${settings.email}`,
    });
  }

  const instagramHref = getInstagramHref(settings.socialLinks.instagram);
  const instagramDisplayValue = getInstagramDisplayValue(settings.socialLinks.instagram);

  if (instagramHref && instagramDisplayValue) {
    channels.push({
      label: "Instagram",
      value: instagramDisplayValue,
      note: "Canal institucional para acompanhar novidades e posicionamento da marca.",
      href: instagramHref,
    });
  }

  if (settings.address) {
    const location = [settings.address, settings.city, settings.state].filter(Boolean).join(" - ");

    channels.push({
      label: "Endereço",
      value: location,
      note: "Informações presenciais quando disponíveis.",
      href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`,
    });
  }

  if (settings.openingHours.length) {
    channels.push({
      label: "Horário",
      value: settings.openingHours.join(" · "),
      note: "Janela operacional da assessoria.",
      href: "/contato",
    });
  }

  return channels;
}

export { splitParagraphs, estimateReadingTime };
