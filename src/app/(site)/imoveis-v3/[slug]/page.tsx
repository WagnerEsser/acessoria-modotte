import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Bath,
  BedDouble,
  CalendarDays,
  Camera,
  CarFront,
  CheckCircle2,
  Home,
  Images,
  Map,
  MapPin,
  MessageCircle,
  Phone,
  Play,
  Receipt,
  Ruler,
  Sofa,
  Square,
} from "lucide-react";

import { JsonLd } from "@/components/seo/json-ld";
import { PublicPageLink } from "@/components/shared/public-page-link";
import { RichText } from "@/components/shared/rich-text";
import { PropertyImageGallery } from "@/components/site/property-image-gallery";
import { PropertyMap } from "@/components/site/property-map";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  formatBrazilianPhoneDisplayNumber,
  getWhatsAppHref,
} from "@/lib/contact";
import {
  getPublicPropertyBySlug,
  getPublicSiteSettings,
  type PublicPropertyDetail,
} from "@/lib/public-content";
import { richTextToPlainText } from "@/lib/rich-text";
import { buildMetadata } from "@/lib/seo";
import { buildBreadcrumbStructuredData } from "@/lib/structured-data";
import { cn } from "@/lib/utils";

export const revalidate = 300;

type PropertyV3PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function formatTransactionType(value: string) {
  const normalizedValue = value.trim().toLowerCase();

  if (["sale", "venda", "buy"].includes(normalizedValue)) {
    return "comprar";
  }

  if (["rent", "aluguel", "locacao", "locação"].includes(normalizedValue)) {
    return "alugar";
  }

  return value;
}

function getPropertyContactHref(
  property: PublicPropertyDetail,
  whatsappNumber: string | null,
) {
  const targetNumber = property.contactWhatsapp ?? whatsappNumber;

  if (!targetNumber) {
    return "/contato";
  }

  return getWhatsAppHref(
    `Olá, tenho interesse no imóvel ${property.title}.`,
    targetNumber,
  );
}

function getLocationLabel(property: PublicPropertyDetail) {
  return [property.neighborhoodName, property.city, property.state]
    .filter(Boolean)
    .join(" | ");
}

function getDisplayLocation(property: PublicPropertyDetail) {
  if (property.showFullAddress && property.address) {
    return [property.address, property.city, property.state].filter(Boolean).join(" - ");
  }

  return [property.neighborhoodName, property.city, property.state].filter(Boolean).join(" - ");
}

function getMapQuery(property: PublicPropertyDetail) {
  if (property.showFullAddress && property.latitude !== null && property.longitude !== null) {
    return `${property.latitude},${property.longitude}`;
  }

  if (property.showFullAddress) {
    return [property.address, property.neighborhoodName, property.city, property.state]
      .filter(Boolean)
      .join(", ");
  }

  return [property.neighborhoodName, property.city, property.state].filter(Boolean).join(", ");
}

function DetailMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Square;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-h-20 items-center gap-4 rounded-[0.4rem] bg-brand-ivory px-5 py-4 text-brand-navy">
      <Icon className="size-5 shrink-0 text-brand-gold" aria-hidden="true" />
      <div>
        <p className="font-numeric text-lg font-semibold">{value}</p>
        <p className="text-xs text-brand-navy/56">{label}</p>
      </div>
    </div>
  );
}

function MediaNavItem({
  href,
  icon: Icon,
  label,
  disabled = false,
}: {
  href: string;
  icon: typeof Camera;
  label: string;
  disabled?: boolean;
}) {
  if (disabled) {
    return (
      <span className="inline-flex h-12 items-center justify-center gap-2 rounded-[0.4rem] border border-brand-beige/18 px-5 text-sm font-medium text-brand-ivory/38">
        <Icon className="size-4" aria-hidden="true" />
        {label}
      </span>
    );
  }

  return (
    <a
      href={href}
      className="inline-flex h-12 items-center justify-center gap-2 rounded-[0.4rem] border border-brand-beige/22 px-5 text-sm font-medium text-brand-ivory transition hover:border-brand-gold hover:bg-brand-gold hover:text-brand-navy"
    >
      <Icon className="size-4" aria-hidden="true" />
      {label}
    </a>
  );
}

