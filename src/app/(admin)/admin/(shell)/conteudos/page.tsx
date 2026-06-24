import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SectionHeading } from "@/components/shared/section-heading";
import {
  formatBrazilianPhoneDisplayNumber,
  getWhatsAppDisplayNumber,
} from "@/lib/contact";
import { formatDateTimeBRL } from "@/lib/formatters";
import { getPublicSiteSettings } from "@/lib/public-content";
import { buildMetadata } from "@/lib/seo";
import { createSupabaseRscClient } from "@/lib/supabase/rsc";

export const metadata = buildMetadata({
  title: "Conteúdos",
  description: "Textos institucionais, contatos principais e blocos editáveis do site.",
  path: "/admin/conteudos",
  noIndex: true,
});

export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

type PageRecord = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  body: string | null;
  page_type: string;
  is_published: boolean;
  seo_title: string | null;
  seo_description: string | null;
  updated_at: string;
};

type PageBlockRecord = {
  id: string;
  page_id: string;
  block_key: string;
  title: string | null;
  content: string | null;
  sort_order: number;
  is_active: boolean;
};

type AdminContentPageProps = {
  searchParams: Promise<SearchParams>;
};

const ABOUT_BLOCK_KEYS = [
  "atendimento-direto",
  "leitura-de-perfil",
  "seguranca-documental",
] as const;

const SERVICE_BLOCK_KEYS = [
  "compra-assistida",
  "venda-estrategica",
  "analise-documental",
] as const;

function getFirstValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function getInstagramInputValue(value: string | undefined) {
  if (!value) {
    return "";
  }

  const match = value.match(/instagram\.com\/([^/?#]+)/i);

  if (match?.[1]) {
    return match[1];
  }

  return value.replace(/^@/, "");
}

function getPageBlocks(blocks: PageBlockRecord[], pageId: string | undefined) {
  if (!pageId) {
    return [];
  }

  return blocks
    .filter((block) => block.page_id === pageId)
    .sort((left, right) => left.sort_order - right.sort_order);
}

function getBlock(blocks: PageBlockRecord[], blockKey: string) {
  return blocks.find((block) => block.block_key === blockKey) ?? null;
}

export default async function AdminContentPage({ searchParams }: AdminContentPageProps) {
  const resolvedSearchParams = await searchParams;
  const status = getFirstValue(resolvedSearchParams.status);
  const error = getFirstValue(resolvedSearchParams.error);

  const [siteSettings, supabase] = await Promise.all([
    getPublicSiteSettings(),
    createSupabaseRscClient(),
  ]);

  const { data: pagesData } = await supabase
    .from("pages")
    .select("id, slug, title, subtitle, body, page_type, is_published, seo_title, seo_description, updated_at")
    .order("updated_at", { ascending: false });

  const pages = (pagesData ?? []) as PageRecord[];
  const pageIds = pages.map((page) => page.id);
  const { data: pageBlocksData } = pageIds.length
    ? await supabase
        .from("page_blocks")
        .select("id, page_id, block_key, title, content, sort_order, is_active")
        .in("page_id", pageIds)
        .order("sort_order", { ascending: true })
    : { data: [] };

  const pageBlocks = (pageBlocksData ?? []) as PageBlockRecord[];
  const whatsappNumberDisplay = siteSettings.whatsappNumber
    ? getWhatsAppDisplayNumber(siteSettings.whatsappNumber)
    : "";
  const primaryPhoneDisplay = siteSettings.primaryPhone
    ? formatBrazilianPhoneDisplayNumber(siteSettings.primaryPhone)
    : "";
  const instagramDisplay = getInstagramInputValue(siteSettings.socialLinks.instagram);
  const aboutPage = pages.find((page) => page.slug === "sobre") ?? null;
  const aboutBlocks = getPageBlocks(pageBlocks, aboutPage?.id);
  const servicesPage = pages.find((page) => page.slug === "servicos") ?? null;
  const serviceBlocks = getPageBlocks(pageBlocks, servicesPage?.id);

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Conteúdos"
        title="Contato principal, sobre e serviços em edição centralizada"
        description="Esses dados entram como seed no banco e continuam editáveis pelo painel administrativo."
      />

      {status === "updated" ? (
        <Card className="border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm leading-6 text-emerald-100">
          Conteúdo salvo com sucesso.
        </Card>
      ) : null}

      {error ? (
        <Card className="border border-red-400/30 bg-red-500/10 p-4 text-sm leading-6 text-red-100">
          Não foi possível salvar os dados. Revise os campos e tente novamente.
        </Card>
      ) : null}

      <Card className="space-y-6 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-brand-beige/55">
              Contato e marca
            </p>
            <h2 className="font-display text-3xl text-brand-ivory">
              Dados principais da assessoria
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-brand-ivory/68">
              WhatsApp, telefone, e-mail, Instagram e frase institucional passam a sair do banco.
            </p>
          </div>

          <Badge
            variant={siteSettings.whatsappNumber || siteSettings.email ? "gold" : "outline"}
            className="normal-case tracking-normal"
          >
            {siteSettings.whatsappNumber || siteSettings.email ? "Configurado" : "Pendente"}
          </Badge>
        </div>

        <form action="/api/admin/site-settings" method="post" className="space-y-5">
          <input type="hidden" name="redirect_to" value="/admin/conteudos" />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.28em] text-brand-beige/55">
                WhatsApp
              </p>
              <Input
                name="whatsapp_number"
                placeholder="+55 47 99999-9999"
                defaultValue={whatsappNumberDisplay}
                autoComplete="tel"
                inputMode="tel"
              />
            </div>

            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.28em] text-brand-beige/55">
                Telefone principal
              </p>
              <Input
                name="primary_phone"
                placeholder="+55 47 99999-9999"
                defaultValue={primaryPhoneDisplay}
                autoComplete="tel"
                inputMode="tel"
              />
            </div>

            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.28em] text-brand-beige/55">
                E-mail de contato
              </p>
              <Input
                name="email"
                type="email"
                placeholder="luana.modotte@gmail.com"
                defaultValue={siteSettings.email ?? ""}
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.28em] text-brand-beige/55">
                Instagram
              </p>
              <Input
                name="instagram"
                placeholder="luana.modotte"
                defaultValue={instagramDisplay}
                autoComplete="off"
              />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.28em] text-brand-beige/55">
              Frase de impacto
            </p>
            <Textarea
              name="impact_phrase"
              rows={3}
              defaultValue={siteSettings.impactPhrase}
              placeholder="Texto institucional curto da marca"
            />
          </div>

          <Button type="submit" size="lg">
            Salvar dados principais
          </Button>
        </form>
      </Card>

      <Card className="space-y-6 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-brand-beige/55">Página</p>
            <h2 className="font-display text-3xl text-brand-ivory">Sobre</h2>
            <p className="max-w-2xl text-sm leading-6 text-brand-ivory/68">
              Texto institucional e os três blocos de direção exibidos na página pública.
            </p>
          </div>

          <Badge
            variant={aboutPage?.is_published ? "gold" : "outline"}
            className="normal-case tracking-normal"
          >
            {aboutPage?.is_published ? "Publicado" : "Rascunho"}
          </Badge>
        </div>

        <form action="/api/admin/pages/sobre" method="post" className="space-y-5">
          <input type="hidden" name="redirect_to" value="/admin/conteudos" />
          <input type="hidden" name="page_type" value="institutional" />
          <input type="hidden" name="is_published" value="true" />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.28em] text-brand-beige/55">Título</p>
              <Input
                name="title"
                defaultValue={aboutPage?.title ?? "Sobre a assessoria"}
                placeholder="Sobre a assessoria"
              />
            </div>

            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.28em] text-brand-beige/55">
                Subtítulo
              </p>
              <Input
                name="subtitle"
                defaultValue={aboutPage?.subtitle ?? ""}
                placeholder="Resumo curto da proposta da assessoria"
              />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.28em] text-brand-beige/55">
              Texto principal
            </p>
            <Textarea
              name="body"
              rows={8}
              defaultValue={aboutPage?.body ?? ""}
              placeholder="Texto institucional da página Sobre"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {ABOUT_BLOCK_KEYS.map((blockKey, index) => {
              const block = getBlock(aboutBlocks, blockKey);

              return (
                <div key={blockKey} className="space-y-2">
                  <input type="hidden" name={`block_${index + 1}_key`} value={blockKey} />
                  <p className="text-xs uppercase tracking-[0.28em] text-brand-beige/55">
                    Direção {index + 1}
                  </p>
                  <Input
                    name={`block_${index + 1}_title`}
                    defaultValue={block?.title ?? ""}
                    placeholder={`Direção ${index + 1}`}
                  />
                  <input type="hidden" name={`block_${index + 1}_content`} value={block?.content ?? ""} />
                </div>
              );
            })}
          </div>

          <Button type="submit" size="lg">
            Salvar página Sobre
          </Button>
        </form>

        {aboutPage?.updated_at ? (
          <p className="text-sm leading-6 text-brand-ivory/64">
            Última atualização: {formatDateTimeBRL(aboutPage.updated_at)}
          </p>
        ) : null}
      </Card>

      <Card className="space-y-6 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-brand-beige/55">Página</p>
            <h2 className="font-display text-3xl text-brand-ivory">Serviços</h2>
            <p className="max-w-2xl text-sm leading-6 text-brand-ivory/68">
              Introdução da página e os cards de serviços exibidos no site.
            </p>
          </div>

          <Badge
            variant={servicesPage?.is_published ? "gold" : "outline"}
            className="normal-case tracking-normal"
          >
            {servicesPage?.is_published ? "Publicado" : "Rascunho"}
          </Badge>
        </div>

        <form action="/api/admin/pages/servicos" method="post" className="space-y-5">
          <input type="hidden" name="redirect_to" value="/admin/conteudos" />
          <input type="hidden" name="page_type" value="services" />
          <input type="hidden" name="is_published" value="true" />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.28em] text-brand-beige/55">Título</p>
              <Input
                name="title"
                defaultValue={servicesPage?.title ?? "Serviços essenciais"}
                placeholder="Serviços essenciais"
              />
            </div>

            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.28em] text-brand-beige/55">
                Subtítulo
              </p>
              <Input
                name="subtitle"
                defaultValue={servicesPage?.subtitle ?? ""}
                placeholder="Resumo curto dos serviços"
              />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.28em] text-brand-beige/55">
              Texto principal
            </p>
            <Textarea
              name="body"
              rows={6}
              defaultValue={servicesPage?.body ?? ""}
              placeholder="Texto institucional da página de serviços"
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            {SERVICE_BLOCK_KEYS.map((blockKey, index) => {
              const block = getBlock(serviceBlocks, blockKey);

              return (
                <div key={blockKey} className="space-y-3 rounded-2xl border border-brand-beige/10 bg-brand-ivory/4 p-4">
                  <input type="hidden" name={`block_${index + 1}_key`} value={blockKey} />
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.28em] text-brand-beige/55">
                      Serviço {index + 1}
                    </p>
                    <Input
                      name={`block_${index + 1}_title`}
                      defaultValue={block?.title ?? ""}
                      placeholder={`Título do serviço ${index + 1}`}
                    />
                  </div>
                  <Textarea
                    name={`block_${index + 1}_content`}
                    rows={5}
                    defaultValue={block?.content ?? ""}
                    placeholder="Descreva o serviço"
                  />
                </div>
              );
            })}
          </div>

          <Button type="submit" size="lg">
            Salvar página Serviços
          </Button>
        </form>

        {servicesPage?.updated_at ? (
          <p className="text-sm leading-6 text-brand-ivory/64">
            Última atualização: {formatDateTimeBRL(servicesPage.updated_at)}
          </p>
        ) : null}
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {pages.length ? (
          pages.map((page) => {
            const isSeoComplete =
              Boolean(page.seo_title?.trim()) && Boolean(page.seo_description?.trim());

            return (
              <Card key={page.id} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-brand-ivory">{page.title}</p>
                    <p className="text-sm text-brand-ivory/64">
                      {page.page_type} - /{page.slug}
                    </p>
                  </div>
                  <Badge
                    variant={page.is_published ? "gold" : "outline"}
                    className="normal-case tracking-normal"
                  >
                    {page.is_published ? "Publicado" : "Rascunho"}
                  </Badge>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Badge
                    variant={isSeoComplete ? "gold" : "outline"}
                    className="normal-case tracking-normal"
                  >
                    {isSeoComplete ? "SEO completo" : "SEO pendente"}
                  </Badge>
                  <span className="text-xs uppercase tracking-[0.28em] text-brand-beige/55">
                    Atualizado {formatDateTimeBRL(page.updated_at)}
                  </span>
                </div>
              </Card>
            );
          })
        ) : (
          <Card className="p-6 text-sm text-brand-ivory/68">
            Nenhuma página cadastrada ainda.
          </Card>
        )}
      </div>
    </div>
  );
}
