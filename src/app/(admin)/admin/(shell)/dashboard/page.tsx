import { ArrowRight, Building2, Inbox, Layers3, Sparkles } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/shared/section-heading";
import { StatCard } from "@/components/shared/stat-card";
import { formatCurrencyBRL, formatDateTimeBRL } from "@/lib/formatters";
import { buildMetadata } from "@/lib/seo";
import { createSupabaseRscClient } from "@/lib/supabase/rsc";

export const metadata = buildMetadata({
  title: "Dashboard administrativo",
  description: "Resumo operacional do painel da assessoria imobiliária.",
  path: "/admin/dashboard",
  noIndex: true,
});

export const dynamic = "force-dynamic";

type DashboardProperty = {
  id: string;
  slug: string;
  title: string;
  transaction_type: string;
  property_type: string;
  status: string;
  is_published: boolean;
  featured: boolean;
  price: number | string | null;
  price_on_request: boolean;
  city: string | null;
  state: string | null;
  updated_at: string;
};

type DashboardLead = {
  id: string;
  name: string;
  source: string | null;
  interest_type: string | null;
  status: string;
  created_at: string;
  property: { title: string; slug: string }[] | null;
};

type DashboardPage = {
  id: string;
  title: string;
  slug: string;
  page_type: string;
  is_published: boolean;
  seo_title: string | null;
  seo_description: string | null;
  updated_at: string;
};

type DashboardUser = {
  id: string;
  full_name: string;
  role: string;
  is_active: boolean;
  updated_at: string;
};

function getPropertyPriceLabel(property: DashboardProperty): string {
  if (property.price_on_request) {
    return "Sob consulta";
  }

  return formatCurrencyBRL(property.price);
}

