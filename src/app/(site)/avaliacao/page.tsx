import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SectionHeading } from "@/components/shared/section-heading";
import { getPublicPageBySlug, getPublicSiteSettings, splitParagraphs } from "@/lib/public-content";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type EvaluationPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getFirstValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

export async function generateMetadata(): Promise<Metadata> {
  const [siteSettings, page] = await Promise.all([
    getPublicSiteSettings(),
    getPublicPageBySlug("avaliacao"),
  ]);

  if (!page) {
    return buildMetadata({
      title: "Avaliação",
      description: siteSettings.defaultSeoDescription,
      path: "/avaliacao",
      noIndex: true,
    });
  }

  return buildMetadata({
    title: page.seoTitle ?? page.title,
    description: page.seoDescription ?? page.subtitle ?? siteSettings.defaultSeoDescription,
    path: "/avaliacao",
  });
}

export default async function EvaluationPage({ searchParams }: EvaluationPageProps) {
  const page = await getPublicPageBySlug("avaliacao");
  const paragraphs = splitParagraphs(page?.body);
  const resolvedSearchParams = await searchParams;
  const submitted = getFirstValue(resolvedSearchParams.submitted) === "1";
  const error = getFirstValue(resolvedSearchParams.error);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="space-y-10">
        <SectionHeading
          eyebrow="Avaliação"
          title={page?.title ?? "Solicite uma leitura comercial do seu imóvel"}
          description={page?.subtitle ?? paragraphs[0] ?? "Conteúdo de avaliação ainda não cadastrado."}
          action={
            <Link href="/contato" className={buttonVariants({ variant: "gold" })}>
              Falar com a assessoria
              <ArrowRight className="size-4" />
            </Link>
          }
        />

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="space-y-4 p-6">
            <Badge variant="gold">Conteúdo</Badge>
            {paragraphs.length ? (
              <div className="space-y-4 text-sm leading-7 text-brand-ivory/70">
                {paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            ) : (
              <p className="text-sm leading-7 text-brand-ivory/70">
                A explicação da página será publicada no painel quando o conteúdo estiver pronto.
              </p>
            )}

            <div className="space-y-4">
              {page?.blocks.length ? (
                page.blocks.map((block, index) => (
                  <div
                    key={block.id}
                    className="rounded-2xl border border-brand-beige/12 bg-brand-ivory/4 p-4"
                  >
                    <p className="text-xs uppercase tracking-[0.28em] text-brand-beige/55">
                      Passo {index + 1}
                    </p>
                    <h2 className="mt-2 font-display text-2xl text-brand-ivory">
                      {block.title ?? "Bloco"}
                    </h2>
                    {block.content ? (
                      <p className="mt-2 text-sm leading-6 text-brand-ivory/68">{block.content}</p>
                    ) : null}
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-brand-beige/18 bg-brand-ivory/4 p-6 text-sm text-brand-ivory/68">
                  O fluxo de avaliação será detalhado no painel administrativo.
                </div>
              )}
            </div>
          </Card>

          <Card className="space-y-5 p-6">
            {submitted ? (
              <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm leading-6 text-emerald-100">
                Pedido enviado com sucesso. A avaliação será retornada em breve.
              </div>
            ) : null}

            {error ? (
              <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-100">
                Não foi possível enviar o formulário. Verifique os campos e tente novamente.
              </div>
            ) : null}

            <p className="text-xs uppercase tracking-[0.3em] text-brand-beige/55">
              Formulário base
            </p>
            <form action="/api/leads" method="post" className="space-y-5">
              <input type="hidden" name="redirect_to" value="/avaliacao" />
              <input type="hidden" name="source" value="avaliacao" />
              <input type="hidden" name="page_slug" value="avaliacao" />
              <input type="hidden" name="interest_type" value="Avaliação de imóvel" />
              <input type="hidden" name="website" value="" />

              <div className="grid gap-4 md:grid-cols-2">
                <Input name="name" placeholder="Nome" autoComplete="name" required />
                <Input
                  name="email"
                  placeholder="E-mail"
                  type="email"
                  autoComplete="email"
                  required
                />
                <Input
                  name="phone"
                  placeholder="Telefone"
                  autoComplete="tel"
                  required
                />
                <Input
                  name="property_context"
                  placeholder="Cidade / bairro"
                  required
                />
                <Textarea
                  name="message"
                  className="md:col-span-2"
                  placeholder="Descreva o imóvel e a urgência"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <Button type="submit" size="lg">
                  Enviar pedido
                  <ArrowRight className="size-4" />
                </Button>
                <Link href="/contato" className={buttonVariants({ variant: "outline" })}>
                  Falar com a assessoria
                </Link>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
