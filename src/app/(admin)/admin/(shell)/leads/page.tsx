import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/shared/section-heading";
import { formatDateTimeBRL } from "@/lib/formatters";
import { buildMetadata } from "@/lib/seo";
import { createSupabaseRscClient } from "@/lib/supabase/rsc";

export const metadata = buildMetadata({
  title: "Leads",
  description: "Fluxo de leads e atendimento do painel.",
  path: "/admin/leads",
  noIndex: true,
});

export const dynamic = "force-dynamic";

type LeadRecord = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  source: string | null;
  interest_type: string | null;
  status: string;
  message: string | null;
  created_at: string;
  property: { title: string; slug: string }[] | null;
};

export default async function AdminLeadsPage() {
  const supabase = await createSupabaseRscClient();
  const { data } = await supabase
    .from("leads")
    .select("id, name, email, phone, source, interest_type, status, message, created_at, property:properties(title, slug)")
    .order("created_at", { ascending: false });

  const leads = (data ?? []) as LeadRecord[];

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Leads"
        title="Contato gerado pelo site e distribuição do atendimento"
        description="Os contatos exibidos aqui agora saem da tabela leads do banco."
      />

      <Card className="p-6">
        <div className="grid gap-4">
          {leads.length ? (
            leads.map((lead) => (
              <div
                key={lead.id}
                className="flex flex-col gap-3 rounded-2xl border border-brand-beige/12 bg-brand-ivory/4 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-1">
                  <p className="font-medium text-brand-ivory">{lead.name}</p>
                  <p className="text-sm text-brand-ivory/64">
                    {lead.source ?? "Site"} - {lead.interest_type ?? lead.property?.[0]?.title ?? "Contato geral"}
                  </p>
                  <p className="text-xs uppercase tracking-[0.24em] text-brand-beige/55">
                    {lead.email ?? "Sem e-mail"} {lead.phone ? `- ${lead.phone}` : ""}
                  </p>
                </div>
                <div className="flex flex-col items-start gap-3 sm:items-end">
                  <Badge variant="gold">{lead.status}</Badge>
                  <span className="text-xs uppercase tracking-[0.28em] text-brand-beige/55">
                    {formatDateTimeBRL(lead.created_at)}
                  </span>
                </div>
                {lead.message ? (
                  <p className="max-w-2xl text-sm leading-6 text-brand-ivory/72">
                    {lead.message}
                  </p>
                ) : null}
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-brand-beige/18 bg-brand-ivory/4 p-6 text-sm text-brand-ivory/68">
              Nenhum lead recebido ainda.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
