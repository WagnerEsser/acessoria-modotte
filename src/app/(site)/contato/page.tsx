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
import {
  getPublicContactChannels,
  getPublicPageBySlug,
  getPublicSiteSettings,
  splitParagraphs,
} from "@/lib/public-content";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type ContactPageProps = {
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
    getPublicPageBySlug("contato"),
  ]);

  if (!page) {
    return buildMetadata({
      title: "Contato",
      description: siteSettings.defaultSeoDescription,
      path: "/contato",
      noIndex: true,
    });
  }

  return buildMetadata({
    title: page.seoTitle ?? page.title,
    description: page.seoDescription ?? page.subtitle ?? siteSettings.defaultSeoDescription,
    path: "/contato",
  });
}

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const [siteSettings, page] = await Promise.all([
    getPublicSiteSettings(),
    getPublicPageBySlug("contato"),
  ]);
  const resolvedSearchParams = await searchParams;
  const submitted = getFirstValue(resolvedSearchParams.submitted) === "1";
  const error = getFirstValue(resolvedSearchParams.error);

  const contactChannels = getPublicContactChannels(siteSettings);
  const pageParagraphs = splitParagraphs(page?.body);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="space-y-10">
        <SectionHeading
          eyebrow="Contato"
          title={page?.title ?? "Fale com a assessoria e encaminhe sua demanda"}
          description={
            page?.subtitle ??
            pageParagraphs[0] ??
            "Os contatos abaixo vêm do painel e podem ser atualizados sem alterar o código."
          }
        />

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="p-6">
            <Badge variant="gold">Canais</Badge>
            <div className="mt-6 space-y-4">
              {contactChannels.map((channel) => (
                <a
                  key={channel.label}
                  href={channel.href}
                  className="block rounded-2xl border border-brand-beige/12 bg-brand-ivory/4 p-4 transition hover:border-brand-gold/30 hover:bg-brand-ivory/6"
                >
                  <p className="text-xs uppercase tracking-[0.28em] text-brand-beige/55">
                    {channel.label}
                  </p>
                  <p className="mt-2 font-numeric text-2xl text-brand-ivory">
                    {channel.value}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-brand-ivory/70">{channel.note}</p>
                </a>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            {submitted ? (
              <div className="mb-5 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm leading-6 text-emerald-100">
                Mensagem enviada com sucesso. A equipe vai retornar em breve.
              </div>
            ) : null}

            {error ? (
              <div className="mb-5 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-100">
                Não foi possível enviar o formulário. Verifique os campos e tente novamente.
              </div>
            ) : null}

            {pageParagraphs.length ? (
              <div className="space-y-4">
                <p className="text-xs uppercase tracking-[0.3em] text-brand-beige/55">
                  Conteúdo da página
                </p>
                <div className="space-y-3 text-sm leading-7 text-brand-ivory/72">
                  {pageParagraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </div>
            ) : null}

            <form action="/api/leads" method="post" className="mt-6 space-y-5">
              <input type="hidden" name="redirect_to" value="/contato" />
              <input type="hidden" name="source" value="contato" />
              <input type="hidden" name="page_slug" value="contato" />
              <input type="hidden" name="website" value="" />

              <div className="grid gap-4 sm:grid-cols-2">
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
                  name="interest_type"
                  placeholder="Interesse principal"
                  defaultValue="Contato geral"
                  required
                />
                <Textarea
                  name="message"
                  className="sm:col-span-2"
                  placeholder="Conte sua necessidade"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" size="lg">
                  Enviar mensagem
                  <ArrowRight className="size-4" />
                </Button>
                <Link href="/quero-vender" className={buttonVariants({ variant: "outline" })}>
                  Quero vender
                </Link>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
