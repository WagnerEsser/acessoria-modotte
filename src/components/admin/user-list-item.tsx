"use client";

import { Pencil, X } from "lucide-react";
import { useState } from "react";

import { DeleteUserButton } from "@/components/admin/delete-user-button";
import { UserActiveToggle } from "@/components/admin/user-active-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { SubmitButton } from "@/components/ui/submit-button";
import { AdminForm } from "@/components/admin/admin-form";

type UserListItemProps = {
  action: string;
  email: string | null;
  isActive: boolean;
  name: string;
  role: "superadmin" | "admin" | "editor";
  updatedAt: string;
};

const roleLabels = {
  admin: "Administrador",
  editor: "Editor",
  superadmin: "Superadmin",
} as const;

export function UserListItem({
  action,
  email,
  isActive,
  name,
  role,
  updatedAt,
}: UserListItemProps) {
  const [editing, setEditing] = useState(false);
  const isSuperadmin = role === "superadmin";

  return (
    <Card
      className={
        isSuperadmin
          ? "border-brand-gold/25 bg-brand-gold/[0.04] p-4"
          : "p-4"
      }
    >
      {editing ? (
        <AdminForm
          action={action}
          className="flex flex-1 flex-col gap-4 lg:flex-row lg:items-end"
          onSuccess={() => setEditing(false)}
        >
          <input type="hidden" name="action" value="update" />
          <label className="min-w-0 flex-1 space-y-2">
            <span className="ml-1 block text-xs text-brand-ivory/60">Nome completo</span>
            <Input name="full_name" defaultValue={name} required />
          </label>
          <label className="min-w-0 flex-1 space-y-2">
            <span className="ml-1 block text-xs text-brand-ivory/60">E-mail</span>
            <Input name="email" type="email" defaultValue={email ?? ""} required />
          </label>
          <label className="min-w-0 flex-1 space-y-2">
            <span className="ml-1 block text-xs text-brand-ivory/60">Nova senha</span>
            <PasswordInput
              name="password"
              placeholder="Opcional"
              minLength={14}
              maxLength={128}
              autoComplete="new-password"
              toggleClassName="text-brand-ivory/65 hover:bg-brand-ivory/8 hover:text-brand-ivory"
            />
          </label>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="size-9 px-0"
              onClick={() => setEditing(false)}
              aria-label="Cancelar edição"
              title="Cancelar edição"
            >
              <X className="size-4" aria-hidden="true" />
            </Button>
            <SubmitButton size="sm" pendingLabel="Salvando...">
              Salvar
            </SubmitButton>
          </div>
        </AdminForm>
      ) : (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="min-w-0 flex-1 lg:min-w-[15rem]">
            <h2 className="truncate font-display text-xl text-brand-ivory">{name}</h2>
            <p className="mt-1 truncate text-sm text-brand-ivory/68">
              {email ?? "E-mail não informado"}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {isSuperadmin ? (
              <Badge variant="gold" className="normal-case tracking-normal">
                {roleLabels[role]}
              </Badge>
            ) : (
              <UserActiveToggle action={action} isActive={isActive} />
            )}
          </div>
          <p className="shrink-0 text-xs text-brand-ivory/50 lg:w-36 lg:text-right">
            Atualizado em {updatedAt}
          </p>
          {!isSuperadmin ? (
            <div className="flex shrink-0 items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="size-9 px-0 text-brand-ivory/65 hover:text-brand-gold"
                onClick={() => setEditing(true)}
                aria-label={`Editar usuário ${name}`}
                title="Editar usuário"
              >
                <Pencil className="size-4" aria-hidden="true" />
              </Button>
              <DeleteUserButton action={action} userName={name} />
            </div>
          ) : null}
        </div>
      )}
    </Card>
  );
}
