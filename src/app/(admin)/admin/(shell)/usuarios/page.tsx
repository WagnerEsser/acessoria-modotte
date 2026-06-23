import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/shared/section-heading";
import { teamMembers } from "@/lib/site-data";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Usuarios",
  description: "Controle de acessos e papeis do painel.",
  path: "/admin/usuarios",
  noIndex: true,
});

export default function AdminUsersPage() {
  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Usuarios"
        title="Quem pode editar cada parte do site"
        description="Mesmo sendo um site de baixa escala, o acesso precisa ficar claro e documentado."
      />

      <div className="grid gap-4 md:grid-cols-3">
        {teamMembers.map((member) => (
          <Card key={member.name} className="p-5">
            <Badge variant="outline" className="w-fit normal-case tracking-normal">
              {member.permission}
            </Badge>
            <h2 className="mt-4 font-display text-2xl text-brand-ivory">{member.name}</h2>
            <p className="mt-2 text-sm text-brand-ivory/68">{member.role}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