export async function generateMetadata({
  params,
}: PropertyV3PageProps): Promise<Metadata> {
  const { slug } = await params;
  const property = await getPublicPropertyBySlug(slug);

  if (!property) {
    return buildMetadata({
      title: "Imóvel não encontrado",
      description: "O imóvel solicitado não existe ou ainda não foi publicado.",
      path: `/imoveis-v3/${slug}`,
      noIndex: true,
    });
  }

  const descriptionText = richTextToPlainText(property.description);

  return buildMetadata({
    title: `V3 - ${property.seoTitle ?? property.title}`,
    description:
      property.seoDescription ??
      property.summary ??
      (descriptionText || property.price),
    path: `/imoveis-v3/${property.slug}`,
    image: property.coverImageUrl,
    imageAlt: property.coverImageAlt ?? property.title,
    noIndex: true,
  });
}

export default async function PropertyV3DetailPage({ params }: PropertyV3PageProps) {
  const { slug } = await params;
  const [property, siteSettings] = await Promise.all([
    getPublicPropertyBySlug(slug),
    getPublicSiteSettings(),
  ]);

  if (!property) {
    notFound();
  }

  const contactHref = getPropertyContactHref(property, siteSettings.whatsappNumber);
  const contactOpensNewTab = contactHref.startsWith("http");
  const mapQuery = getMapQuery(property);
  const mapNote = property.showFullAddress
    ? "Localização indicada conforme os dados informados."
    : "Mapa com localização aproximada pela região do imóvel.";
  const locationLabel = getLocationLabel(property);
  const displayLocation = getDisplayLocation(property);
  const coverImage = property.images[0] ?? null;
  const mosaicImages = property.images.slice(0, 6);
  const galleryImages = property.images.length ? property.images : coverImage ? [coverImage] : [];
  const details = [
    {
      key: "bedrooms",
      label: property.bedrooms === 1 ? "quarto" : "quartos",
      value: property.bedrooms && property.bedrooms > 0 ? String(property.bedrooms) : null,
      icon: BedDouble,
    },
    {
      key: "garages",
      label: property.garages === 1 ? "vaga de garagem" : "vagas de garagem",
      value: property.garages !== null && property.garages >= 0 ? String(property.garages) : null,
      icon: CarFront,
    },
    { key: "size", label: "área privativa", value: property.size, icon: Ruler },
    { key: "areaTotal", label: "área total", value: property.areaTotal, icon: Square },
  ].filter((item): item is { key: string; label: string; value: string; icon: typeof Square } =>
    Boolean(item.value),
  );
  const costDetails = [
    { key: "condominium", label: "Condomínio", value: property.condominiumFee, icon: Receipt },
    { key: "iptu", label: "IPTU", value: property.iptuValue, icon: Receipt },
    {
      key: "builtYear",
      label: "Construção",
      value: property.builtYear ? String(property.builtYear) : null,
      icon: CalendarDays,
    },
    { key: "furnished", label: "Mobiliado", value: property.furnished ? "Sim" : null, icon: Sofa },
    {
      key: "bathrooms",
      label: property.bathrooms === 1 ? "Banheiro" : "Banheiros",
      value: property.bathrooms && property.bathrooms > 0 ? String(property.bathrooms) : null,
      icon: Bath,
    },
  ].filter((item): item is { key: string; label: string; value: string; icon: typeof Receipt } =>
    Boolean(item.value),
  );

  return (
    <main className="bg-white text-brand-ink">
      <JsonLd
        data={buildBreadcrumbStructuredData([
          { name: "Início", path: "/" },
          { name: "Imóveis", path: "/imoveis" },
          { name: property.title, path: `/imoveis-v3/${property.slug}` },
        ])}
      />

      <section className="bg-brand-ink pt-4 text-brand-ivory">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/imoveis"
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-brand-ivory/66 transition hover:text-brand-gold"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Voltar para imóveis
          </Link>
        </div>

        <div className="mx-auto grid max-w-[112rem] gap-1 px-1 sm:grid-cols-2 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div className="relative min-h-[22rem] overflow-hidden bg-brand-navy sm:min-h-[30rem] lg:row-span-2">
            {coverImage ? (
              <img
                src={coverImage.url}
                alt={coverImage.altText ?? property.title}
                width={coverImage.width ?? 1400}
                height={coverImage.height ?? 1000}
                loading="eager"
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className={`absolute inset-0 bg-gradient-to-br ${property.accent}`} />
            )}
            <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-brand-ink/80 px-3 py-2 text-xs font-medium text-brand-ivory backdrop-blur">
              <Images className="size-4 text-brand-gold" aria-hidden="true" />
              {property.images.length || 1} fotos
            </div>
          </div>

          {(mosaicImages.length ? mosaicImages.slice(1, 5) : []).map((image) => (
            <img
              key={image.url}
              src={image.url}
              alt={image.altText ?? property.title}
              width={image.width ?? 720}
              height={image.height ?? 420}
              loading="lazy"
              className="hidden h-full min-h-[14.85rem] w-full object-cover sm:block"
            />
          ))}
        </div>

        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-4 py-6 sm:px-6 lg:px-8">
          <nav className="flex flex-wrap gap-3" aria-label="Mídias do imóvel">
            <MediaNavItem href="#fotos-v3" icon={Camera} label="Fotos" />
            <MediaNavItem href="#video-v3" icon={Play} label="Vídeo" disabled={!property.videos.length} />
            <MediaNavItem href="#mapa-v3" icon={Map} label="Mapa" disabled={!property.showMap || !mapQuery} />
          </nav>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_24rem] lg:px-8">
        <div className="min-w-0">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-brand-gold">
                {locationLabel || displayLocation}
              </p>
              <h1 className="mt-2 font-display text-4xl font-semibold leading-tight text-brand-ink sm:text-5xl">
                {property.title}
              </h1>
              <p className="mt-3 text-sm text-brand-ink/58">Código: {property.slug}</p>
            </div>
            <Badge variant="gold" className="w-fit border-brand-gold/40 bg-brand-gold/14 text-brand-navy">
              Imóvel para {formatTransactionType(property.transactionType)}
            </Badge>
          </div>

          {details.length ? (
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {details.map((detail) => (
                <DetailMetric
                  key={detail.key}
                  icon={detail.icon}
                  label={detail.label}
                  value={detail.value}
                />
              ))}
            </div>
          ) : null}

          <section className="mt-12">
            <div className="mb-5 flex items-center gap-3">
              <span className="size-0 border-y-[0.55rem] border-l-[0.8rem] border-y-transparent border-l-brand-gold" />
              <h2 className="font-display text-3xl font-semibold text-brand-ink">
                Sobre esse imóvel
              </h2>
            </div>
            {property.description ? (
              <RichText value={property.description} className="text-base leading-8 text-brand-ink/70" />
            ) : (
              <p className="text-base leading-8 text-brand-ink/70">
                A descrição será exibida aqui quando estiver preenchida no cadastro.
              </p>
            )}
          </section>

          {property.highlights.length ? (
            <section className="mt-12">
              <h2 className="font-display text-3xl font-semibold text-brand-ink">
                Diferenciais
              </h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {property.highlights.map((highlight) => (
                  <div
                    key={highlight}
                    className="flex items-start gap-3 rounded-[0.4rem] border border-brand-ink/8 bg-brand-ivory/60 px-4 py-3 text-sm leading-6 text-brand-ink/70"
                  >
                    <CheckCircle2 className="mt-1 size-4 shrink-0 text-brand-gold" aria-hidden="true" />
                    {highlight}
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {costDetails.length ? (
            <section className="mt-12">
              <h2 className="font-display text-3xl font-semibold text-brand-ink">
                Dados complementares
              </h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {costDetails.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.key}
                      className="rounded-[0.4rem] border border-brand-ink/8 bg-white px-4 py-3 shadow-[0_18px_48px_-42px_rgba(7,17,29,0.34)]"
                    >
                      <Icon className="size-4 text-brand-gold" aria-hidden="true" />
                      <p className="mt-3 text-xs uppercase tracking-[0.18em] text-brand-ink/42">
                        {item.label}
                      </p>
                      <p className="mt-1 font-numeric text-lg font-semibold text-brand-ink">
                        {item.value}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>
          ) : null}
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-[0.65rem] border border-brand-ink/8 bg-white p-6 shadow-[0_22px_70px_-48px_rgba(7,17,29,0.42)]">
            <p className="text-sm text-brand-ink/72">
              Imóvel para {formatTransactionType(property.transactionType)}
            </p>
            <p className="mt-5 font-numeric text-3xl font-semibold text-brand-ink">
              {property.price}
            </p>
            <Link
              href={contactHref}
              target={contactOpensNewTab ? "_blank" : undefined}
              rel={contactOpensNewTab ? "noreferrer" : undefined}
              className={cn(buttonVariants({ variant: "gold", size: "lg" }), "mt-7 w-full bg-[#25d366] text-white hover:bg-[#1fb85a]")}
            >
              <MessageCircle className="size-5" aria-hidden="true" />
              Fale pelo WhatsApp
            </Link>
            <PublicPageLink
              href="/contato"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "mt-3 w-full border-brand-ink text-brand-ink hover:bg-brand-ink/5")}
            >
              <Home className="size-5" aria-hidden="true" />
              Agendar visita
            </PublicPageLink>
            <div className="mt-6 flex flex-wrap gap-4 border-t border-brand-ink/8 pt-5 text-sm">
              {property.contactPhone ? (
                <a
                  href={`tel:${property.contactPhone.replace(/\D/g, "")}`}
                  className="inline-flex items-center gap-2 text-brand-ink/72 underline underline-offset-4 transition hover:text-brand-gold"
                >
                  <Phone className="size-4" aria-hidden="true" />
                  Telefone
                </a>
              ) : null}
              <PublicPageLink
                href="/contato"
                className="inline-flex items-center gap-2 text-brand-ink/72 underline underline-offset-4 transition hover:text-brand-gold"
              >
                Quero saber mais
              </PublicPageLink>
            </div>
            <div className="mt-5 space-y-2 text-sm leading-6 text-brand-ink/56">
              {property.contactWhatsapp ? (
                <p className="font-numeric">
                  WhatsApp: {formatBrazilianPhoneDisplayNumber(property.contactWhatsapp)}
                </p>
              ) : null}
              {displayLocation ? (
                <p className="flex items-start gap-2">
                  <MapPin className="mt-1 size-4 shrink-0 text-brand-gold" aria-hidden="true" />
                  {displayLocation}
                </p>
              ) : null}
            </div>
          </div>
        </aside>
      </section>

      {galleryImages.length ? (
        <section id="fotos-v3" className="bg-brand-ink px-4 py-12 text-brand-ivory sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-brand-beige/55">Fotos</p>
                <h2 className="mt-2 font-display text-4xl font-semibold">Galeria do imóvel</h2>
              </div>
              <p className="text-sm text-brand-ivory/58">{galleryImages.length} imagens cadastradas</p>
            </div>
            <PropertyImageGallery images={galleryImages} title={property.title} />
          </div>
        </section>
      ) : null}

      {property.videos.length ? (
        <section id="video-v3" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-xs uppercase tracking-[0.28em] text-brand-ink/42">Vídeo</p>
          <h2 className="mt-2 font-display text-4xl font-semibold text-brand-ink">Visita em vídeo</h2>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {property.videos.map((video) => (
              <div key={video.url} className="overflow-hidden rounded-[0.65rem] bg-brand-ink">
                <video
                  controls
                  preload="metadata"
                  className="aspect-video w-full"
                  aria-label={video.fileName ?? `Vídeo de ${property.title}`}
                >
                  <source src={video.url} type={video.mimeType} />
                  Seu navegador não consegue reproduzir este vídeo.
                </video>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {property.showMap ? (
        <section id="mapa-v3" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="[&_h2]:text-brand-ink [&_p]:text-brand-ink/58">
            <PropertyMap query={mapQuery} note={mapNote} />
          </div>
        </section>
      ) : null}

      <section className="bg-brand-ivory px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <h2 className="font-display text-4xl font-semibold text-brand-ink">
              O que preciso para avaliar esse imóvel?
            </h2>
            <p className="mt-3 max-w-3xl text-base leading-8 text-brand-ink/64">
              A assessoria pode confirmar documentação, disponibilidade, condições comerciais e próximos passos antes da visita.
            </p>
          </div>
          <Link
            href={contactHref}
            target={contactOpensNewTab ? "_blank" : undefined}
            rel={contactOpensNewTab ? "noreferrer" : undefined}
            className={buttonVariants({ variant: "navy", size: "lg" })}
          >
            Quero orientação
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <div className="sticky bottom-0 z-30 hidden border-t border-brand-gold/20 bg-brand-ink/94 px-4 py-3 text-brand-ivory shadow-[0_-18px_60px_-34px_rgba(0,0,0,0.62)] backdrop-blur-xl sm:px-6 lg:block lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-brand-ivory/72">
            {property.bedrooms ? <span>{property.bedrooms} quartos</span> : null}
            {property.garages !== null ? <span>{property.garages} vagas</span> : null}
            {property.size ? <span>{property.size}</span> : null}
            <span className="font-numeric text-lg font-semibold text-brand-gold">{property.price}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={contactHref}
              target={contactOpensNewTab ? "_blank" : undefined}
              rel={contactOpensNewTab ? "noreferrer" : undefined}
              className={buttonVariants({ variant: "gold", size: "sm" })}
            >
              WhatsApp
              <MessageCircle className="size-4" aria-hidden="true" />
            </Link>
            <PublicPageLink href="/contato" className={buttonVariants({ variant: "outline", size: "sm" })}>
              Agendar visita
            </PublicPageLink>
          </div>
        </div>
      </div>
    </main>
  );
}
