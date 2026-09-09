import { ArrowRight, Building2, Inbox } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/shared/section-heading";
import { StatCard } from "@/components/shared/stat-card";
import { formatCurrencyBRL, formatDateTimeBRL } from "@/lib/formatters";
import { getLeadStatusLabel } from "@/lib/lead-status";
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

  const [propertiesResult, leadsResult] = await Promise.all([
    supabase
      .from("properties")
      .select("id, slug, title, transaction_type, property_type, status, is_published, featured, price, price_on_request, city, state, updated_at")
      .order("updated_at", { ascending: false }),
    supabase
      .from("leads")
      .select("id, name, source, interest_type, status, created_at, property:properties(title, slug)")
      .order("created_at", { ascending: false }),
  ]);

  const properties = (propertiesResult.data ?? []) as DashboardProperty[];
  const leads = (leadsResult.data ?? []) as DashboardLead[];

  const publishedProperties = properties.filter((property) => property.is_published);
  const todayLeads = leads.filter((lead) => new Date(lead.created_at) >= today);

  const quickStats = [
    {
      href: "/admin/imoveis",
      label: "Ativos publicados",
      value: String(publishedProperties.length),
      description: "Imóveis visíveis no site público.",
      icon: <Building2 className="size-4" />,
    },
    {
      href: "/admin/leads",
      label: "Leads hoje",
      value: String(todayLeads.length),
      description: "Novos contatos recebidos no dia.",
      icon: <Inbox className="size-4" />,
    },
  ];

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Dashboard"
        title="Visão rápida da operação da assessoria"
        action={
          <Link href="/admin/imoveis" className={buttonVariants({ variant: "gold" })}>
            Gerenciar imóveis
            <ArrowRight className="size-4" />
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-2">
        {quickStats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group block rounded-[2rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/70"
          >
            <StatCard
              label={stat.label}
              value={stat.value}
              description={stat.description}
              icon={stat.icon}
              className="p-4 transition-colors group-hover:border-brand-gold/35 group-hover:bg-brand-ivory/6"
            />
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="order-2 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-brand-beige/55">
            Leads recentes
          </p>
          <div className="mt-5 space-y-4">
            {leads.length ? (
              leads.slice(0, 4).map((lead) => (
                <Link
                  key={lead.id}
                  href={`/admin/leads#lead-${lead.id}`}
                  className="group block w-full rounded-2xl border border-brand-beige/12 bg-brand-ivory/4 p-4 transition hover:border-brand-gold/35 hover:bg-brand-ivory/6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/70"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-brand-ivory">{lead.name}</p>
                      <p className="text-sm text-brand-ivory/64">
                        {lead.interest_type ?? lead.property?.[0]?.title ?? "Contato geral"}
                      </p>
                    </div>
                    <Badge variant="outline" className="normal-case tracking-normal">
                      {getLeadStatusLabel(lead.status)}
                    </Badge>
                  </div>
                  <p className="mt-3 text-xs uppercase tracking-[0.28em] text-brand-beige/55">
                    {formatDateTimeBRL(lead.created_at)}
                  </p>
                </Link>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-brand-beige/18 bg-brand-ivory/4 p-6 text-sm text-brand-ivory/68">
                Nenhum lead recebido ainda.
              </div>
            )}
          </div>
        </Card>

        <Card className="order-1 p-6">
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