export default async function DashboardPage() {
  const supabase = await createSupabaseRscClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    propertiesResult,
    leadsResult,
    pagesResult,
    pageBlocksResult,
    usersResult,
  ] = await Promise.all([
    supabase
      .from("properties")
      .select("id, slug, title, transaction_type, property_type, status, is_published, featured, price, price_on_request, city, state, updated_at")
      .order("updated_at", { ascending: false }),
    supabase
      .from("leads")
      .select("id, name, source, interest_type, status, created_at, property:properties(title, slug)")
      .order("created_at", { ascending: false }),
    supabase
      .from("pages")
      .select("id, title, slug, page_type, is_published, seo_title, seo_description, updated_at")
      .order("updated_at", { ascending: false }),
    supabase
      .from("page_blocks")
      .select("id, block_key, title, is_active, updated_at")
      .order("updated_at", { ascending: false }),
    supabase
      .from("users")
      .select("id, full_name, role, is_active, updated_at")
      .order("updated_at", { ascending: false }),
  ]);

  const properties = (propertiesResult.data ?? []) as DashboardProperty[];
  const leads = (leadsResult.data ?? []) as DashboardLead[];
  const pages = (pagesResult.data ?? []) as DashboardPage[];
  const pageBlocks = pageBlocksResult.data ?? [];
  const users = (usersResult.data ?? []) as DashboardUser[];

  const publishedProperties = properties.filter((property) => property.is_published);
  const todayLeads = leads.filter((lead) => new Date(lead.created_at) >= today);
  const activePageBlocks = pageBlocks.filter((block) => block.is_active);
  const publishedPages = pages.filter((page) => page.is_published);
  const seoReadyPages = publishedPages.filter(
    (page) => Boolean(page.seo_title?.trim()) && Boolean(page.seo_description?.trim())
  );
  const seoPercent = publishedPages.length
    ? Math.round((seoReadyPages.length / publishedPages.length) * 100)
    : 0;

  const quickStats = [
    {
      label: "Ativos publicados",
      value: String(publishedProperties.length),
      description: "Imóveis visíveis no site público.",
      icon: <Building2 className="size-4" />,
    },
    {
      label: "Leads hoje",
      value: String(todayLeads.length),
      description: "Novos contatos recebidos no dia.",
      icon: <Inbox className="size-4" />,
    },
    {
      label: "Blocos editáveis",
      value: String(activePageBlocks.length),
      description: "Conteúdos e seções controlados no banco.",
      icon: <Layers3 className="size-4" />,
    },
    {
      label: "SEO pronto",
      value: `${seoPercent}%`,
      description: "Páginas publicadas com title e description.",
      icon: <Sparkles className="size-4" />,
    },
  ];

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Dashboard"
        title="Visão rápida da operação da assessoria"
        description="Agora os indicadores e listas vêm do banco real, então o painel passa a refletir o estado atual do projeto."
        action={
          <Link href="/admin/imoveis" className={buttonVariants({ variant: "gold" })}>
            Gerenciar imóveis
            <ArrowRight className="size-4" />
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {quickStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-brand-beige/55">
                Conteúdo recente
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold text-brand-ivory">
                Páginas publicadas e em revisão
              </h2>
            </div>
            <Badge variant="gold">{pages.length} registros</Badge>
          </div>

          <div className="mt-6 space-y-4">
            {pages.slice(0, 4).length ? (
              pages.slice(0, 4).map((page) => {
                const isComplete = Boolean(page.seo_title?.trim()) && Boolean(page.seo_description?.trim());

                return (
                  <div
                    key={page.id}
                    className="rounded-2xl border border-brand-beige/12 bg-brand-ivory/4 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-brand-ivory">{page.title}</p>
                        <p className="mt-1 text-sm text-brand-ivory/64">
                          {page.page_type} - /{page.slug}
                        </p>
                      </div>
                      <Badge variant={page.is_published ? "gold" : "outline"}>
                        {page.is_published ? "Publicado" : "Rascunho"}
                      </Badge>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Badge variant={isComplete ? "gold" : "outline"} className="normal-case tracking-normal">
                        {isComplete ? "SEO completo" : "SEO pendente"}
                      </Badge>
                      <span className="text-xs uppercase tracking-[0.28em] text-brand-beige/55">
                        Atualizado {formatDateTimeBRL(page.updated_at)}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-2xl border border-dashed border-brand-beige/18 bg-brand-ivory/4 p-6 text-sm text-brand-ivory/68">
                Nenhuma página cadastrada ainda.
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-brand-beige/55">
            Equipe e acesso
          </p>
          <div className="mt-5 space-y-4">
            {users.length ? (
              users.slice(0, 4).map((member) => (
                <div
                  key={member.id}
                  className="rounded-2xl border border-brand-beige/12 bg-brand-ivory/4 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-brand-ivory">{member.full_name}</p>
                      <p className="text-sm text-brand-ivory/64">{member.role}</p>
                    </div>
                    <Badge variant={member.is_active ? "gold" : "outline"} className="normal-case tracking-normal">
                      {member.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  <p className="mt-3 text-xs uppercase tracking-[0.28em] text-brand-beige/55">
                    Atualizado {formatDateTimeBRL(member.updated_at)}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-brand-beige/18 bg-brand-ivory/4 p-6 text-sm text-brand-ivory/68">
                Nenhum usuário cadastrado ainda.
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-brand-beige/55">
            Leads recentes
          </p>
          <div className="mt-5 space-y-4">
            {leads.length ? (
              leads.slice(0, 4).map((lead) => (
                <div
                  key={lead.id}
                  className="rounded-2xl border border-brand-beige/12 bg-brand-ivory/4 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-brand-ivory">{lead.name}</p>
                      <p className="text-sm text-brand-ivory/64">
                        {lead.source ?? "Site"} - {lead.interest_type ?? lead.property?.[0]?.title ?? "Contato geral"}
                      </p>
                    </div>
                    <Badge variant="outline" className="normal-case tracking-normal">
                      {lead.status}
                    </Badge>
                  </div>
                  <p className="mt-3 text-xs uppercase tracking-[0.28em] text-brand-beige/55">
                    {formatDateTimeBRL(lead.created_at)}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-brand-beige/18 bg-brand-ivory/4 p-6 text-sm text-brand-ivory/68">
                Nenhum lead recebido ainda.
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-brand-beige/55">
            Imóveis recentes
          </p>
          <div className="mt-5 space-y-4">
            {properties.length ? (
              properties.slice(0, 4).map((property) => (
                <div
                  key={property.id}
                  className="rounded-2xl border border-brand-beige/12 bg-brand-ivory/4 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-brand-ivory">{property.title}</p>
                      <p className="text-sm text-brand-ivory/64">
                        {property.property_type} - {property.city ?? "Cidade"} {property.state ? `/${property.state}` : ""}
                      </p>
                    </div>
                    <Badge variant={property.is_published ? "gold" : "outline"} className="normal-case tracking-normal">
                      {property.is_published ? "Publicado" : "Rascunho"}
                    </Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="normal-case tracking-normal">
                      {property.featured ? "Destaque" : "Padrão"}
                    </Badge>
                    <span className="text-xs uppercase tracking-[0.28em] text-brand-beige/55">
                      {property.transaction_type}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-brand-ivory/72">
                    {getPropertyPriceLabel(property)} - atualizado {formatDateTimeBRL(property.updated_at)}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-brand-beige/18 bg-brand-ivory/4 p-6 text-sm text-brand-ivory/68">
                Nenhum imóvel cadastrado ainda.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
