import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";
import { SubmitButton } from "@/components/ui/submit-button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SectionHeading } from "@/components/shared/section-heading";
import { formatDateTimeBRL } from "@/lib/formatters";
import { buildMetadata } from "@/lib/seo";
import { createSupabaseRscClient } from "@/lib/supabase/rsc";
import { getVerifiedAdminIdentity } from "@/lib/admin-identity";

export const metadata = buildMetadata({
  title: "Usuários",
  description: "Controle de acessos e papéis do painel.",
  path: "/admin/usuarios",
  noIndex: true,
});

export const dynamic = "force-dynamic";

type UserRecord = {
  id: string;
  auth_user_id: string;
  full_name: string;
  email: string | null;
  role: "superadmin" | "admin" | "editor";
  is_active: boolean;
  updated_at: string;
};

const errorMessages: Record<string, string> = {
  invalid_input:
    "Revise os dados. A senha precisa ter 14 caracteres, maiúscula, minúscula, número e símbolo.",
  email_in_use: "Já existe uma conta cadastrada com esse e-mail.",
  creation_failed: "Não foi possível criar o usuário. Tente novamente.",
  updated: "Usuário atualizado com sucesso.",
  deleted: "Usuário excluído com sucesso.",
  operation_failed: "Não foi possível concluir a operação.",
  protected_user: "A conta principal não pode ser alterada.",
  not_found: "Usuário não encontrado.",
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const status = Array.isArray(params.status) ? params.status[0] : params.status;
  const error = Array.isArray(params.error) ? params.error[0] : params.error;
  const supabase = await createSupabaseRscClient();
  const identity = await getVerifiedAdminIdentity(supabase);
  if (identity.status !== "authenticated" || identity.identity.role !== "superadmin") redirect("/admin/dashboard");
  const { data } = await supabase
    .from("users")
    .select("id, auth_user_id, full_name, email, role, is_active, updated_at")
    .order("updated_at", { ascending: false });

  const users = (data ?? []) as UserRecord[];

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Usuários"
        title="Quem pode editar cada parte do site"
        description="A tabela users do banco mostra quem tem acesso ao painel."
      />

      <Card className="p-6">
        <h2 className="font-display text-2xl text-brand-ivory">
          Cadastrar novo usuário
        </h2>
        <p className="mt-2 text-sm leading-6 text-brand-ivory/68">
          A nova conta terá o mesmo acesso administrativo ao painel e poderá entrar
          imediatamente com o e-mail e a senha informados.
        </p>

        {status === "created" ? (
          <div className="mt-5 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
            Usuário criado e ativado com sucesso.
          </div>
        ) : null}

        {status === "updated" || status === "deleted" ? (
          <div className="mt-5 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
            {errorMessages[status]}
          </div>
        ) : null}

        {error ? (
          <div className="mt-5 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {errorMessages[error] ?? errorMessages.creation_failed}
          </div>
        ) : null}

        <form
          action="/api/admin/users"
          method="post"
          className="mt-6 grid gap-5 md:grid-cols-2"
        >
          <label className="space-y-2">
            <span className="text-sm text-brand-ivory/78">Nome completo</span>
            <Input
              name="full_name"
              type="text"
              minLength={2}
              maxLength={100}
              autoComplete="name"
              required
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm text-brand-ivory/78">E-mail de acesso</span>
            <Input
              name="email"
              type="email"
              maxLength={254}
              autoComplete="email"
              required
            />
          </label>

          <label className="space-y-2 md:col-span-2">
            <span className="text-sm text-brand-ivory/78">Senha inicial</span>
            <Input
              name="password"
              type="password"
              minLength={14}
              maxLength={128}
              autoComplete="new-password"
              required
            />
            <span className="block text-xs leading-5 text-brand-beige/58">
              Use ao menos 14 caracteres com maiuscula, minuscula, numero e um
              simbolo: ! @ % &amp; * _ -
            </span>
          </label>

          <div className="md:col-span-2">
            <SubmitButton className="cursor-pointer" pendingLabel="Criando usuário...">
              Criar usuário
            </SubmitButton>
          </div>
        </form>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {users.length ? (
          users.map((member) => (
            <Card key={member.id} className="p-5">
              <div className="flex items-center justify-between gap-3">
                <Badge variant="outline" className="w-fit normal-case tracking-normal">
                  {member.role}
                </Badge>
                {member.role !== "superadmin" ? (
                  <form action={`/api/admin/users/${member.id}`} method="post" className="flex items-center gap-2">
                    <input type="hidden" name="action" value="toggle_active" />
                    <label className="relative inline-flex cursor-pointer items-center" title={member.is_active ? "Desativar acesso" : "Ativar acesso"}>
                      <input name="is_active" type="checkbox" className="peer sr-only" defaultChecked={member.is_active} onChange={(event) => event.currentTarget.form?.requestSubmit()} />
                      <span className="h-6 w-11 rounded-full bg-brand-ivory/20 transition peer-checked:bg-brand-gold/80 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-gold/70 after:absolute after:left-1 after:top-1 after:size-4 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-5" />
                    </label>
                    <span className="text-xs text-brand-ivory/65">{member.is_active ? "Ativo" : "Inativo"}</span>
                  </form>
                ) : <Badge variant="gold" className="w-fit normal-case tracking-normal">Superadmin</Badge>}
              </div>
              <h2 className="mt-4 font-display text-2xl text-brand-ivory">{member.full_name}</h2>
              <p className="mt-2 break-all text-sm text-brand-ivory/72">
                {member.email ?? "E-mail não informado"}
              </p>
              <p className="mt-2 text-sm text-brand-ivory/68">
                Atualizado {formatDateTimeBRL(member.updated_at)}
              </p>
              <p className="mt-3 break-all text-xs uppercase tracking-[0.22em] text-brand-beige/55">
                {member.auth_user_id}
              </p>
              {member.role !== "superadmin" ? (
                <div className="mt-5 space-y-3 border-t border-brand-beige/10 pt-4">
                  <form action={`/api/admin/users/${member.id}`} method="post" className="space-y-3">
                    <input type="hidden" name="action" value="update" />
                    <Input name="full_name" defaultValue={member.full_name} aria-label="Nome" required />
                    <Input name="email" type="email" defaultValue={member.email ?? ""} aria-label="E-mail" required />
                    <Input name="password" type="password" placeholder="Nova senha (opcional)" minLength={14} autoComplete="new-password" />
                    <label className="flex items-center gap-2 text-sm text-brand-ivory/70"><input name="is_active" type="checkbox" defaultChecked={member.is_active} className="size-4 accent-brand-gold" /> Usuário ativo</label>
                    <SubmitButton size="sm" pendingLabel="Salvando...">Salvar alterações</SubmitButton>
                  </form>
                  <form action={`/api/admin/users/${member.id}`} method="post"><input type="hidden" name="action" value="delete" /><SubmitButton size="sm" variant="outline" pendingLabel="Excluindo...">Excluir usuário</SubmitButton></form>
                </div>
              ) : null}
            </Card>
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
