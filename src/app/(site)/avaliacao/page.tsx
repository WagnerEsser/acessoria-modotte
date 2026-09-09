import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SectionHeading } from "@/components/shared/section-heading";
import { PublicPageLink } from "@/components/shared/public-page-link";
import { RichText } from "@/components/shared/rich-text";
import { TurnstileWidget } from "@/components/security/turnstile-widget";
import { AdminForm } from "@/components/admin/admin-form";
import { getPublicPageBySlug, getPublicSiteSettings, splitParagraphs } from "@/lib/public-content";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 300;

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
    });
  }

  return buildMetadata({
    title: page.seoTitle ?? page.title,
    description: page.seoDescription ?? page.subtitle ?? siteSettings.defaultSeoDescription,
    path: "/avaliacao",
    image: page.ogImageUrl ?? page.heroImageUrl,
    imageAlt: page.title,
  });
}

export default async function EvaluationPage() {
  const page = await getPublicPageBySlug("avaliacao");
  if (!page) notFound();
  const paragraphs = splitParagraphs(page?.body);
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="space-y-10">
        <SectionHeading
          as="h1"
          eyebrow="Avaliação"
          title={page?.title ?? "Solicite uma leitura comercial do seu imóvel"}
          description={page?.subtitle ?? paragraphs[0] ?? "Conteúdo de avaliação ainda não cadastrado."}
          action={
            <PublicPageLink href="/contato" className={buttonVariants({ variant: "gold" })}>
              Falar com a assessoria
              <ArrowRight className="size-4" />
            </PublicPageLink>
          }
        />

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="space-y-4 p-6">
            <Badge variant="gold">Conteúdo</Badge>
            {paragraphs.length ? (
              <div className="space-y-4 text-sm leading-7 text-brand-ivory/70">
                <RichText value={page?.body} />
              </div>
            ) : (
              <p className="text-sm leading-7 text-brand-ivory/70">
                A avaliação considera características do imóvel, localização, conservação e contexto
                de mercado para orientar uma decisão mais segura.
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
                      <p className="mt-2 whitespace-pre-line text-sm leading-6 text-brand-ivory/68">{block.content}</p>
                    ) : null}
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-brand-beige/18 bg-brand-ivory/4 p-6 text-sm text-brand-ivory/68">
                  Envie os dados essenciais do imóvel para receber uma análise inicial da assessoria.
                </div>
              )}
            </div>
          </Card>

          <Card className="space-y-5 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-brand-beige/55">
              Formulário base
            </p>
            <AdminForm action="/api/leads" className="space-y-5">
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

              <TurnstileWidget />

              <div className="flex flex-wrap gap-3">
                <SubmitButton size="lg" pendingLabel="Enviando pedido...">
                  Enviar pedido
                  <ArrowRight className="size-4" />
                </SubmitButton>
                <PublicPageLink href="/contato" className={buttonVariants({ variant: "outline" })}>
                  Falar com a assessoria
                </PublicPageLink>
              </div>
            </AdminForm>
          </Card>
        </div>
      </div>
    </div>
  );
}
