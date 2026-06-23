import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/shared/section-heading";
import { formatDateTimeBRL } from "@/lib/formatters";
import { buildMetadata } from "@/lib/seo";
import { createSupabaseRscClient } from "@/lib/supabase/rsc";

export const metadata = buildMetadata({
  title: "Usuarios",
  description: "Controle de acessos e papeis do painel.",
  path: "/admin/usuarios",
  noIndex: true,
});

export const dynamic = "force-dynamic";

type UserRecord = {
  id: string;
  auth_user_id: string;
  full_name: string;
  role: "admin" | "editor";
  is_active: boolean;
  updated_at: string;
};

export default async function AdminUsersPage() {
  const supabase = await createSupabaseRscClient();
  const { data } = await supabase
    .from("users")
    .select("id, auth_user_id, full_name, role, is_active, updated_at")
    .order("updated_at", { ascending: false });

  const users = (data ?? []) as UserRecord[];

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Usuarios"
        title="Quem pode editar cada parte do site"
        description="A tabela users do banco mostra quem tem acesso ao painel."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {users.length ? (
          users.map((member) => (
            <Card key={member.id} className="p-5">
              <div className="flex items-center justify-between gap-3">
                <Badge variant="outline" className="w-fit normal-case tracking-normal">
                  {member.role}
                </Badge>
                <Badge variant={member.is_active ? "gold" : "outline"} className="w-fit normal-case tracking-normal">
                  {member.is_active ? "Ativo" : "Inativo"}
                </Badge>
              </div>
              <h2 className="mt-4 font-display text-2xl text-brand-ivory">{member.full_name}</h2>
              <p className="mt-2 text-sm text-brand-ivory/68">
                Atualizado {formatDateTimeBRL(member.updated_at)}
              </p>
              <p className="mt-3 break-all text-xs uppercase tracking-[0.22em] text-brand-beige/55">
                {member.auth_user_id}
              </p>
            </Card>
          ))
        ) : (
          <Card className="p-6 text-sm text-brand-ivory/68">
            Nenhum usuario cadastrado ainda.
          </Card>
        )}
      </div>
    </div>
  );
}
