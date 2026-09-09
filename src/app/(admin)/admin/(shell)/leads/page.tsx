import { Card } from "@/components/ui/card";
import { LeadList, type AdminLead } from "@/components/admin/lead-list";
import { SectionHeading } from "@/components/shared/section-heading";
import { formatBrazilianPhoneDisplayNumber } from "@/lib/contact";
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
  const leadItems: AdminLead[] = leads.map((lead) => ({
    id: lead.id,
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    interestType: lead.interest_type ?? lead.property?.[0]?.title ?? "Contato geral",
    status: lead.status,
    message: lead.message,
    createdAt: lead.created_at,
    formattedPhone: lead.phone ? formatBrazilianPhoneDisplayNumber(lead.phone) : null,
    formattedDate: formatDateTimeBRL(lead.created_at),
  }));

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Leads"
        title="Contato gerado pelo site e distribuição do atendimento"
        description="Acompanhe as pessoas que entraram em contato com a assessoria."
      />

      <Card className="p-6">
        <LeadList initialLeads={leadItems} />
      </Card>
    </div>
  );
}
