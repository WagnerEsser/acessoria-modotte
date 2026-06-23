import Link from "next/link";
import { ArrowRight, Bath, BedDouble, CarFront, Square } from "lucide-react";

import type { PropertyListing } from "@/lib/site-data";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";

type PropertyCardProps = {
  property: PropertyListing;
};

export function PropertyCard({ property }: PropertyCardProps) {
  return (
    <Card className="overflow-hidden p-0">
      <div className={`bg-gradient-to-br ${property.accent} p-5`}>
        <div className="flex items-start justify-between gap-3">
          <Badge variant="soft">{property.type}</Badge>
          {property.featured ? <Badge variant="gold">Destaque</Badge> : null}
        </div>

        <div className="mt-16 space-y-2">
          <div className="text-xs uppercase tracking-[0.3em] text-brand-ivory/68">
            {property.city} - {property.location}
          </div>
          <h3 className="max-w-lg font-display text-2xl font-semibold leading-tight text-brand-ivory">
            {property.title}
          </h3>
        </div>
      </div>

      <div className="space-y-5 p-5">
        <p className="text-sm leading-6 text-brand-ivory/70">{property.summary}</p>

        <div className="grid grid-cols-2 gap-3 text-sm text-brand-ivory/75 sm:grid-cols-4">
          <div className="rounded-2xl border border-brand-beige/12 bg-brand-ivory/4 p-3">
            <Square className="mb-2 size-4 text-brand-gold" />
            {property.size}
          </div>
          <div className="rounded-2xl border border-brand-beige/12 bg-brand-ivory/4 p-3">
            <BedDouble className="mb-2 size-4 text-brand-gold" />
            {property.bedrooms} dorm.
          </div>
          <div className="rounded-2xl border border-brand-beige/12 bg-brand-ivory/4 p-3">
            <Bath className="mb-2 size-4 text-brand-gold" />
            {property.bathrooms} banh.
          </div>
          <div className="rounded-2xl border border-brand-beige/12 bg-brand-ivory/4 p-3">
            <CarFront className="mb-2 size-4 text-brand-gold" />
            {property.garages} vagas
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {property.highlights.map((item) => (
            <Badge key={item} variant="outline" className="normal-case tracking-normal">
              {item}
            </Badge>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-brand-beige/10 pt-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-brand-beige/55">
              Valor
            </p>
            <div className="mt-1 font-display text-xl font-semibold text-brand-ivory">
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
