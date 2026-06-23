import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/shared/section-heading";
import { recentLeads } from "@/lib/site-data";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Leads",
  description: "Fluxo de leads e atendimento do painel.",
  path: "/admin/leads",
  noIndex: true,
});

export default function AdminLeadsPage() {
  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Leads"
        title="Contato gerado pelo site e distribuicao do atendimento"
        description="O painel agora mostra a visao inicial da esteira comercial."
      />

      <Card className="p-6">
        <div className="grid gap-4">
          {recentLeads.map((lead) => (
            <div
              key={`${lead.name}-${lead.createdAt}`}
              className="flex flex-col gap-3 rounded-2xl border border-brand-beige/12 bg-brand-ivory/4 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium text-brand-ivory">{lead.name}</p>
                <p className="text-sm text-brand-ivory/64">
                  {lead.channel} - {lead.interest}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="gold">{lead.status}</Badge>
                <span className="text-xs uppercase tracking-[0.28em] text-brand-beige/55">
                  {lead.createdAt}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
