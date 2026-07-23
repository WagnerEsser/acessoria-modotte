import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/shared/section-heading";
import { getPublicPageBySlug, getPublicSiteSettings, splitParagraphs } from "@/lib/public-content";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const [siteSettings, page] = await Promise.all([
    getPublicSiteSettings(),
    getPublicPageBySlug("sobre"),
  ]);

  if (!page) {
    return buildMetadata({
      title: "Sobre",
      description: siteSettings.defaultSeoDescription,
      path: "/sobre",
    });
  }

  return buildMetadata({
    title: page.seoTitle ?? page.title,
    description: page.seoDescription ?? page.subtitle ?? siteSettings.defaultSeoDescription,
    path: "/sobre",
    image: page.ogImageUrl ?? page.heroImageUrl,
    imageAlt: page.title,
  });
}

export default async function AboutPage() {
  const page = await getPublicPageBySlug("sobre");
  const paragraphs = splitParagraphs(page?.body);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="space-y-12">
        <SectionHeading
          as="h1"
          eyebrow="Sobre"
          title={page?.title ?? "Sobre a assessoria"}
          description={page?.subtitle ?? paragraphs[0] ?? "Conteúdo institucional ainda não cadastrado."}
        />

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="p-6">
            <Badge variant="gold">Essência</Badge>
            <div className="mt-4 space-y-4 text-sm leading-7 text-brand-ivory/70">
              {paragraphs.length ? (
                paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)
              ) : (
                <p>
                  Atendimento imobiliário próximo, análise cuidadosa e comunicação clara para
                  conduzir decisões de compra e venda com mais segurança.
                </p>
              )}
            </div>
          </Card>

          <Card className="overflow-hidden p-0">
            <div className="relative aspect-[4/5] overflow-hidden">
              <Image
                src="/images/luana-modotte-portrait-pro.png"
                alt="Retrato profissional de Luana Modotte"
                fill
                priority
                sizes="(min-width: 1024px) 32rem, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-ink via-brand-ink/24 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <Badge variant="soft" className="w-fit">
                  Luana Modotte
                </Badge>
                <h2 className="mt-4 font-display text-3xl text-brand-ivory">
                  Atendimento próximo, leitura técnica e condução direta.
                </h2>
              </div>
            </div>
            <div className="p-6">
              <Badge variant="outline">Perfil</Badge>
              <p className="mt-4 text-sm leading-7 text-brand-ivory/72">
                A apresentação da assessoria passa pela confiança de quem conduz cada etapa do
                processo. A proposta aqui é manter uma comunicação clara, elegante e humana, com
                contato direto e alinhamento rápido ao perfil de cada cliente.
              </p>
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <Badge variant="outline">Direção</Badge>
          <ul className="mt-5 grid gap-3 text-sm leading-6 text-brand-ivory/72 md:grid-cols-2">
            {page?.blocks.length ? (
              page.blocks.map((block) => (
                <li key={block.id} className="flex gap-2 rounded-2xl border border-brand-beige/10 bg-brand-ivory/4 p-4">
                  <span className="mt-2 size-1.5 rounded-full bg-brand-gold" />
                  <span>{block.title ?? block.content ?? block.blockKey}</span>
                </li>
              ))
            ) : (
              <li className="flex gap-2 rounded-2xl border border-brand-beige/10 bg-brand-ivory/4 p-4 md:col-span-2">
                <span className="mt-2 size-1.5 rounded-full bg-brand-gold" />
                <span>
                  Proximidade no atendimento, organização documental e negociação transparente.
                </span>
              </li>
            )}
          </ul>
        </Card>

        <div className="flex flex-wrap gap-3">
          <Link href="/contato" className={buttonVariants({ size: "lg" })}>
            Falar com a assessoria
          </Link>
          <Link href="/imoveis" className={buttonVariants({ variant: "outline", size: "lg" })}>
            Ver imóveis
          </Link>
        </div>
      </div>
    </div>
  );
}
