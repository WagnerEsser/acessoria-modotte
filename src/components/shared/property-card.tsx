import Link from "next/link";
import { ArrowRight, Bath, BedDouble, CarFront, Square } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { slugify } from "@/lib/form-utils";
import type { PublicPropertyCard } from "@/lib/public-content";
import { cn } from "@/lib/utils";

type PropertyCardProps = {
  property: PublicPropertyCard;
};

export function PropertyCard({ property }: PropertyCardProps) {
  const locationLabel = [property.city, property.location].filter(Boolean).join(" - ");
  const statItems = [
    {
      key: "size",
      label: "Área",
      value: property.size,
      icon: Square,
    },
    {
      key: "bedrooms",
      label: "Dormitórios",
      value: property.bedrooms && property.bedrooms > 0 ? `${property.bedrooms}` : null,
      icon: BedDouble,
    },
    {
      key: "bathrooms",
      label: "Banheiros",
      value: property.bathrooms && property.bathrooms > 0 ? `${property.bathrooms}` : null,
      icon: Bath,
    },
    {
      key: "garages",
      label: "Vagas",
      value: property.garages && property.garages > 0 ? `${property.garages}` : null,
      icon: CarFront,
    },
  ].filter((item) => Boolean(item.value));

  return (
    <Card className="overflow-hidden p-0">
      <div className="relative overflow-hidden bg-brand-ink">
        {property.coverImageUrl ? (
          <img
            src={property.coverImageUrl}
            alt={property.coverImageAlt ?? property.title}
            width={property.coverImageWidth ?? 1600}
            height={property.coverImageHeight ?? 900}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover opacity-40"
          />
        ) : null}
        <div className={cn("absolute inset-0 bg-gradient-to-br", property.accent)} />
        <div className="relative p-5">
          <div className="flex items-start justify-between gap-3">
            <Link href={`/imoveis/tipo/${slugify(property.type)}`}>
              <Badge variant="soft">{property.type}</Badge>
            </Link>
            {property.featured ? <Badge variant="gold">Destaque</Badge> : null}
          </div>

          <div className="mt-16 space-y-2">
            {locationLabel ? (
              property.neighborhoodSlug ? (
                <Link
                  href={`/areas/${property.neighborhoodSlug}`}
                  className="text-xs uppercase tracking-[0.3em] text-brand-ivory/68 transition hover:text-brand-gold"
                >
                  {locationLabel}
                </Link>
              ) : property.city ? (
                <Link
                  href={`/imoveis/cidade/${slugify(property.city)}`}
                  className="text-xs uppercase tracking-[0.3em] text-brand-ivory/68 transition hover:text-brand-gold"
                >
                  {locationLabel}
                </Link>
              ) : (
                <div className="text-xs uppercase tracking-[0.3em] text-brand-ivory/68">
                  {locationLabel}
                </div>
              )
            ) : null}
            <h3 className="max-w-lg font-display text-2xl font-semibold leading-tight text-brand-ivory">
              {property.title}
            </h3>
          </div>
        </div>
      </div>

      <div className="space-y-5 p-5">
        {property.summary ? (
          <p className="text-sm leading-6 text-brand-ivory/70">{property.summary}</p>
        ) : null}

        {statItems.length ? (
          <div className={cn("grid gap-3 text-sm text-brand-ivory/75", "sm:grid-cols-4")}>
            {statItems.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.key}
                  className="rounded-2xl border border-brand-beige/12 bg-brand-ivory/4 p-3"
                >
                  <Icon className="mb-2 size-4 text-brand-gold" />
                  <p className="text-xs uppercase tracking-[0.24em] text-brand-beige/55">
                    {item.label}
                  </p>
                  <p className="mt-1 font-numeric text-sm text-brand-ivory/80">{item.value}</p>
                </div>
              );
            })}
          </div>
        ) : null}

        {property.highlights.length ? (
          <div className="flex flex-wrap gap-2">
            {property.highlights.map((item) => (
              <Badge key={item} variant="outline" className="normal-case tracking-normal">
                {item}
              </Badge>
            ))}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-brand-beige/10 pt-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-brand-beige/55">Valor</p>
            <div className="mt-1 font-numeric text-xl font-semibold text-brand-ivory">
              {property.price}
            </div>
          </div>

          <Link
            href={`/imoveis/${property.slug}`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Ver detalhes
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </Card>
  );
}
