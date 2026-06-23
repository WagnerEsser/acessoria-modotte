import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Building2, ShieldCheck, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PropertyCard } from "@/components/shared/property-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { brand } from "@/lib/brand";
import { buildMetadata } from "@/lib/seo";
import { featuredProperties } from "@/lib/site-data";

export const metadata = buildMetadata({
  title: "Assessoria imobiliária",
  description:
    "Site institucional leve da Luana Modotte, com foco em apresentação clara, poucos imóveis e contato direto.",
});

const homeSignals = [
  {
    title: "Curadoria inicial",
    description: "Poucos imóveis, bem apresentados e com foco comercial.",
    icon: Sparkles,
  },
  {
    title: "Atendimento direto",
    description: "Contato simples para quem chega pelo site.",
    icon: ShieldCheck,
  },
  {
    title: "Base pronta",
    description: "A estrutura cresce sem precisar refazer o projeto.",
    icon: Building2,
  },
] as const;

export default function HomePage() {
  return (
    <div className="space-y-20 pb-20">
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-20">
          <div className="space-y-6">
            <Badge variant="soft" className="w-fit">
              Assessoria imobiliária nova
            </Badge>

            <div className="space-y-5">
              <h1 className="max-w-3xl font-display text-5xl font-semibold leading-none text-brand-ivory sm:text-6xl lg:text-7xl">
                Uma presença digital elegante, clara e sem excesso.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-brand-ivory/72 sm:text-lg">
                {brand.name} foi apresentada de forma mais leve para combinar com
                uma assessoria que ainda está construindo portfólio, autoridade e
                relacionamento com o mercado.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/imoveis" className={buttonVariants({ size: "lg" })}>
                Ver imóveis
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/contato"
                className={buttonVariants({ variant: "outline", size: "lg" })}
              >
                Falar com a assessoria
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {homeSignals.map((item) => {
                const Icon = item.icon;

                return (
                  <Card key={item.title} className="p-4">
                    <div className="grid size-10 place-items-center rounded-2xl border border-brand-gold/16 bg-brand-gold/12 text-brand-gold">
                      <Icon className="size-4" />
                    </div>
                    <h2 className="mt-4 font-display text-xl font-semibold text-brand-ivory">
                      {item.title}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-brand-ivory/68">
                      {item.description}
                    </p>
                  </Card>
                );
              })}
            </div>
          </div>

          <Card className="overflow-hidden p-5">
            <div className="rounded-[1.5rem] border border-brand-beige/12 bg-[linear-gradient(180deg,rgba(19,37,59,0.92),rgba(11,27,44,0.98))] p-4">
              <Image
                src="/brand/luana-modotte-logo-lockup.png"
                alt="Luana Modotte Assessoria Imobiliária"
                width={1600}
                height={900}
                priority
                className="h-auto w-full rounded-[1.25rem] border border-brand-beige/10 object-cover"
              />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-brand-beige/12 bg-brand-ivory/5 p-4">
                <p className="text-xs uppercase tracking-[0.28em] text-brand-beige/55">
                  Foco
                </p>
                <p className="mt-2 text-sm leading-6 text-brand-ivory/72">
                  Pouco conteúdo, mais clareza.
                </p>
              </div>
              <div className="rounded-2xl border border-brand-beige/12 bg-brand-ivory/5 p-4">
                <p className="text-xs uppercase tracking-[0.28em] text-brand-beige/55">
                  Marca
                </p>
                <p className="mt-2 text-sm leading-6 text-brand-ivory/72">
                  Navy profundo com gold suave.
                </p>
              </div>
              <div className="rounded-2xl border border-brand-beige/12 bg-brand-ivory/5 p-4">
                <p className="text-xs uppercase tracking-[0.28em] text-brand-beige/55">
                  Ritmo
                </p>
                <p className="mt-2 text-sm leading-6 text-brand-ivory/72">
                  Crescimento gradual e organizado.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Imóveis em destaque"
          title="Uma vitrine curta, porque o catálogo ainda está nascendo"
          description="Por enquanto a home mostra apenas os imóveis que fazem mais sentido para o posicionamento da assessoria."
        />

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {featuredProperties.slice(0, 2).map((property) => (
            <PropertyCard key={property.slug} property={property} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Card className="grid gap-6 p-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.32em] text-brand-beige/60">
              Próximo passo
            </p>
            <h2 className="mt-3 font-display text-4xl font-semibold leading-tight text-brand-ivory">
              Menos informação agora. Mais foco no essencial.
            </h2>
            <p className="mt-4 text-sm leading-6 text-brand-ivory/72">
              O site segue com a base pronta para crescer quando houver mais
              imóveis, mais áreas e mais conteúdo institucional.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/contato" className={buttonVariants({ size: "lg" })}>
              Quero contato
            </Link>
            <Link
              href="/sobre"
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              Saber mais
            </Link>
          </div>
        </Card>
      </section>
    </div>
  );
}
