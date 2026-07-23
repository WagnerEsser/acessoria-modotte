import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SectionHeading } from "@/components/shared/section-heading";
import { formatDateTimeBRL } from "@/lib/formatters";
import { buildMetadata } from "@/lib/seo";
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
  auth_user_id: string;
  full_name: string;
  email: string | null;
  role: "admin" | "editor";
  is_active: boolean;
  updated_at: string;
};

const errorMessages: Record<string, string> = {
  invalid_input:
    "Revise os dados. A senha precisa ter 14 caracteres, maiuscula, minuscula, numero e simbolo.",
  email_in_use: "Ja existe uma conta cadastrada com esse e-mail.",
  creation_failed: "Nao foi possivel criar o usuario. Tente novamente.",
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
          Cadastrar novo usuario
        </h2>
        <p className="mt-2 text-sm leading-6 text-brand-ivory/68">
          A nova conta tera o mesmo acesso administrativo ao painel e podera entrar
          imediatamente com o e-mail e a senha informados.
        </p>

        {status === "created" ? (
          <div className="mt-5 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
            Usuario criado e ativado com sucesso.
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
            <Button type="submit" className="cursor-pointer">
              Criar usuario
            </Button>
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
                <Badge variant={member.is_active ? "gold" : "outline"} className="w-fit normal-case tracking-normal">
                  {member.is_active ? "Ativo" : "Inativo"}
                </Badge>
              </div>
              <h2 className="mt-4 font-display text-2xl text-brand-ivory">{member.full_name}</h2>
              <p className="mt-2 break-all text-sm text-brand-ivory/72">
                {member.email ?? "E-mail nao informado"}
              </p>
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
            Nenhum usuário cadastrado ainda.
          </Card>
        )}
      </div>
    </div>
  );
}
