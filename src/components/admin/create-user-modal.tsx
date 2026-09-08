"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { SubmitButton } from "@/components/ui/submit-button";
import { AdminForm } from "@/components/admin/admin-form";

type CreateUserModalProps = {
  action: string;
};

export function CreateUserModal({ action }: CreateUserModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="button" size="sm" onClick={() => setOpen(true)}>
        <Plus className="size-4" aria-hidden="true" />
        Cadastrar novo usuário
      </Button>

      {open ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-brand-ink/75 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setOpen(false);
          }}
        >
          <div
            className="max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-2xl border border-brand-beige/20 bg-brand-navy p-6 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-user-title"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold">
                  Novo acesso
                </p>
                <h2 id="create-user-title" className="mt-2 font-display text-2xl text-brand-ivory">
                  Cadastrar novo usuário
                </h2>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="size-9 px-0 text-brand-ivory/65"
                onClick={() => setOpen(false)}
                aria-label="Fechar cadastro"
                title="Fechar"
              >
                <X className="size-4" aria-hidden="true" />
              </Button>
            </div>

            <p className="mt-3 text-sm leading-6 text-brand-ivory/70">
              Cadastre uma pessoa para permitir o acesso ao painel administrativo.
            </p>

            <AdminForm
              action={action}
              className="mt-6 grid gap-5 md:grid-cols-2"
              onSuccess={() => setOpen(false)}
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
                <PasswordInput
                  name="password"
                  minLength={14}
                  maxLength={128}
                  autoComplete="new-password"
                  required
                />
                <span className="block text-xs leading-5 text-brand-beige/58">
                  Use ao menos 14 caracteres com maiúscula, minúscula, número e
                  símbolo: ! @ % &amp; * _ -
                </span>
              </label>
              <div className="flex justify-end gap-3 md:col-span-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <SubmitButton pendingLabel="Cadastrando...">
                  Cadastrar usuário
                </SubmitButton>
              </div>
            </AdminForm>
          </div>
        </div>
      ) : null}
    </>
  );
}
