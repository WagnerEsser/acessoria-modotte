import { redirect } from "next/navigation";

import { CreateUserModal } from "@/components/admin/create-user-modal";
import { UserListItem } from "@/components/admin/user-list-item";
import { SectionHeading } from "@/components/shared/section-heading";
import { Card } from "@/components/ui/card";
import { buildMetadata } from "@/lib/seo";
import { getVerifiedAdminIdentity } from "@/lib/admin-identity";
import { formatDateTimeBRL } from "@/lib/formatters";
import { createSupabaseRscClient } from "@/lib/supabase/rsc";

export const metadata = buildMetadata({
  title: "Usuários",
  description: "Controle de acessos e papéis do painel.",
  path: "/admin/usuarios",
  noIndex: true,
});

export const dynamic = "force-dynamic";

type UserRecord = {
  id: string;
  full_name: string;
  email: string | null;
  role: "superadmin" | "admin" | "editor";
  is_active: boolean;
  updated_at: string;
};

export default async function AdminUsersPage() {
  const supabase = await createSupabaseRscClient();
  const identity = await getVerifiedAdminIdentity(supabase);
  if (identity.status !== "authenticated" || identity.identity.role !== "superadmin") {
    redirect("/admin/dashboard");
  }

  const { data } = await supabase
    .from("users")
    .select("id, full_name, email, role, is_active, updated_at")
    .order("updated_at", { ascending: false });

  const users = ((data ?? []) as UserRecord[]).sort(
    (first, second) =>
      Number(second.role === "superadmin") - Number(first.role === "superadmin"),
  );

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Usuários"
        title="Quem pode editar cada parte do site"
        description="Gerencie as pessoas que têm acesso ao painel administrativo."
        action={<CreateUserModal action="/api/admin/users" />}
      />

      <div className="space-y-3">
        {users.length ? (
          users.map((member) => (
            <UserListItem
              key={member.id}
              action={"/api/admin/users/" + member.id}
              email={member.email}
              isActive={member.is_active}
              name={member.full_name}
              role={member.role}
              updatedAt={formatDateTimeBRL(member.updated_at)}
            />
          ))
        ) : (
          <Card className="p-6 text-sm text-brand-ivory/68">
            Nenhum usuário cadastrado ainda.
          </Card>
        )}
      </div>
    </div>
  );
}
