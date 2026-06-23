import { ArrowRight, Building2, Inbox, Layers3, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/shared/section-heading";
import { StatCard } from "@/components/shared/stat-card";
import { adminMetrics, contentBlocks, recentLeads, teamMembers } from "@/lib/site-data";
import { buildMetadata } from "@/lib/seo";
import Link from "next/link";

export const metadata = buildMetadata({
  title: "Dashboard administrativo",
  description: "Resumo operacional do painel da assessoria imobiliaria.",
  path: "/admin/dashboard",
  noIndex: true,
});

const quickStats = [
  {
    label: "Ativos publicados",
    value: "31",
    description: "Imoveis e paginas prontas para o site publico.",
    icon: <Building2 className="size-4" />,
  },
  {
    label: "Leads hoje",
    value: "8",
    description: "Volume recente de contatos e distribuicao do atendimento.",
    icon: <Inbox className="size-4" />,
  },
  {
    label: "Blocos editaveis",
    value: "12",
    description: "Conteudo institucional e banners com controle central.",
    icon: <Layers3 className="size-4" />,
  },
  {
    label: "SEO pronto",
    value: "94%",
    description: "Titulos, descriptions e estrutura base alinhados.",
    icon: <Sparkles className="size-4" />,
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Dashboard"
        title="Visao rapida da operacao da assessoria"
        description="A tela junta indicadores, ajustes de conteudo e fluxo de leads para o dono da assessoria ter leitura imediata."
        action={
          <Link href="/admin/imoveis" className={buttonVariants({ variant: "gold" })}>
            Gerenciar imoveis
            <ArrowRight className="size-4" />
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {quickStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-brand-beige/55">
                Metricas do produto
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold text-brand-ivory">
                Base pronto para operar em baixa escala
              </h2>
            </div>
            <Badge variant="gold">Atualizado agora</Badge>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {adminMetrics.map((metric) => (
              <Card key={metric.label} className="p-4">
                <p className="text-xs uppercase tracking-[0.28em] text-brand-beige/55">
                  {metric.label}
                </p>
                <div className="mt-2 font-display text-3xl text-brand-ivory">
                  {metric.value}
                </div>
                <p className="mt-3 text-sm leading-6 text-brand-ivory/68">
                  {metric.description}
                </p>
              </Card>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-brand-beige/55">
            Equipe
          </p>
          <div className="mt-5 space-y-4">
            {teamMembers.map((member) => (
              <div
                key={member.name}
                className="rounded-2xl border border-brand-beige/12 bg-brand-ivory/4 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-brand-ivory">{member.name}</p>
                    <p className="text-sm text-brand-ivory/64">{member.role}</p>
                  </div>
                  <Badge variant="outline" className="normal-case tracking-normal">
                    {member.permission}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-brand-beige/55">
            Conteudos recentes
          </p>
          <div className="mt-5 space-y-4">
            {contentBlocks.map((block) => (
              <div
                key={block.name}
                className="flex items-center justify-between gap-4 rounded-2xl border border-brand-beige/12 bg-brand-ivory/4 p-4"
              >
                <div>
                  <p className="font-medium text-brand-ivory">{block.name}</p>
                  <p className="text-sm text-brand-ivory/64">Atualizado {block.updatedAt}</p>
                </div>
                <Badge variant="gold">{block.status}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-brand-beige/55">
            Leituras recentes
          </p>
          <div className="mt-5 space-y-4">
            {recentLeads.map((lead) => (
              <div
                key={`${lead.name}-${lead.createdAt}`}
                className="rounded-2xl border border-brand-beige/12 bg-brand-ivory/4 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-brand-ivory">{lead.name}</p>
                    <p className="text-sm text-brand-ivory/64">
                      {lead.channel} - {lead.interest}
                    </p>
                  </div>
                  <Badge variant="outline" className="normal-case tracking-normal">
                    {lead.status}
                  </Badge>
                </div>
                <p className="mt-3 text-xs uppercase tracking-[0.28em] text-brand-beige/55">
                  {lead.createdAt}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
