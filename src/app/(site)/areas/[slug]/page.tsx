import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MapPinHouse, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/shared/section-heading";
import { buildMetadata } from "@/lib/seo";
import { getNeighborhoodBySlug, neighborhoods } from "@/lib/site-data";

type NeighborhoodPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return neighborhoods.map((neighborhood) => ({
    slug: neighborhood.slug,
  }));
}

export async function generateMetadata({
  params,
}: NeighborhoodPageProps): Promise<Metadata> {
  const { slug } = await params;
  const neighborhood = getNeighborhoodBySlug(slug);

  if (!neighborhood) {
    return buildMetadata({
      title: "Área não encontrada",
      description: "A área solicitada não existe.",
      path: `/areas/${slug}`,
      noIndex: true,
    });
  }

  return buildMetadata({
    title: neighborhood.name,
    description: neighborhood.description,
    path: `/areas/${neighborhood.slug}`,
  });
}

export default async function NeighborhoodPage({ params }: NeighborhoodPageProps) {
  const { slug } = await params;
  const neighborhood = getNeighborhoodBySlug(slug);

  if (!neighborhood) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="space-y-10">
        <SectionHeading
          eyebrow="Áreas"
          title={neighborhood.name}
          description={neighborhood.description}
        />

        <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <Card className="p-6">
            <Badge variant="gold">{neighborhood.city}</Badge>
            <div className="mt-5 flex items-center gap-3">
              <MapPinHouse className="size-5 text-brand-gold" />
              <p className="text-sm uppercase tracking-[0.28em] text-brand-beige/55">
                Conteúdo local pronto para SEO e conversão
              </p>
            </div>
            <p className="mt-4 text-sm leading-7 text-brand-ivory/70">
              A página de área serve para destacar zonas de interesse, gerar
              relevância local e conectar o bairro aos imóveis mais aderentes.
            </p>
          </Card>

          <Card className="p-6">
            <Sparkles className="size-5 text-brand-gold" />
            <p className="mt-4 text-xs uppercase tracking-[0.3em] text-brand-beige/55">
              Volume
            </p>
            <p className="mt-2 font-display text-5xl text-brand-ivory">
              {neighborhood.propertyCount}
            </p>
            <p className="mt-2 text-sm text-brand-ivory/68">
              Imóveis mapeados para esta área.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
